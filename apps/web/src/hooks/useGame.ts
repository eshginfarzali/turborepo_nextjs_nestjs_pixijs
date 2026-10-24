'use client';

import type {
  ClientToServerEvents,
  GameErrorPayload,
  GameState,
  ServerToClientEvents,
} from '@repo/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from '../lib/config';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Owns the Socket.IO connection and mirrors the server's game state. */
export function useGame() {
  const socketRef = useRef<GameSocket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<GameErrorPayload | null>(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string>();

  useEffect(() => {
    const socket: GameSocket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setMyId(socket.id);
    });
    socket.on('disconnect', () => {
      setConnected(false);
      setState(null);
    });
    socket.on('gameState', (next) => {
      setState(next);
      setError(null);
    });
    socket.on('gameError', setError);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const join = useCallback((roomId: string, name: string) => {
    socketRef.current?.emit('joinRoom', { roomId, name });
  }, []);

  const move = useCallback(
    (index: number) => {
      if (state)
        socketRef.current?.emit('makeMove', { roomId: state.roomId, index });
    },
    [state],
  );

  const restart = useCallback(() => {
    if (state) socketRef.current?.emit('restartGame', { roomId: state.roomId });
  }, [state]);

  const leave = useCallback(() => {
    if (state) socketRef.current?.emit('leaveRoom', { roomId: state.roomId });
    setState(null);
  }, [state]);

  return { state, error, connected, myId, join, move, restart, leave };
}
