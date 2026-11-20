'use client';
import styled from 'styled-components';
import Link from 'next/link';

const Wrap = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: ${({ $size }) => $size || '17px'};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  white-space: nowrap;
  .mark { width: 28px; height: 28px; border-radius: 8px; background: ${({ theme, $color }) => $color || theme.colors.primary}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .dot { color: ${({ theme }) => theme.colors.accent}; margin-left: 2px; }
`;

export default function Logo({ size, color }) {
  return (
    <Wrap href="/" $size={size} $color={color}>
      <span className="mark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 20 L12 4 L20 20 Z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      </span>
      LaunchFund<span className="dot">.ai</span>
    </Wrap>
  );
}
