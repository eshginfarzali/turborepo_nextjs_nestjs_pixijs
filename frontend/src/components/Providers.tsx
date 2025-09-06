'use client';
import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import apolloClient from '../lib/apollo-client';

const theme = createTheme();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ApolloProvider client={apolloClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ApolloProvider>
    );
}
