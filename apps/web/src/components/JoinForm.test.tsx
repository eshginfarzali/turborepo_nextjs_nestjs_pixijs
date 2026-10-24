import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JoinForm from './JoinForm';

afterEach(cleanup);

describe('JoinForm', () => {
  it('joins with a trimmed name once both fields are valid', () => {
    const onJoin = vi.fn();
    render(
      <JoinForm roomId="abc123" onRoomIdChange={vi.fn()} onJoin={onJoin} />,
    );
    const join = screen.getByRole('button', {
      name: 'Join',
    }) as HTMLButtonElement;

    expect(join.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: '  Ann ' },
    });
    fireEvent.click(join);

    expect(onJoin).toHaveBeenCalledWith('abc123', 'Ann');
  });

  it('creates a new room id when the room field is empty', () => {
    const onJoin = vi.fn();
    render(<JoinForm roomId="" onRoomIdChange={vi.fn()} onJoin={onJoin} />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Ann' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(onJoin).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-z0-9]{6}$/),
      'Ann',
    );
  });

  it('blocks room ids the server would reject', () => {
    render(
      <JoinForm roomId="bad id!" onRoomIdChange={vi.fn()} onJoin={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Ann' },
    });

    expect(screen.getByText('Letters, digits, - and _ only')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: 'Join' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
