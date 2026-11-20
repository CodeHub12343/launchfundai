'use client';
import styled, { css } from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 72px;
  ${({ theme }) => theme.breakpoints && ''}
  @media (max-width: 960px) { padding: 0 32px; }
  @media (max-width: 640px) { padding: 0 20px; }
`;

export const PageFrame = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  ${({ $pad }) => $pad && css`padding: ${$pad};`}
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.muted};
`;

export const Eyebrow = styled.div`
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

export const H1Serif = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: ${({ $size }) => $size || '84px'};
  line-height: 0.98;
  letter-spacing: -0.02em;
  margin: 0;
  em { font-style: italic; color: ${({ theme }) => theme.colors.accent}; }
  @media (max-width: 960px) { font-size: 64px; }
  @media (max-width: 640px) { font-size: 42px; }
`;

export const H2Serif = styled.h2`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: ${({ $size }) => $size || '52px'};
  line-height: 1.05;
  letter-spacing: -0.015em;
  margin: 0;
  @media (max-width: 640px) { font-size: 36px; }
`;

export const StatNumber = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: ${({ $size }) => $size || '34px'};
  line-height: 1;
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.mutedSoft};
  background: ${({ theme }) => theme.colors.surface};
  white-space: nowrap;
  ${({ $variant, theme }) =>
    $variant === 'success' &&
    css`
      background: rgba(212, 255, 74, 0.12);
      border-color: rgba(212, 255, 74, 0.3);
      color: ${theme.colors.accent};
    `}
  ${({ $variant, theme }) =>
    $variant === 'primary' &&
    css`
      background: rgba(124, 92, 255, 0.12);
      border-color: rgba(124, 92, 255, 0.3);
      color: ${theme.colors.primarySoft};
    `}
  ${({ $variant, theme }) =>
    $variant === 'warning' &&
    css`
      background: rgba(255, 181, 71, 0.1);
      border-color: rgba(255, 181, 71, 0.3);
      color: ${theme.colors.warning};
    `}
  ${({ $variant, theme }) =>
    $variant === 'danger' &&
    css`
      background: rgba(255, 107, 122, 0.1);
      border-color: rgba(255, 107, 122, 0.3);
      color: ${theme.colors.danger};
    `}
  ${({ $variant, theme }) =>
    $variant === 'partner' &&
    css`
      background: rgba(74, 222, 128, 0.1);
      border-color: rgba(74, 222, 128, 0.3);
      color: ${theme.colors.success};
    `}
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ $size }) => ($size === 'sm' ? '8px 14px' : $size === 'lg' ? '14px 22px' : '12px 20px')};
  font-weight: 600;
  font-size: ${({ $size }) => ($size === 'sm' ? '12px' : '14px')};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  text-decoration: none;
  white-space: nowrap;
  ${({ $full }) => $full && css`width: 100%;`}
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

export const GhostButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border-color: ${({ theme }) => theme.colors.borderStrong};
  font-weight: 500;
  &:hover { border-color: #4A4A5E; }
`;

export const SuccessButton = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.bg};
`;

export const DangerButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border-color: rgba(255, 107, 122, 0.3);
  font-weight: 500;
`;

export const ProgressBar = styled.div`
  height: ${({ $height }) => $height || '4px'};
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  overflow: hidden;
  > span {
    display: block;
    height: 100%;
    width: ${({ $value }) => `${Math.min(Math.max($value || 0, 0), 100)}%`};
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  }
`;

export const RiskBanner = styled.div`
  border: 1px solid rgba(255, 181, 71, 0.25);
  background: rgba(255, 181, 71, 0.04);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.mutedSoft};
  font-size: 12px;
  line-height: 1.6;
  svg { flex-shrink: 0; margin-top: 2px; }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: ${({ $dir }) => $dir || 'column'};
  gap: ${({ $gap }) => $gap || '16px'};
  ${({ $align }) => $align && css`align-items: ${$align};`}
  ${({ $justify }) => $justify && css`justify-content: ${$justify};`}
  ${({ $wrap }) => $wrap && css`flex-wrap: wrap;`}
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || 'repeat(3, 1fr)'};
  gap: ${({ $gap }) => $gap || '16px'};
  @media (max-width: 960px) { grid-template-columns: ${({ $md }) => $md || '1fr 1fr'}; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

export const RiskIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 L22 20 H2 Z" stroke="#FFB547" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10 V15 M12 17.5 V18" stroke="#FFB547" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const LogoMark = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${({ theme, $color }) => $color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;
