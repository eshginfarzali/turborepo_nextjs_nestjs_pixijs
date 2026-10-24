import type { GameState, Player } from '@repo/shared';

const label = (player: Player | undefined, myId: string | undefined) =>
  !player ? 'Opponent' : player.id === myId ? 'You' : player.name;

/** Human-readable status line for the current player. */
export function statusMessage(
  state: GameState,
  myId: string | undefined,
): string {
  const byMark = (mark: string) => state.players.find((p) => p.mark === mark);

  switch (state.status) {
    case 'waiting':
      return 'Waiting for an opponent to join…';
    case 'draw':
      return "It's a draw.";
    case 'won': {
      const winner = byMark(state.winner ?? '');
      return winner?.id === myId
        ? 'You won! 🎉'
        : `${label(winner, myId)} won.`;
    }
    case 'playing': {
      const next = byMark(state.turn);
      return next?.id === myId
        ? `Your turn (${state.turn})`
        : `${label(next, myId)}'s turn (${state.turn})`;
    }
  }
}

export const isMyTurn = (state: GameState, myId: string | undefined) =>
  state.status === 'playing' &&
  state.players.some((p) => p.id === myId && p.mark === state.turn);

export const randomRoomId = () =>
  Math.random().toString(36).slice(2).padEnd(6, '0').slice(0, 6);
