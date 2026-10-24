import { Injectable } from '@nestjs/common';
import {
  applyMove,
  createGame,
  GameError,
  type GameState,
  joinGame,
  leaveGame,
  restart,
} from '@repo/shared';

/** In-memory room registry. One socket can be in at most one room. */
@Injectable()
export class GameService {
  private readonly games = new Map<string, GameState>();
  private readonly roomByPlayer = new Map<string, string>();

  list(): GameState[] {
    return [...this.games.values()];
  }

  get(roomId: string): GameState | undefined {
    return this.games.get(roomId);
  }

  /**
   * Joins a room, creating it if needed. If the player was in another room,
   * that room's updated state is returned in `left` so it can be broadcast.
   */
  join(
    roomId: string,
    player: { id: string; name: string },
  ): { game: GameState; left?: GameState } {
    const current = this.games.get(roomId) ?? createGame(roomId);
    const game = joinGame(current, player);

    const previousRoom = this.roomByPlayer.get(player.id);
    const left =
      previousRoom && previousRoom !== roomId
        ? this.leave(player.id)
        : undefined;

    this.games.set(roomId, game);
    this.roomByPlayer.set(player.id, roomId);
    return { game, left };
  }

  move(roomId: string, playerId: string, index: number): GameState {
    return this.update(roomId, (game) => applyMove(game, playerId, index));
  }

  restart(roomId: string, playerId: string): GameState {
    return this.update(roomId, (game) => {
      if (!game.players.some((p) => p.id === playerId)) {
        throw new GameError(
          'NOT_IN_GAME',
          'You are not a player in this room.',
        );
      }
      return restart(game);
    });
  }

  /** Removes the player from their room. Empty rooms are deleted. */
  leave(playerId: string): GameState | undefined {
    const roomId = this.roomByPlayer.get(playerId);
    this.roomByPlayer.delete(playerId);
    const game = roomId ? this.games.get(roomId) : undefined;
    if (!roomId || !game) {
      return undefined;
    }

    const next = leaveGame(game, playerId);
    if (next.players.length === 0) {
      this.games.delete(roomId);
    } else {
      this.games.set(roomId, next);
    }
    return next;
  }

  private update(
    roomId: string,
    change: (game: GameState) => GameState,
  ): GameState {
    const game = this.games.get(roomId);
    if (!game) {
      throw new GameError('NOT_IN_GAME', `Room ${roomId} does not exist.`);
    }
    const next = change(game);
    this.games.set(roomId, next);
    return next;
  }
}
