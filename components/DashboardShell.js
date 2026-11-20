'use client';
import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { img } from '@/lib/images';

const Shell = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: ${({ theme }) => theme.colors.bg};
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const Aside = styled.aside`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgAlt};
  padding: 24px 16px;
  position: relative;
  @media (max-width: 960px) {
    position: fixed;
    inset: 0 auto 0 0;
    width: 260px;
    z-index: 50;
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    transition: transform 200ms ease;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  padding: 0 10px;
  margin-bottom: 28px;
  .m { width: 26px; height: 26px; border-radius: 8px; background: ${({ theme, $tint }) => $tint || theme.colors.primary}; }
  .d { color: ${({ theme }) => theme.colors.accent}; }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme, $accent }) => $accent || theme.colors.mutedDim};
  padding: 0 14px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.mutedSoft)};
  background: ${({ $active }) => ($active ? 'rgba(124,92,255,.12)' : 'transparent')};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
  text-decoration: none;
  cursor: pointer;
  &:hover { background: ${({ theme, $active }) => ($active ? 'rgba(124,92,255,.12)' : theme.colors.surface2)}; color: ${({ theme }) => theme.colors.text}; }
  .badge {
    margin-left: auto;
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
  .badge.accent { background: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.bg}; }
  .badge.danger { background: ${({ theme }) => theme.colors.danger}; color: #fff; }
`;

const Main = styled.main`
  min-width: 0;
  overflow-x: hidden;
`;

const TopBarBox = styled.div`
  padding: 18px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  @media (max-width: 960px) { padding: 14px 20px; gap: 10px; }
  @media (max-width: 640px) { padding: 12px 14px; gap: 8px; }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 0;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 2px 14px;
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 13px;
    outline: none;
    padding: 9px 0;
    min-width: 0;
    width: 100%;
  }
  @media (max-width: 640px) { padding: 2px 10px; input { font-size: 12px; } }
`;

const Avatar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px 14px 4px 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  .dot {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background-image: ${({ $img }) => ($img ? `url(${$img})` : 'none')};
    background-color: ${({ $grad, $img }) => ($img ? 'transparent' : 'transparent')};
    background-size: cover;
    background-position: center;
    ${({ $img, $grad }) => (!$img ? `background: ${$grad || 'linear-gradient(135deg,#7C5CFF,#D4FF4A)'};` : '')}
    color: ${({ theme }) => theme.colors.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
  }
  span.name { font-size: 13px; font-weight: 500; white-space: nowrap; }
  @media (max-width: 760px) { padding: 3px; border-radius: 999px; .dot { width: 28px; height: 28px; } span.name { display: none; } }
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
  @media (max-width: 960px) { display: inline-flex; align-items: center; justify-content: center; }
`;

const Scrim = styled.div`
  display: none;
  @media (max-width: 960px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 40;
  }
`;

const navs = {
  creator: [
    { href: '/creator', label: 'Overview' },
    { href: '/explore', label: 'Explore Campaigns' },
    { href: '/campaigns/new', label: 'List a Campaign' },
    { href: '/studio', label: 'AI Marketing Studio' },
    { href: '/creator/payouts', label: 'Payouts' },
    { href: '/messages', label: 'Messages', danger: true },
    { href: '/notifications', label: 'Notifications' },
    { href: '/settings', label: 'Settings' },
  ],
  investor: [
    { href: '/investor', label: 'Overview' },
    { href: '/explore', label: 'Explore Campaigns' },
    { href: '/messages', label: 'Messages', danger: true },
    { href: '/notifications', label: 'Notifications' },
    { href: '/settings', label: 'Settings' },
  ],
  admin: [
    { href: '/admin', label: 'Overview' },
    { href: '/explore', label: 'All Campaigns' },
    { href: '/messages', label: 'Messages', danger: true },
    { href: '/notifications', label: 'Notifications' },
    { href: '/settings', label: 'Platform settings' },
  ],
};

const roleAccent = {
  creator: '#7C5CFF',
  investor: '#4ADE80',
  admin: '#D4FF4A',
};

export default function DashboardShell({ role = 'creator', user, children, topBarRight }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navs[role] || navs.creator;

  return (
    <Shell>
      <Scrim $open={open} onClick={() => setOpen(false)} />
      <Aside $open={open}>
        <Brand $tint={roleAccent[role]}>
          <span className="m" />
          LaunchFund<span className="d">.ai</span>
        </Brand>
        <SectionLabel $accent={role === 'admin' ? '#D4FF4A' : undefined}>
          {role === 'creator' ? 'Creator' : role === 'investor' ? 'Partner' : 'Admin · Staff'}
        </SectionLabel>
        <NavList>
          {items.map((i) => (
            <NavItem
              key={i.href + i.label}
              href={i.href}
              $active={pathname === i.href.split('?')[0]}
            >
              {i.label}
              {i.badge && (
                <span className={`badge ${i.accent ? 'accent' : ''} ${i.danger ? 'danger' : ''}`}>
                  {i.badge}
                </span>
              )}
            </NavItem>
          ))}
        </NavList>
      </Aside>

      <Main>
        <TopBarBox>
          <Burger onClick={() => setOpen((v) => !v)} aria-label="Open navigation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Burger>
          <SearchBox>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#8A8A9E" strokeWidth="1.8" />
              <path d="M20 20 L16 16" stroke="#8A8A9E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input placeholder="Search…" />
          </SearchBox>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            {topBarRight}
            <Avatar $img={user?.avatar || ''}>
              <span className="dot">{!user?.avatar && (user?.initials || (user?.name || '?').slice(0, 1).toUpperCase())}</span>
              <span className="name">{user?.name || 'Account'}</span>
            </Avatar>
          </div>
        </TopBarBox>
        {children}
      </Main>
    </Shell>
  );
}
