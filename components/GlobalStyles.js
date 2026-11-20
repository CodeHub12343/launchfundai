'use client';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: ${({ theme }) => theme.fonts.sans};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px;
  }
  a { color: ${({ theme }) => theme.colors.primarySoft}; text-decoration: none; }
  a:hover { color: ${({ theme }) => theme.colors.accent}; }
  button { font-family: inherit; }
  input, textarea, select { font-family: inherit; }
  ::selection { background: ${({ theme }) => theme.colors.primary}; color: white; }
`;
