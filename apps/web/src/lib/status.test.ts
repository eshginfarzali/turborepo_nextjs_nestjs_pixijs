import { applyMove, createGame, type GameState, joinGame } from '@repo/shared';
import { describe, expect, it } from 'vitest';
import { isMyTurn, statusMessage } from './status';

const game = (): GameState =>
  joinGame(joinGame(createGame('r'), { id: 'me', name: 'Me' }), {
    id: 'them',
    name: 'Bob',
  });

describe('statusMessage', () => {
  it('describes whose turn it is from my point of view', () => {
    expect(statusMessage(game(), 'me')).toBe('Your turn (X)');
    expect(statusMessage(game(), 'them')).toBe("Me's turn (X)");
    expect(statusMessage(applyMove(game(), 'me', 0), 'me')).toBe(
      "Bob's turn (O)",
    );
  });

  it('describes waiting, win and draw states', () => {
    expect(
      statusMessage(joinGame(createGame('r'), { id: 'me', name: 'Me' }), 'me'),
    ).toBe('Waiting for an opponent to join…');

    const won = [0, 3, 1, 4, 2].reduce(
      (s, cell, i) => applyMove(s, i % 2 ? 'them' : 'me', cell),
      game(),
    );
    expect(statusMessage(won, 'me')).toBe('You won! 🎉');
    expect(statusMessage(won, 'them')).toBe('Me won.');

    expect(statusMessage({ ...game(), status: 'draw' }, 'me')).toBe(
      "It's a draw.",
    );
  });
});

describe('isMyTurn', () => {
  it('is true only for the player whose mark is to move', () => {
    expect(isMyTurn(game(), 'me')).toBe(true);
    expect(isMyTurn(game(), 'them')).toBe(false);
    expect(isMyTurn(game(), undefined)).toBe(false);
  });
});
