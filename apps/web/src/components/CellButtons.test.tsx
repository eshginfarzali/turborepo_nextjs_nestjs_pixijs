import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CellButtons from './CellButtons';

afterEach(cleanup);

const board = ['X', null, null, null, 'O', null, null, null, null] as const;

describe('CellButtons', () => {
  it('labels every cell and sends the index of an empty cell', () => {
    const onCellClick = vi.fn();
    render(
      <CellButtons
        board={[...board]}
        disabled={false}
        onCellClick={onCellClick}
      />,
    );

    expect(screen.getAllByRole('gridcell')).toHaveLength(9);
    fireEvent.click(screen.getByLabelText('Row 1, column 2: empty'));

    expect(onCellClick).toHaveBeenCalledWith(1);
  });

  it('disables occupied cells and the whole board when it is not my turn', () => {
    const { rerender } = render(
      <CellButtons board={[...board]} disabled={false} onCellClick={vi.fn()} />,
    );
    expect(
      (screen.getByLabelText('Row 1, column 1: X') as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    rerender(<CellButtons board={[...board]} disabled onCellClick={vi.fn()} />);
    const cells = screen.getAllByRole('gridcell') as HTMLButtonElement[];
    expect(cells.every((cell) => cell.disabled)).toBe(true);
  });
});
