export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = Cell[];
export type GameStatus = 'waiting' | 'playing' | 'won' | 'draw';

export interface Player {
  id: string;
  name: string;
  mark: Mark;
}

export interface GameState {
  roomId: string;
  board: Board;
  players: Player[];
  turn: Mark;
  status: GameStatus;
  winner: Mark | null;
  winningLine: number[] | null;
}

export const BOARD_SIZE = 9;

export const WINNING_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export type GameErrorCode =
  | 'ROOM_FULL'
  | 'NOT_IN_GAME'
  | 'GAME_NOT_ACTIVE'
  | 'NOT_YOUR_TURN'
  | 'INVALID_CELL'
  | 'CELL_TAKEN';

export class GameError extends Error {
  constructor(
    public readonly code: GameErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => null);

export function createGame(roomId: string): GameState {
  return {
    roomId,
    board: createEmptyBoard(),
    players: [],
    turn: 'X',
    status: 'waiting',
    winner: null,
    winningLine: null,
  };
}

export function findWinner(
  board: Board,
): { winner: Mark; line: number[] } | null {
  for (const [a, b, c] of WINNING_LINES) {
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { winner: mark, line: [a, b, c] };
    }
  }
  return null;
}

/** Adds a player as X (first) or O (second). Re-joining with the same id is a no-op. */
export function joinGame(
  state: GameState,
  player: { id: string; name: string },
): GameState {
  if (state.players.some((p) => p.id === player.id)) {
    return state;
  }
  if (state.players.length >= 2) {
    throw new GameError(
      'ROOM_FULL',
      `Room ${state.roomId} already has two players.`,
    );
  }

  const takenMarks = new Set(state.players.map((p) => p.mark));
  const mark: Mark = takenMarks.has('X') ? 'O' : 'X';
  const players = [...state.players, { ...player, mark }];

  return players.length === 2
    ? { ...restart(state), players, status: 'playing' }
    : { ...state, players };
}

/** Removes a player; the remaining player waits for a new opponent on a fresh board. */
export function leaveGame(state: GameState, playerId: string): GameState {
  const players = state.players.filter((p) => p.id !== playerId);
  if (players.length === state.players.length) {
    return state;
  }
  return { ...restart(state), players, status: 'waiting' };
}

export function applyMove(
  state: GameState,
  playerId: string,
  index: number,
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new GameError('NOT_IN_GAME', 'You are not a player in this room.');
  }
  if (state.status !== 'playing') {
    throw new GameError('GAME_NOT_ACTIVE', 'The game is not in progress.');
  }
  if (player.mark !== state.turn) {
    throw new GameError('NOT_YOUR_TURN', `It is ${state.turn}'s turn.`);
  }
  if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
    throw new GameError('INVALID_CELL', `Cell ${index} is out of range.`);
  }
  if (state.board[index] !== null) {
    throw new GameError('CELL_TAKEN', `Cell ${index} is already taken.`);
  }

  const board = state.board.map((cell, i) =>
    i === index ? player.mark : cell,
  );
  const result = findWinner(board);

  if (result) {
    return {
      ...state,
      board,
      status: 'won',
      winner: result.winner,
      winningLine: result.line,
    };
  }
  if (board.every((cell) => cell !== null)) {
    return { ...state, board, status: 'draw' };
  }
  return { ...state, board, turn: player.mark === 'X' ? 'O' : 'X' };
}

/** Clears the board for a new round, keeping the players. X always starts. */
export function restart(state: GameState): GameState {
  return {
    ...state,
    board: createEmptyBoard(),
    turn: 'X',
    status: state.players.length === 2 ? 'playing' : 'waiting',
    winner: null,
    winningLine: null,
  };
}
