import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type {
  ClientToServerEvents,
  GameErrorPayload,
  GameState,
  ServerToClientEvents,
} from '@repo/shared';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { io, type Socket } from 'socket.io-client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Resolves with the next `gameState` matching the predicate. */
const nextState = (
  client: Client,
  predicate: (state: GameState) => boolean = () => true,
) =>
  new Promise<GameState>((resolve) => {
    const listener = (state: GameState) => {
      if (predicate(state)) {
        client.off('gameState', listener);
        resolve(state);
      }
    };
    client.on('gameState', listener);
  });

const nextError = (client: Client) =>
  new Promise<GameErrorPayload>((resolve) => client.once('gameError', resolve));

describe('Game gateway + GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let url: string;
  const clients: Client[] = [];

  const connect = async () => {
    const client: Client = io(url, {
      transports: ['websocket'],
      forceNew: true,
    });
    clients.push(client);
    await new Promise<void>((resolve) => client.once('connect', resolve));
    return client;
  };

  /** Two connected players in a started room; alice is X. */
  const startGame = async (roomId: string) => {
    const alice = await connect();
    const bob = await connect();
    const started = nextState(alice, (s) => s.status === 'playing');
    alice.emit('joinRoom', { roomId, name: 'Alice' });
    await nextState(alice);
    bob.emit('joinRoom', { roomId, name: 'Bob' });
    await started;
    return { alice, bob };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    const server = app.getHttpServer() as unknown as Server;
    const { port } = server.address() as AddressInfo;
    url = `http://127.0.0.1:${port}`;
  });

  afterEach(() => {
    clients.splice(0).forEach((client) => client.disconnect());
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports health', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  it('plays a full game and broadcasts the win to both players', async () => {
    const { alice, bob } = await startGame('e2e-win');

    // X: 0, 1, 2 (top row) — O: 3, 4
    const moves: [Client, number][] = [
      [alice, 0],
      [bob, 3],
      [alice, 1],
      [bob, 4],
    ];
    for (const [player, index] of moves) {
      const applied = nextState(alice, (s) => s.board[index] !== null);
      player.emit('makeMove', { roomId: 'e2e-win', index });
      await applied;
    }

    const aliceSeesWin = nextState(alice, (s) => s.status === 'won');
    const bobSeesWin = nextState(bob, (s) => s.status === 'won');
    alice.emit('makeMove', { roomId: 'e2e-win', index: 2 });

    const [a, b] = await Promise.all([aliceSeesWin, bobSeesWin]);
    expect(a).toEqual(b);
    expect(a.winner).toBe('X');
    expect(a.winningLine).toEqual([0, 1, 2]);
  });

  it('rejects an out-of-turn move only for the sender', async () => {
    const { alice, bob } = await startGame('e2e-turn');
    const aliceGotState = jest.fn();
    alice.on('gameState', aliceGotState);

    const error = nextError(bob);
    bob.emit('makeMove', { roomId: 'e2e-turn', index: 0 });

    await expect(error).resolves.toMatchObject({ code: 'NOT_YOUR_TURN' });
    expect(aliceGotState).not.toHaveBeenCalled();
  });

  it('rejects a third player and invalid payloads', async () => {
    await startGame('e2e-full');
    const carol = await connect();

    const full = nextError(carol);
    carol.emit('joinRoom', { roomId: 'e2e-full', name: 'Carol' });
    await expect(full).resolves.toMatchObject({ code: 'ROOM_FULL' });

    const bad = nextError(carol);
    carol.emit('joinRoom', { roomId: 'not valid!', name: 'Carol' });
    await expect(bad).resolves.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('puts the room back to waiting when a player disconnects', async () => {
    const { alice, bob } = await startGame('e2e-leave');

    const waiting = nextState(alice, (s) => s.status === 'waiting');
    bob.disconnect();

    const state = await waiting;
    expect(state.players.map((p) => p.name)).toEqual(['Alice']);
  });

  it('lists rooms waiting for an opponent over GraphQL', async () => {
    const host = await connect();
    const joined = nextState(host);
    host.emit('joinRoom', { roomId: 'e2e-lobby', name: 'Host' });
    await joined;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:
          '{ openGames { roomId status players { name mark } } game(roomId: "e2e-lobby") { turn board } }',
      })
      .expect(200);

    const { data } = res.body as {
      data: { openGames: unknown[]; game: unknown };
    };
    expect(data.openGames).toContainEqual({
      roomId: 'e2e-lobby',
      status: 'waiting',
      players: [{ name: 'Host', mark: 'X' }],
    });
    expect(data.game).toEqual({
      turn: 'X',
      board: Array(9).fill(null),
    });
  });
});
