'use client';

import { Button, Stack, TextField } from '@mui/material';
import { type FormEvent, useState } from 'react';
import { randomRoomId } from '../lib/status';

interface Props {
  roomId: string;
  onRoomIdChange: (roomId: string) => void;
  onJoin: (roomId: string, name: string) => void;
  disabled?: boolean;
}

const ROOM_ID = /^[A-Za-z0-9_-]{1,32}$/;

export default function JoinForm({
  roomId,
  onRoomIdChange,
  onJoin,
  disabled,
}: Props) {
  const [name, setName] = useState('');
  const nameError = name.length > 20 ? 'Max 20 characters' : '';
  const roomError =
    roomId && !ROOM_ID.test(roomId) ? 'Letters, digits, - and _ only' : '';
  const canSubmit = name.trim() && !nameError && !roomError;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) onJoin(roomId || randomRoomId(), name.trim());
  };

  return (
    <Stack
      component="form"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      onSubmit={submit}
    >
      <TextField
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={Boolean(nameError)}
        helperText={nameError || ' '}
      />
      <TextField
        label="Room"
        value={roomId}
        onChange={(e) => onRoomIdChange(e.target.value)}
        error={Boolean(roomError)}
        helperText={roomError || 'Leave empty to create a new room'}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!canSubmit || disabled}
        sx={{ alignSelf: { sm: 'flex-start' }, height: 56 }}
      >
        Join
      </Button>
    </Stack>
  );
}
