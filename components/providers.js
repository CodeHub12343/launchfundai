'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '@/lib/registry';
import { theme } from '@/lib/theme';
import { GlobalStyles } from './GlobalStyles';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <StyledComponentsRegistry>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          {children}
        </ThemeProvider>
      </StyledComponentsRegistry>
    </SessionProvider>
  );
}
