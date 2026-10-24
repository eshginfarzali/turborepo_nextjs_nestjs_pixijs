import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createGame,
  findWinner,
  GameError,
  type GameState,
  joinGame,
  leaveGame,
  restart,
} from './game';

const alice = { id: 'a', name: 'Alice' };
const bob = { id: 'b', name: 'Bob' };

const startedGame = (): GameState =>
  joinGame(joinGame(createGame('room-1'), alice), bob);

/** Plays alternating moves starting with X (alice). */
const play = (state: GameState, cells: number[]) =>
  cells.reduce(
    (s, cell, i) => applyMove(s, i % 2 === 0 ? alice.id : bob.id, cell),
    state,
  );

const expectGameError = (fn: () => unknown, code: GameError['code']) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(GameError);
    expect((error as GameError).code).toBe(code);
    return;
  }
  throw new Error(`Expected GameError ${code}`);
};

describe('joinGame', () => {
  it('waits for a second player, then starts with X to move', () => {
    const one = joinGame(createGame('room-1'), alice);
    expect(one.status).toBe('waiting');
    expect(one.players).toEqual([{ ...alice, mark: 'X' }]);

    const two = joinGame(one, bob);
    expect(two.status).toBe('playing');
    expect(two.turn).toBe('X');
    expect(two.players.map((p) => p.mark)).toEqual(['X', 'O']);
  });

  it('is idempotent for a player who is already in the room', () => {
    const state = startedGame();
    expect(joinGame(state, alice)).toBe(state);
  });

  it('rejects a third player', () => {
    expectGameError(
      () => joinGame(startedGame(), { id: 'c', name: 'Carol' }),
      'ROOM_FULL',
    );
  });

  it('gives the free mark to a player who joins after someone left', () => {
    const afterLeave = leaveGame(startedGame(), alice.id);
    const rejoined = joinGame(afterLeave, { id: 'c', name: 'Carol' });
    expect(rejoined.players).toEqual([
      { ...bob, mark: 'O' },
      { id: 'c', name: 'Carol', mark: 'X' },
    ]);
  });
});

describe('applyMove', () => {
  it('places the mark and passes the turn', () => {
    const state = applyMove(startedGame(), alice.id, 4);
    expect(state.board[4]).toBe('X');
    expect(state.turn).toBe('O');
    expect(state.status).toBe('playing');
  });

  it('does not mutate the previous state', () => {
    const before = startedGame();
    applyMove(before, alice.id, 0);
    expect(before.board.every((c) => c === null)).toBe(true);
  });

  it.each([
    ['row', [0, 3, 1, 4, 2], [0, 1, 2]],
    ['column', [0, 1, 3, 4, 6], [0, 3, 6]],
    ['diagonal', [0, 1, 4, 2, 8], [0, 4, 8]],
    ['anti-diagonal', [2, 0, 4, 1, 6], [2, 4, 6]],
  ])('detects a %s win', (_name, moves, line) => {
    const state = play(startedGame(), moves);
    expect(state.status).toBe('won');
    expect(state.winner).toBe('X');
    expect(state.winningLine).toEqual(line);
  });

  it('lets O win too', () => {
    const state = play(startedGame(), [0, 3, 1, 4, 8, 5]);
    expect(state.winner).toBe('O');
  });

  it('detects a draw on a full board without a line', () => {
    // X O X / X O O / O X X
    const state = play(startedGame(), [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(state.status).toBe('draw');
    expect(state.winner).toBeNull();
  });

  it('prefers a win over a draw when the last move completes a line', () => {
    // X O X / O X O / O X X → the last move (8) fills the board and wins
    const state = play(startedGame(), [0, 1, 2, 3, 4, 5, 7, 6, 8]);
    expect(state.status).toBe('won');
  });

  it('rejects moves out of turn', () => {
    expectGameError(() => applyMove(startedGame(), bob.id, 0), 'NOT_YOUR_TURN');
  });

  it('rejects a taken cell', () => {
    const state = applyMove(startedGame(), alice.id, 0);
    expectGameError(() => applyMove(state, bob.id, 0), 'CELL_TAKEN');
  });

  it.each([-1, 9, 1.5, Number.NaN])('rejects invalid cell %p', (cell) => {
    expectGameError(
      () => applyMove(startedGame(), alice.id, cell),
      'INVALID_CELL',
    );
  });

  it('rejects moves from spectators and before the game starts', () => {
    expectGameError(() => applyMove(startedGame(), 'zoe', 0), 'NOT_IN_GAME');
    const waiting = joinGame(createGame('r'), alice);
    expectGameError(() => applyMove(waiting, alice.id, 0), 'GAME_NOT_ACTIVE');
  });

  it('rejects moves after the game is over', () => {
    const won = play(startedGame(), [0, 3, 1, 4, 2]);
    expectGameError(() => applyMove(won, bob.id, 8), 'GAME_NOT_ACTIVE');
  });
});

describe('restart and leaveGame', () => {
  it('restart clears the board and keeps players', () => {
    const state = restart(play(startedGame(), [0, 3, 1, 4, 2]));
    expect(state.status).toBe('playing');
    expect(state.board.every((c) => c === null)).toBe(true);
    expect(state.winner).toBeNull();
    expect(state.players).toHaveLength(2);
  });

  it('leaving resets the board and waits for a new opponent', () => {
    const state = leaveGame(applyMove(startedGame(), alice.id, 0), bob.id);
    expect(state.status).toBe('waiting');
    expect(state.players).toEqual([{ ...alice, mark: 'X' }]);
    expect(state.board[0]).toBeNull();
  });

  it('leaving is a no-op for unknown players', () => {
    const state = startedGame();
    expect(leaveGame(state, 'nobody')).toBe(state);
  });
});

describe('findWinner', () => {
  it('returns null for an empty board', () => {
    expect(findWinner(createGame('r').board)).toBeNull();
  });
});
