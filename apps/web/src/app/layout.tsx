import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'Realtime Tic-Tac-Toe',
  description: 'Multiplayer tic-tac-toe over Socket.IO, rendered with PixiJS.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
