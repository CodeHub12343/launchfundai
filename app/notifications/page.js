'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Chip, GhostButton, PrimaryButton } from '@/components/ui';

const Wrap = styled.div`
  padding: 32px;
  max-width: 920px;
  margin: 0 auto;
  @media (max-width: 640px) { padding: 20px 14px; }
`;

const Head = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 12px; flex-wrap: wrap;
  margin-bottom: 20px;
  h1 { font-family: ${({ theme }) => theme.fonts.serif}; font-weight: 400; font-size: 36px; line-height: 1; margin: 0; }
  @media (max-width: 640px) {
    margin-bottom: 14px;
    h1 { font-size: 26px; }
    > div:last-child { width: 100%; display: flex; gap: 8px; }
    > div:last-child button, > div:last-child a { flex: 1; text-align: center; }
  }
`;

const Tabs = styled.div`
  display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: 20px; overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  button { padding: 12px 16px; font-size: 13px; background: transparent; border: none; color: ${({ theme }) => theme.colors.muted}; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; white-space: nowrap; }
  button.on { color: ${({ theme }) => theme.colors.text}; border-bottom-color: ${({ theme }) => theme.colors.primary}; font-weight: 600; }
  @media (max-width: 640px) { margin: 0 -14px 16px; padding: 0 14px; button { padding: 10px 12px; font-size: 12px; } }
`;

const Item = styled.div`
  display: flex; gap: 14px; padding: 18px 20px;
  background: ${({ $unread, theme }) => ($unread ? 'rgba(124,92,255,.06)' : theme.colors.surface)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  .icon { width: 40px; height: 40px; border-radius: 10px; background: ${({ $tint }) => $tint || 'rgba(124,92,255,.15)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .body { flex: 1; min-width: 0; }
  .top { display: flex; justify-content: space-between; margin-bottom: 4px; gap: 8px; flex-wrap: wrap; }
  .title { font-weight: 500; font-size: 14px; }
  .time { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; white-space: nowrap; }
  .desc { color: ${({ theme }) => theme.colors.mutedSoft}; font-size: 13px; line-height: 1.55; }
  .actions { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: ${({ theme }) => theme.colors.accent}; margin-top: 6px; flex-shrink: 0; }
  @media (max-width: 640px) {
    padding: 14px; gap: 10px;
    .icon { width: 32px; height: 32px; border-radius: 8px; }
    .title { font-size: 13px; }
    .desc { font-size: 12px; }
    .actions a, .actions button { flex: 1; text-align: center; }
  }
`;

const KIND_TINT = {
  proposal: 'rgba(212,255,74,.15)',
  milestone: 'rgba(124,92,255,.15)',
  ai: 'rgba(124,92,255,.15)',
  view: 'rgba(74,222,128,.15)',
  approval: 'rgba(74,222,128,.15)',
  warn: 'rgba(255,181,71,.15)',
  message: 'rgba(124,92,255,.15)',
  system: 'rgba(124,92,255,.15)',
};

function Icon({ kind }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' };
  if (kind === 'proposal') return <svg {...common}><path d="M3 7 H21 V17 H3 Z" stroke="#D4FF4A" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="#D4FF4A" strokeWidth="1.6" /></svg>;
  if (kind === 'milestone') return <svg {...common}><path d="M13 2 L5 14 H11 L9 22 L19 10 H13 Z" stroke="#7C5CFF" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  if (kind === 'ai') return <svg {...common}><path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" stroke="#7C5CFF" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  if (kind === 'view') return <svg {...common}><path d="M2 12 Q6 5 12 5 Q18 5 22 12 Q18 19 12 19 Q6 19 2 12 Z" stroke="#4ADE80" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="#4ADE80" strokeWidth="1.6" /></svg>;
  if (kind === 'approval') return <svg {...common}><path d="M12 22 Q14 22 14 20 H10 Q10 22 12 22 Z M18 16 V11 a6 6 0 0 0-12 0 v5 l-2 2 H20 Z" stroke="#4ADE80" strokeWidth="1.6" /></svg>;
  if (kind === 'warn') return <svg {...common}><path d="M12 3 L22 20 H2 Z" stroke="#FFB547" strokeWidth="1.6" /><path d="M12 10 V15 M12 17.5 V18" stroke="#FFB547" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  if (kind === 'message') return <svg {...common}><path d="M4 6 H20 V18 H4 Z M4 6 L12 13 L20 6" stroke="#7C5CFF" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8" stroke="#7C5CFF" strokeWidth="1.6" /></svg>;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({ groups: { Today: [], Yesterday: [], Earlier: [] }, unreadCount: 0, weekCount: 0 });
  const [loading, setLoading] = useState(true);

  const load = (t) => {
    setLoading(true);
    fetch(`/api/notifications?filter=${t}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(tab); }, [tab]);

  const markAll = async () => {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_all_read' }) });
    load(tab);
  };
  const markOne = async (id) => {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_read', id }) });
    load(tab);
  };

  const name = session?.user?.name || 'You';
  const role = session?.user?.role === 'investor' ? 'investor' : 'creator';
  const groups = data.groups || { Today: [], Yesterday: [], Earlier: [] };
  const totalShown = groups.Today.length + groups.Yesterday.length + groups.Earlier.length;

  return (
    <DashboardShell role={role} user={{ name, initials: (name || 'U').slice(0, 2).toUpperCase(), avatar: session?.user?.avatar }}>
      <Wrap>
        <Head>
          <div>
            <h1>Notifications</h1>
            <div style={{ color: '#8A8A9E', fontSize: 13, marginTop: 6 }}>{data.unreadCount} unread · {data.weekCount} in the last 7 days</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostButton $size="sm" onClick={markAll} disabled={!data.unreadCount}>Mark all read</GhostButton>
            <GhostButton $size="sm" as={Link} href="/settings">Preferences</GhostButton>
          </div>
        </Head>

        <Tabs>
          {[['all', 'All'], ['unread', `Unread · ${data.unreadCount}`], ['proposals', 'Proposals'], ['milestones', 'Milestones'], ['system', 'System']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </Tabs>

        {loading && totalShown === 0 && <div style={{ color: '#8A8A9E' }}>Loading…</div>}
        {!loading && totalShown === 0 && (
          <div style={{ color: '#8A8A9E', textAlign: 'center', padding: '40px 20px', border: '1px dashed #1F1F2A', borderRadius: 12 }}>
            {tab === 'unread' ? 'No unread notifications — you&apos;re all caught up.' : 'No notifications yet.'}
          </div>
        )}

        {Object.entries(groups).map(([label, items]) => items.length > 0 && (
          <div key={label} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: '#8A8A9E', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 600, marginBottom: 12 }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((n) => (
                <Item key={n.id} $unread={n.unread} $tint={KIND_TINT[n.kind]}>
                  <div className="icon"><Icon kind={n.kind} /></div>
                  <div className="body">
                    <div className="top">
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className="title">{n.title}</span>
                        {n.unread && <Chip $variant="success">New</Chip>}
                      </div>
                      <span className="time">{n.time}</span>
                    </div>
                    <div className="desc">{n.desc}</div>
                    {n.href && (
                      <div className="actions">
                        <PrimaryButton $size="sm" as={Link} href={n.href} onClick={() => n.unread && markOne(n.id)}>{n.ctaLabel || 'Open'} →</PrimaryButton>
                        {n.unread && <GhostButton $size="sm" onClick={() => markOne(n.id)}>Mark read</GhostButton>}
                      </div>
                    )}
                  </div>
                  {n.unread && <div className="dot" />}
                </Item>
              ))}
            </div>
          </div>
        ))}
      </Wrap>
    </DashboardShell>
  );
}
