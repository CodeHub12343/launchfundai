'use client';
import styled from 'styled-components';
import Link from 'next/link';
import Logo from './Logo';
import { Card } from './ui';
import { img } from '@/lib/images';

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) => theme.colors.bg};
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const Side = styled.div`
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  @media (max-width: 640px) { padding: 24px 32px; }
  @media (max-width: 480px) { padding: 20px 28px; }
  @media (max-width: 360px) { padding: 18px 20px; }
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  @media (max-width: 480px) { padding: 20px 0; align-items: flex-start; }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 420px;
`;

const TopBar = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  .help { font-size: 13px; color: ${({ theme }) => theme.colors.mutedSoft}; }
`;

const Visual = styled.div`
  position: relative;
  background:
    linear-gradient(180deg, rgba(10,10,15,.55) 0%, rgba(10,10,15,.9) 85%),
    url(${({ $img }) => $img});
  background-size: cover;
  background-position: center;
  padding: 40px 48px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 960px) { display: none; }
  .halo {
    position: absolute; top: -80px; right: -80px; width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(124,92,255,.25), transparent 60%);
    pointer-events: none;
  }
  .halo2 {
    position: absolute; bottom: -120px; left: -80px; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(212,255,74,.12), transparent 60%);
    pointer-events: none;
  }
  .quote {
    position: relative;
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 36px; line-height: 1.15; margin-bottom: 20px;
  }
  .meta { position: relative; display: flex; gap: 12px; align-items: center; font-size: 13px; color: ${({ theme }) => theme.colors.mutedSoft}; }
  .avatar { width: 44px; height: 44px; border-radius: 999px; background-size: cover; background-position: center; }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  padding: 24px;
  margin-top: 32px;
  background: rgba(0,0,0,.4);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  position: relative;
  strong { display: block; font-size: 22px; font-weight: 700; }
  span { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; }
`;

export default function AuthShell({ children, side = 'left' }) {
  const visual = (
    <Visual $img={img.teamWorking}>
      <div className="halo" />
      <div className="halo2" />
      <div className="quote">
        Reach your goal, then scale it. Partner with vetted sponsors and funding partners, release capital on milestones, and plan growth with the AI Studio.
      </div>
      <StatsBar>
        <div><strong>Vetted</strong><span>Partners &amp; sponsors</span></div>
        <div><strong>Milestone</strong><span>Gated releases</span></div>
        <div><strong>Transparent</strong><span>Both sides see one view</span></div>
      </StatsBar>
    </Visual>
  );

  return (
    <Wrap>
      {side === 'left' && visual}
      <Side>
        <TopBar>
          <Logo />
          <Link href="#" className="help">Need help?</Link>
        </TopBar>
        <Center>
          <Inner>{children}</Inner>
        </Center>
        <div style={{ fontSize: 11, color: '#6A6A7E', textAlign: 'center' }}>
          © 2026 LaunchFund AI · <Link href="#">Terms</Link> · <Link href="#">Privacy</Link>
        </div>
      </Side>
      {side === 'right' && visual}
    </Wrap>
  );
}

export const Form = styled.form`
  display: flex; flex-direction: column; gap: 14px;
`;

export const Field = styled.label`
  display: flex; flex-direction: column; gap: 6px;
  .lbl { font-size: 12px; color: ${({ theme }) => theme.colors.mutedSoft}; font-weight: 500; }
  input, select, textarea {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    min-width: 0;
    transition: border-color 120ms ease;
    &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
    &::placeholder { color: ${({ theme }) => theme.colors.mutedDim}; }
  }
`;

export const AuthTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400;
  font-size: 40px;
  line-height: 1.05;
  margin: 0 0 8px;
  @media (max-width: 480px) { font-size: 32px; }
`;

export const AuthSub = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  margin: 0 0 32px;
`;

export const AuthDivider = styled.div`
  display: flex; align-items: center; gap: 12px;
  color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin: 20px 0;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: ${({ theme }) => theme.colors.border}; }
`;
