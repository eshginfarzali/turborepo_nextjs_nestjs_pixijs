'use client'; // mütləq

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function GameBoard() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        // DOM mount olub olmadığını yoxla
        if (!containerRef.current) return;

        const app = new PIXI.Application({
            width: 300,
            height: 300,
            backgroundColor: 0xffffff,
        });
        appRef.current = app;

        containerRef.current.appendChild(app.view); // undefined olmayacaq

        // draw grid
        const g = new PIXI.Graphics();
        g.lineStyle(4, 0x000000, 1);
        for (let i = 1; i < 3; i++) {
            g.moveTo(i * 100, 0).lineTo(i * 100, 300);
            g.moveTo(0, i * 100).lineTo(300, i * 100);
        }
        app.stage.addChild(g);

        return () => {
            app.destroy(true, { children: true });
            appRef.current = null;
        };
    }, []);

    return <div ref={containerRef} />;
}
