'use client';

import type { Board } from '@repo/shared';
import { Application, Graphics } from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import CellButtons from './CellButtons';

const SIZE = 300;
const CELL = SIZE / 3;
const PADDING = 22;
const COLORS = {
  background: 0xffffff,
  grid: 0x1f2937,
  x: 0x2563eb,
  o: 0xdc2626,
  highlight: 0xfef08a,
};

interface Props {
  board: Board;
  winningLine: number[] | null;
  disabled: boolean;
  onCellClick: (index: number) => void;
}

function draw(app: Application, board: Board, winningLine: number[] | null) {
  for (const child of app.stage.removeChildren()) {
    child.destroy();
  }
  const g = new Graphics();

  for (const index of winningLine ?? []) {
    g.rect((index % 3) * CELL, Math.floor(index / 3) * CELL, CELL, CELL).fill(
      COLORS.highlight,
    );
  }

  for (let i = 1; i < 3; i++) {
    g.moveTo(i * CELL, 0).lineTo(i * CELL, SIZE);
    g.moveTo(0, i * CELL).lineTo(SIZE, i * CELL);
  }
  g.stroke({ width: 4, color: COLORS.grid });

  board.forEach((cell, index) => {
    const x = (index % 3) * CELL;
    const y = Math.floor(index / 3) * CELL;
    if (cell === 'X') {
      g.moveTo(x + PADDING, y + PADDING)
        .lineTo(x + CELL - PADDING, y + CELL - PADDING)
        .moveTo(x + CELL - PADDING, y + PADDING)
        .lineTo(x + PADDING, y + CELL - PADDING)
        .stroke({ width: 8, color: COLORS.x, cap: 'round' });
    } else if (cell === 'O') {
      g.circle(x + CELL / 2, y + CELL / 2, CELL / 2 - PADDING).stroke({
        width: 8,
        color: COLORS.o,
      });
    }
  });

  app.stage.addChild(g);
}

export default function GameBoard({
  board,
  winningLine,
  disabled,
  onCellClick,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<Application | null>(null);

  // Pixi v8 initialises asynchronously; guard against unmount (and React
  // Strict Mode's double effect) before init resolves.
  useEffect(() => {
    const instance = new Application();
    let cancelled = false;
    let mounted = false;

    void instance
      .init({
        width: SIZE,
        height: SIZE,
        background: COLORS.background,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      .then(() => {
        if (cancelled) {
          instance.destroy(true, { children: true });
          return;
        }
        hostRef.current?.appendChild(instance.canvas);
        mounted = true;
        setApp(instance);
      });

    return () => {
      cancelled = true;
      if (mounted) {
        instance.destroy(true, { children: true });
      }
      setApp(null);
    };
  }, []);

  useEffect(() => {
    if (app) draw(app, board, winningLine);
  }, [app, board, winningLine]);

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <div ref={hostRef} aria-hidden />
      <CellButtons
        board={board}
        disabled={disabled}
        onCellClick={onCellClick}
      />
    </div>
  );
}
