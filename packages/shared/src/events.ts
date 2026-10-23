import type { GameErrorCode, GameState } from './game';

export interface JoinRoomPayload {
  roomId: string;
  name: string;
}

export interface MakeMovePayload {
  roomId: string;
  index: number;
}

export interface RoomPayload {
  roomId: string;
}

export interface GameErrorPayload {
  code: GameErrorCode | 'BAD_REQUEST';
  message: string;
}

/** Socket.IO events the browser sends to the API. */
export interface ClientToServerEvents {
  joinRoom: (payload: JoinRoomPayload) => void;
  makeMove: (payload: MakeMovePayload) => void;
  restartGame: (payload: RoomPayload) => void;
  leaveRoom: (payload: RoomPayload) => void;
}

/** Socket.IO events the API broadcasts to clients. */
export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  gameError: (error: GameErrorPayload) => void;
}
