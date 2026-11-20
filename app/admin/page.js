'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Card, Chip, GhostButton, PrimaryButton, StatNumber } from '@/components/ui';

const Top = styled.div`
  padding: 16px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  @media (max-width: 640px) { padding: 14px 20px; }
`;

const KPI = styled.div`
  padding: 24px 32px 16px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 640px) { padding: 16px 20px; grid-template-columns: 1fr 1fr; }
`;

const TwoCol = styled.div`
  padding: 8px 32px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
  @media (max-width: 640px) { padding: 8px 20px 16px; }
`;

const Scroll = styled.div`
  overflow-x: auto;
  table { width: 100%; min-width: 600px; border-collapse: collapse; }
  th, td { padding: 12px 14px; text-align: left; font-size: 12px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  th { color: ${({ theme }) => theme.colors.muted}; font-weight: 500; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bgAlt}; }
`;

const money = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v.toLocaleString()}`;
};
const timeAgo = (d) => {
  if (!d) return '—';
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [overview, setOverview] = useState(null);
  const [queue, setQueue] = useState([]);
  const [moderation, setModeration] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reloading, setReloading] = useState(false);

  const load = async () => {
    setReloading(true);
    const [o, q, m, d] = await Promise.all([
      fetch('/api/admin/overview').then((r) => r.ok ? r.json() : null),
      fetch('/api/admin/queue').then((r) => r.ok ? r.json() : null),
      fetch('/api/admin/moderation').then((r) => r.ok ? r.json() : null),
      fetch('/api/admin/disputes').then((r) => r.ok ? r.json() : null),
    ]);
    if (o) setOverview(o);
    if (q) setQueue(q.items || []);
    if (m) setModeration(m.items || []);
    if (d) setDisputes(d.items || []);
    setReloading(false);
  };
  useEffect(() => { load(); }, []);

  const reviewCampaign = async (slug, action) => {
    const note = action === 'reject' ? prompt('Rejection note (optional)') : '';
    const r = await fetch('/api/admin/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, action, note }) });
    if (r.ok) load();
    else alert((await r.json())?.error || 'Failed');
  };

  const closeModeration = async (id, action) => {
    await fetch('/api/admin/moderation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id }) });
    load();
  };
  const closeDispute = async (id, action) => {
    const resolution = prompt(`${action === 'resolve' ? 'Resolution' : 'Rejection'} note (optional)`) || '';
    await fetch('/api/admin/disputes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id, resolution }) });
    load();
  };

  const name = session?.user?.name || 'Admin';
  const k = overview?.kpis || {};
  const weeks = overview?.weeklyDeployed || [];
  const maxWk = Math.max(1, ...weeks);

  if (session && session.user?.role !== 'admin') {
    return (
      <DashboardShell role={session.user.role || 'creator'} user={{ name, initials: (name || 'A').slice(0, 2).toUpperCase(), avatar: session.user?.avatar }}>
        <div style={{ padding: 40, color: '#8A8A9E' }}>
          Admin access only. Your role is <b>{session.user.role}</b>.
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin" user={{ name, initials: (name || 'A').slice(0, 2).toUpperCase(), avatar: session?.user?.avatar }}>
      <Top>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Platform overview</div>
          <div style={{ color: '#8A8A9E', fontSize: 12 }}>Live metrics {reloading ? '· refreshing…' : '· up to date'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostButton onClick={load}>Refresh</GhostButton>
          <GhostButton>Export report</GhostButton>
          <PrimaryButton>Platform announcement</PrimaryButton>
        </div>
      </Top>

      <KPI>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Active campaigns</div>
          <StatNumber $size="30px">{k.activeCampaigns ?? '—'}</StatNumber>
          <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>▲ +{k.campaignsWk ?? 0} wk</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Capital deployed</div>
          <StatNumber $size="30px">{money(k.deployedTotal)}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E' }}>YTD</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Creators</div>
          <StatNumber $size="30px">{(k.creators || 0).toLocaleString()}</StatNumber>
          <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>▲ +{k.creatorsWk ?? 0} wk</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Partners</div>
          <StatNumber $size="30px">{(k.partners || 0).toLocaleString()}</StatNumber>
          <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>▲ +{k.partnersWk ?? 0} wk</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Pending review</div>
          <StatNumber $size="30px" style={{ color: '#FFB547' }}>{k.pending ?? 0}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E' }}>queue</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11 }}>Open disputes</div>
          <StatNumber $size="30px" style={{ color: '#FF6B7A' }}>{k.openDisputes ?? 0}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E' }}>{k.agedDisputes ?? 0} ≥ 24h</div>
        </Card>
      </KPI>

      <TwoCol>
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #1F1F2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Campaign approval queue</div>
            <Chip $variant="warning">{queue.length} pending</Chip>
          </div>
          <Scroll>
            <table>
              <thead>
                <tr><th>Campaign</th><th>Creator</th><th>Submitted</th><th>Flags</th><th /></tr>
              </thead>
              <tbody>
                {queue.length === 0 && <tr><td colSpan={5} style={{ color: '#8A8A9E', textAlign: 'center' }}>Nothing pending review.</td></tr>}
                {queue.map((c) => (
                  <tr key={c.slug}>
                    <td style={{ fontWeight: 500 }}>
                      <Link href={`/campaigns/${c.slug}`} style={{ color: 'inherit' }}>{c.title?.split('—')[0].trim() || c.slug}</Link>
                    </td>
                    <td style={{ color: '#8A8A9E' }}>{c.creator}</td>
                    <td style={{ color: '#8A8A9E' }}>{timeAgo(c.submitted)}</td>
                    <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.flags.map((f) => <Chip key={f.label} $variant={f.variant === 'default' ? undefined : f.variant}>{f.label}</Chip>)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => reviewCampaign(c.slug, 'approve')} style={{ background: 'none', border: 'none', color: '#4ADE80', fontSize: 12, cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => reviewCampaign(c.slug, 'reject')} style={{ background: 'none', border: 'none', color: '#FF6B7A', fontSize: 12, cursor: 'pointer' }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Capital deployed (last 12 weeks)</div>
          <div style={{ height: 220, position: 'relative' }}>
            <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" aria-label="Deployed capital">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#1F1F2A" strokeDasharray="2 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#1F1F2A" strokeDasharray="2 4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#1F1F2A" strokeDasharray="2 4" />
              {weeks.map((v, i) => {
                const x = 8 + i * 30;
                const y = 200 - Math.max(6, (v / maxWk) * 170);
                const c = i >= 9 ? '#D4FF4A' : '#7C5CFF';
                return <rect key={i} x={x} y={y} width="22" height={200 - y} rx="3" fill={c} />;
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: '#8A8A9E' }}>
            <span>W-12</span><span>W-8</span><span>W-4</span><span>Now</span>
          </div>
        </Card>
      </TwoCol>

      <TwoCol>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Content moderation</div>
            <span style={{ fontSize: 12, color: '#8A8A9E' }}>{moderation.length} open</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {moderation.length === 0 && <div style={{ color: '#8A8A9E', fontSize: 12 }}>No open moderation items.</div>}
            {moderation.map((m) => (
              <div key={m._id} style={{ padding: 12, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.title}</div>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>{m.reason}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <GhostButton $size="sm" onClick={() => closeModeration(m._id, 'resolve')}>Resolve</GhostButton>
                  <GhostButton $size="sm" onClick={() => closeModeration(m._id, 'dismiss')}>Dismiss</GhostButton>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Open disputes</div>
            <span style={{ fontSize: 12, color: '#8A8A9E' }}>{disputes.length} open</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {disputes.length === 0 && <div style={{ color: '#8A8A9E', fontSize: 12 }}>No open disputes.</div>}
            {disputes.map((d) => (
              <div key={d.id} style={{ padding: 12, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Dispute #{d.reference}</span>
                  <Chip $variant={d.severity === 'default' ? undefined : d.severity}>{d.subject}</Chip>
                </div>
                <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 8 }}>
                  Partner: {d.partnerName || '—'} · Creator: {d.creatorName || '—'} · opened {d.agedDays}d
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <GhostButton $size="sm" onClick={() => closeDispute(d.id, 'resolve')}>Resolve</GhostButton>
                  <GhostButton $size="sm" onClick={() => closeDispute(d.id, 'reject')}>Reject</GhostButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TwoCol>
    </DashboardShell>
  );
}
