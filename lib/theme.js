export const theme = {
  colors: {
    bg: '#0A0A0F',
    bgAlt: '#0D0D14',
    surface: '#13131A',
    surface2: '#1C1C26',
    surface3: '#2A2A3A',
    border: '#1F1F2A',
    borderStrong: '#2A2A38',
    text: '#F5F5FA',
    textSoft: '#D8D8E4',
    muted: '#8A8A9E',
    mutedSoft: '#B8B8C8',
    mutedDim: '#6A6A7E',
    primary: '#7C5CFF',
    primaryHover: '#6B4AEE',
    primarySoft: '#B8A3FF',
    accent: '#D4FF4A',
    success: '#4ADE80',
    warning: '#FFB547',
    danger: '#FF6B7A',
  },
  fonts: {
    sans: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    serif: "'Instrument Serif', Georgia, serif",
    mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  },
  radius: {
    sm: '7px',
    md: '10px',
    lg: '14px',
    xl: '16px',
    pill: '999px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '960px',
    desktop: '1200px',
  },
  shadow: {
    pop: '0 20px 40px rgba(0,0,0,.4)',
  },
};

export const media = {
  mobile: `@media (max-width: ${theme.breakpoints.mobile})`,
  tablet: `@media (max-width: ${theme.breakpoints.tablet})`,
  desktop: `@media (max-width: ${theme.breakpoints.desktop})`,
};
