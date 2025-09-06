'use client';
import { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import GameBoard from '../components/GameBoard';

export default function Home() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>🎮 Tic-Tac-Toe</Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) setJoined(true);
          }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ ml: 2 }}>
            Join
          </Button>
        </form>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <GameBoard />
    </Container>
  );
}
