'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import {
  Card, Chip, Eyebrow, GhostButton, ProgressBar, StatNumber,
} from '@/components/ui';

const Hero = styled.div`
  padding: 32px 32px 20px;
  @media (max-width: 640px) { padding: 24px 20px 16px; }
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 36px; margin: 0 0 4px; line-height: 1;
    @media (max-width: 640px) { font-size: 26px; }
  }
`;

const KPIRow = styled.div`
  padding: 16px 32px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { padding: 8px 20px 16px; gap: 10px; }
`;

const TableWrap = styled.div`
  padding: 0 32px 24px;
  @media (max-width: 640px) { padding: 0 20px 16px; }
`;

const Scroll = styled.div`
  overflow-x: auto;
  table { width: 100%; min-width: 760px; border-collapse: collapse; }
  th, td { padding: 12px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  th { color: ${({ theme }) => theme.colors.muted}; font-weight: 500; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bgAlt}; }
`;

const BottomRow = styled.div`
  padding: 0 32px 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 640px) { padding: 0 16px 24px; gap: 12px; }
  > * { min-width: 0; }
`;

const PanelCard = styled(Card)`
  padding: 24px;
  min-width: 0;
  @media (max-width: 640px) { padding: 18px 16px; }
`;

const SavedGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: minmax(0, 1fr); gap: 10px; }
`;

const SavedTile = styled.div`
  padding: 14px;
  background: #0A0A0F;
  border: 1px solid #1F1F2A;
  border-radius: 10px;
  min-width: 0;
  .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
  .name { font-weight: 500; font-size: 13px; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sub { color: #8A8A9E; font-size: 11px; line-height: 1.4; }
`;

const modelLabel = { sponsor: 'Sponsorship', participation: 'Rev. Participation', growth: 'Growth Partnership' };
const money = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
};
const statusChip = (s) => {
  if (s === 'accepted') return 'partner';
  if (s === 'declined' || s === 'withdrawn' || s === 'expired') return 'danger';
  if (s === 'countered') return 'primary';
  return 'success';
};
const statusText = (s, updatedAt) => {
  const map = { open: 'Awaiting creator', countered: 'Negotiating', accepted: 'Accepted', declined: 'Declined', withdrawn: 'Withdrawn', expired: 'Expired' };
  const base = map[s] || s;
  const d = Math.max(0, Math.floor((Date.now() - new Date(updatedAt)) / (24 * 60 * 60 * 1000)));
  return `${base} · ${d === 0 ? 'today' : d === 1 ? '1d' : `${d}d`}`;
};

export default function InvestorDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    fetch('/api/dashboard/investor')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [status]);

  const kpis = data?.kpis || {};
  const name = session?.user?.name || 'Partner';
  const rows = data?.portfolio || [];

  return (
    <DashboardShell role="investor" user={{ name, initials: (name || 'I').slice(0, 1).toUpperCase(), avatar: session?.user?.avatar }}>
      <Hero>
        <Eyebrow style={{ color: '#4ADE80', marginBottom: 8 }}>Portfolio overview</Eyebrow>
        <h1>{kpis.activeCount || 0} active deal{kpis.activeCount === 1 ? '' : 's'} · {money(kpis.deployed)} deployed</h1>
        <div style={{ color: '#8A8A9E', fontSize: 13 }}>
          Updated just now{kpis.awaitingCreator ? ` · ${kpis.awaitingCreator} proposal${kpis.awaitingCreator === 1 ? '' : 's'} awaiting creator` : ''}
        </div>
      </Hero>

      <KPIRow>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Capital deployed</div>
          <StatNumber>{money(kpis.deployed)}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E', marginTop: 6 }}>across {kpis.activeCount || 0} campaign{kpis.activeCount === 1 ? '' : 's'}</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Open proposals</div>
          <StatNumber>{kpis.proposalsOpen || 0}</StatNumber>
          <div style={{ fontSize: 11, color: '#D4FF4A', marginTop: 6 }}>● {kpis.awaitingCreator || 0} awaiting response</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Reported returns</div>
          <StatNumber>{kpis.ytdReturn ? money(kpis.ytdReturn) : '—'}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E' }}>recorded payouts</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Avg time to next milestone</div>
          <StatNumber>{kpis.avgDaysNextMilestone ? `${kpis.avgDaysNextMilestone}d` : '—'}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E', marginTop: 6 }}>from milestone events</div>
        </Card>
      </KPIRow>

      <TableWrap>
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Funded campaigns</div>
              <div style={{ color: '#8A8A9E', fontSize: 12, marginTop: 2 }}>Your active capital commitments</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <GhostButton $size="sm">Export CSV</GhostButton>
              <GhostButton $size="sm">Filters</GhostButton>
            </div>
          </div>
          <Scroll>
            <table>
              <thead>
                <tr>
                  <th>Campaign</th><th>Structure</th><th>Capital</th><th>Milestone</th><th>Progress</th><th>Return</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#8A8A9E' }}>Loading…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#8A8A9E' }}>No active commitments yet — <Link href="/explore">explore campaigns</Link> to propose.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 7, backgroundImage: r.image ? `url(${r.image})` : undefined, background: r.image ? undefined : 'linear-gradient(135deg,#1C1C26,#2A2A3A)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{r.name}</div>
                          <div style={{ color: '#8A8A9E', fontSize: 11 }}>{r.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td><Chip $variant={r.structure === 'participation' ? 'success' : r.structure === 'growth' ? 'partner' : 'primary'}>{modelLabel[r.structure]}</Chip></td>
                    <td style={{ fontWeight: 500 }}>{money(r.amount)}</td>
                    <td>{r.milestone}</td>
                    <td style={{ minWidth: 160 }}>
                      <ProgressBar $value={r.progress}><span /></ProgressBar>
                      <div style={{ color: '#8A8A9E', fontSize: 11, marginTop: 4 }}>{r.released}</div>
                    </td>
                    <td style={{ color: r.returnValue === '—' ? '#8A8A9E' : '#4ADE80', fontWeight: 500 }}>{r.returnValue}</td>
                    <td><Link href={`/proposals/${r.reference}`} style={{ fontSize: 12 }}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
        </Card>
      </TableWrap>

      <BottomRow>
        <PanelCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Saved opportunities</div>
            <Link href="/explore" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Explore all →</Link>
          </div>
          <SavedGrid>
            {(data?.saved || []).map((s) => (
              <Link key={s.slug} href={`/campaigns/${s.slug}`} style={{ color: 'inherit', minWidth: 0 }}>
                <SavedTile>
                  <div className="row">
                    <Chip>{s.category}</Chip>
                    <Chip $variant="success">{s.pct}</Chip>
                  </div>
                  <div className="name">{s.name}</div>
                  <div className="sub">{s.sub}</div>
                </SavedTile>
              </Link>
            ))}
            {(data?.saved || []).length === 0 && !loading && (
              <div style={{ color: '#8A8A9E', fontSize: 13, gridColumn: '1 / -1' }}>No saved items yet — browse <Link href="/explore">Explore</Link>.</div>
            )}
          </SavedGrid>
        </PanelCard>

        <PanelCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Proposals &amp; replies</div>
            <Link href="/explore" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>New proposal →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.recentProposals || []).length === 0 && !loading && (
              <div style={{ color: '#8A8A9E', fontSize: 13 }}>You haven&apos;t submitted a proposal yet.</div>
            )}
            {(data?.recentProposals || []).map((p) => (
              <Link key={p.id} href={`/proposals/${p.reference}`} style={{ color: 'inherit' }}>
                <div style={{ padding: 12, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: 13, minWidth: 0 }}>{p.name}</span>
                    <Chip $variant={statusChip(p.status)}>{statusText(p.status, p.updatedAt)}</Chip>
                  </div>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>
                    {money(p.amount)} · {modelLabel[p.model]}{p.revenueSharePct ? ` · ${p.revenueSharePct}% share` : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </PanelCard>
      </BottomRow>
    </DashboardShell>
  );
}
