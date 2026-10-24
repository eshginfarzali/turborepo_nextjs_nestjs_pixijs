import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  type ClientToServerEvents,
  GameError,
  type GameErrorPayload,
  type GameState,
  type ServerToClientEvents,
} from '@repo/shared';
import type { Server, Socket } from 'socket.io';
import { corsOrigins } from '../config';
import { GameService } from './game.service';
import {
  InvalidPayloadError,
  parseJoinRoomPayload,
  parseMakeMovePayload,
  parseRoomPayload,
} from './payloads';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway({ cors: { origin: corsOrigins() } })
export class GameGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  server!: GameServer;

  constructor(private readonly games: GameService) {}

  @SubscribeMessage('joinRoom')
  handleJoin(
    @ConnectedSocket() client: GameSocket,
    @MessageBody() body: unknown,
  ) {
    this.handle(client, () => {
      const { roomId, name } = parseJoinRoomPayload(body);
      const { game, left } = this.games.join(roomId, { id: client.id, name });

      if (left) {
        void client.leave(left.roomId);
        this.broadcast(left);
      }
      void client.join(roomId);
      this.broadcast(game);
    });
  }

  @SubscribeMessage('makeMove')
  handleMove(
    @ConnectedSocket() client: GameSocket,
    @MessageBody() body: unknown,
  ) {
    this.handle(client, () => {
      const { roomId, index } = parseMakeMovePayload(body);
      this.broadcast(this.games.move(roomId, client.id, index));
    });
  }

  @SubscribeMessage('restartGame')
  handleRestart(
    @ConnectedSocket() client: GameSocket,
    @MessageBody() body: unknown,
  ) {
    this.handle(client, () => {
      const { roomId } = parseRoomPayload(body);
      this.broadcast(this.games.restart(roomId, client.id));
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeave(@ConnectedSocket() client: GameSocket) {
    this.handle(client, () => this.leave(client));
  }

  handleDisconnect(client: GameSocket) {
    this.leave(client);
  }

  private leave(client: GameSocket) {
    const game = this.games.leave(client.id);
    if (game) {
      void client.leave(game.roomId);
      this.broadcast(game);
    }
  }

  private broadcast(game: GameState) {
    this.server.to(game.roomId).emit('gameState', game);
  }

  /** Runs a handler and reports rule violations to the sender only. */
  private handle(client: GameSocket, action: () => void) {
    try {
      action();
    } catch (error) {
      const payload = this.toErrorPayload(error);
      if (!payload) {
        this.logger.error(error);
        throw error;
      }
      client.emit('gameError', payload);
    }
  }

  private toErrorPayload(error: unknown): GameErrorPayload | undefined {
    if (error instanceof GameError) {
      return { code: error.code, message: error.message };
    }
    if (error instanceof InvalidPayloadError) {
      return { code: 'BAD_REQUEST', message: error.message };
    }
    return undefined;
  }
}
