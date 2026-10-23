import { GameError } from '@repo/shared';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    service = new GameService();
  });

  it('creates a room on first join and starts it on the second', () => {
    expect(service.join('r1', { id: 'a', name: 'Alice' }).game.status).toBe(
      'waiting',
    );
    expect(service.join('r1', { id: 'b', name: 'Bob' }).game.status).toBe(
      'playing',
    );
    expect(service.list()).toHaveLength(1);
  });

  it('applies moves to the stored game', () => {
    service.join('r1', { id: 'a', name: 'Alice' });
    service.join('r1', { id: 'b', name: 'Bob' });

    service.move('r1', 'a', 4);

    expect(service.get('r1')?.board[4]).toBe('X');
    expect(service.get('r1')?.turn).toBe('O');
  });

  it('moves a player out of their previous room when they join another', () => {
    service.join('r1', { id: 'a', name: 'Alice' });
    service.join('r1', { id: 'b', name: 'Bob' });

    const { game, left } = service.join('r2', { id: 'a', name: 'Alice' });

    expect(game.roomId).toBe('r2');
    expect(left?.roomId).toBe('r1');
    expect(service.get('r1')?.players.map((p) => p.name)).toEqual(['Bob']);
  });

  it('deletes a room when its last player leaves', () => {
    service.join('r1', { id: 'a', name: 'Alice' });

    const game = service.leave('a');

    expect(game?.players).toEqual([]);
    expect(service.get('r1')).toBeUndefined();
  });

  it('returns undefined when an unknown player leaves', () => {
    expect(service.leave('ghost')).toBeUndefined();
  });

  it('only lets players restart their room', () => {
    service.join('r1', { id: 'a', name: 'Alice' });
    service.join('r1', { id: 'b', name: 'Bob' });

    expect(() => service.restart('r1', 'zoe')).toThrow(GameError);
    expect(service.restart('r1', 'a').status).toBe('playing');
  });

  it('rejects moves in rooms that do not exist', () => {
    expect(() => service.move('nope', 'a', 0)).toThrow(GameError);
  });
});
