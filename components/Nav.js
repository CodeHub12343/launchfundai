'use client';
import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Logo from './Logo';
import { PrimaryButton } from './ui';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 72px;
  gap: 16px;
  @media (max-width: 960px) { padding: 16px 32px; }
  @media (max-width: 640px) { padding: 14px 20px; gap: 10px; }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  min-width: 0;
`;

const Links = styled.nav`
  display: flex;
  gap: 28px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.mutedSoft};
  a { color: inherit; }
  a:hover { color: ${({ theme }) => theme.colors.text}; }
  @media (max-width: 960px) { display: none; }
`;

const Right = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  a.login { font-size: 14px; color: ${({ theme }) => theme.colors.text}; margin-right: 6px; }
  .desktop-cta { display: inline-flex; }
  @media (max-width: 960px) {
    a.login { display: none; }
    .desktop-cta { display: ${({ $mobileCta }) => ($mobileCta ? 'inline-flex' : 'none')}; }
    gap: 8px;
  }
`;

const Burger = styled.button`
  display: none;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  @media (max-width: 960px) { display: ${({ $hidden }) => ($hidden ? 'none' : 'inline-flex')}; align-items: center; justify-content: center; }
`;

const Scrim = styled.div`
  display: none;
  @media (max-width: 960px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 40;
  }
`;

const Drawer = styled.aside`
  display: none;
  @media (max-width: 960px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; bottom: 0; right: 0;
    width: 280px; max-width: 86vw;
    background: ${({ theme }) => theme.colors.bgAlt};
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    z-index: 50;
    padding: 20px;
    transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
    transition: transform 200ms ease;
    overflow-y: auto;
  }
`;

const DrawerHead = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 16px; margin-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  button {
    background: transparent; border: none; color: ${({ theme }) => theme.colors.text};
    font-size: 24px; cursor: pointer; padding: 0 4px; line-height: 1;
  }
`;

const DrawerLinks = styled.nav`
  display: flex; flex-direction: column; gap: 2px;
  a {
    display: block;
    padding: 12px 14px;
    border-radius: 10px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 15px;
    font-weight: 500;
  }
  a:hover, a:active { background: ${({ theme }) => theme.colors.surface}; }
  a.muted { color: ${({ theme }) => theme.colors.mutedSoft}; font-weight: 400; font-size: 14px; }
`;

const DrawerFoot = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; flex-direction: column; gap: 10px;
`;

export default function Nav({ mobileCta = false }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Bar>
        <Inner>
          <Left>
            <Logo />
            <Links>
              <Link href="/explore">Explore Campaigns</Link>
              <Link href="#how">How It Works</Link>
              <Link href="/creator">For Creators</Link>
              <Link href="/investor">For Investors</Link>
              <Link href="#pricing">Pricing</Link>
            </Links>
          </Left>
          <Right $mobileCta={mobileCta}>
            <Link className="login" href="/login">Log in</Link>
            <PrimaryButton className="desktop-cta" as={Link} href="/signup">Get Started →</PrimaryButton>
            {!mobileCta && (
              <Burger onClick={() => setOpen(true)} aria-label="Open menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </Burger>
            )}
          </Right>
        </Inner>
      </Bar>

      <Scrim $open={open} onClick={close} />
      <Drawer $open={open} aria-hidden={!open}>
        <DrawerHead>
          <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8A8A9E', fontWeight: 600 }}>Menu</span>
          <button onClick={close} aria-label="Close menu">×</button>
        </DrawerHead>
        <DrawerLinks onClick={close}>
          <Link href="/explore">Explore Campaigns</Link>
          <Link href="/#how">How It Works</Link>
          <Link href="/creator">For Creators</Link>
          <Link href="/investor">For Investors</Link>
          <Link href="/#pricing">Pricing</Link>
        </DrawerLinks>
        <DrawerFoot>
          <Link className="muted" href="/login" onClick={close} style={{ textAlign: 'center', padding: 10, color: '#8A8A9E', fontSize: 14 }}>Log in</Link>
          <PrimaryButton as={Link} href="/signup" onClick={close} style={{ width: '100%', textAlign: 'center' }}>Get Started →</PrimaryButton>
        </DrawerFoot>
      </Drawer>
    </>
  );
}
