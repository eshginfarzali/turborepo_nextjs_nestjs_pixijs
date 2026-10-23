'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import GameBoard from '../components/GameBoard';
import JoinForm from '../components/JoinForm';
import OpenGames from '../components/OpenGames';
import { useGame } from '../hooks/useGame';
import { isMyTurn, statusMessage } from '../lib/status';

export default function Home() {
  const { state, error, connected, myId, join, move, restart, leave } =
    useGame();
  const [roomId, setRoomId] = useState('');
  const me = state?.players.find((p) => p.id === myId);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Tic-Tac-Toe
        </Typography>
        <Chip
          size="small"
          color={connected ? 'success' : 'default'}
          label={connected ? 'Connected' : 'Connecting…'}
        />
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {!state ? (
        <Stack spacing={3}>
          <JoinForm
            roomId={roomId}
            onRoomIdChange={setRoomId}
            onJoin={join}
            disabled={!connected}
          />
          <Divider />
          <Typography variant="h6" component="h2">
            Open rooms
          </Typography>
          <OpenGames onPick={setRoomId} />
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Typography color="text.secondary">
            Room <strong>{state.roomId}</strong> (share it)
            {me ? ` · you are ${me.mark}` : ''}
          </Typography>
          <Typography variant="h6" component="p" role="status">
            {statusMessage(state, myId)}
          </Typography>
          <Box>
            <GameBoard
              board={state.board}
              winningLine={state.winningLine}
              disabled={!isMyTurn(state, myId)}
              onCellClick={move}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            {(state.status === 'won' || state.status === 'draw') && (
              <Button variant="contained" onClick={restart}>
                Play again
              </Button>
            )}
            <Button onClick={leave}>Leave room</Button>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
