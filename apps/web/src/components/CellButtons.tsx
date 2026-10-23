import type { Board } from '@repo/shared';

interface Props {
  board: Board;
  disabled: boolean;
  onCellClick: (index: number) => void;
}

/**
 * Transparent, keyboard-accessible buttons laid over the Pixi canvas.
 * The canvas only draws; all input goes through these buttons.
 */
export default function CellButtons({ board, disabled, onCellClick }: Props) {
  return (
    <div
      role="grid"
      aria-label="Tic-tac-toe board"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      {board.map((cell, index) => {
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-label={`Row ${row}, column ${col}: ${cell ?? 'empty'}`}
            disabled={disabled || cell !== null}
            onClick={() => onCellClick(index)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: disabled || cell ? 'default' : 'pointer',
            }}
          />
        );
      })}
    </div>
  );
}
