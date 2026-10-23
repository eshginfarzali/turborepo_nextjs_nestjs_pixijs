'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

export const OPEN_GAMES = gql`
  query OpenGames {
    openGames {
      roomId
      players {
        name
      }
    }
  }
`;

interface OpenGamesData {
  openGames: { roomId: string; players: { name: string }[] }[];
}

/** Lobby: rooms waiting for a second player, refreshed every few seconds. */
export default function OpenGames({
  onPick,
}: {
  onPick: (roomId: string) => void;
}) {
  const { data, error } = useQuery<OpenGamesData>(OPEN_GAMES, {
    pollInterval: 3000,
  });

  if (error) {
    return (
      <Typography color="error">Lobby unavailable: {error.message}</Typography>
    );
  }
  const games = data?.openGames ?? [];
  if (games.length === 0) {
    return (
      <Typography color="text.secondary">
        No open rooms yet — create one.
      </Typography>
    );
  }

  return (
    <List dense>
      {games.map((game) => (
        <ListItem
          key={game.roomId}
          secondaryAction={
            <Button size="small" onClick={() => onPick(game.roomId)}>
              Use room
            </Button>
          }
        >
          <ListItemText
            primary={game.roomId}
            secondary={`Host: ${game.players[0]?.name ?? '—'}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
