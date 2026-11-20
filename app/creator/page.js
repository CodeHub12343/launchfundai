'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import {
  Card, Chip, Eyebrow, GhostButton, PrimaryButton, ProgressBar,
  RiskBanner, StatNumber,
} from '@/components/ui';
import { img } from '@/lib/images';

const Hero = styled.div`
  padding: 32px 32px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  @media (max-width: 640px) { padding: 24px 20px 16px; }
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 36px; margin: 0; line-height: 1;
    @media (max-width: 640px) { font-size: 28px; }
  }
`;

const KPIRow = styled.div`
  padding: 16px 32px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { padding: 8px 20px 16px; grid-template-columns: 1fr 1fr; gap: 10px; }
`;

const ChartRow = styled.div`
  padding: 0 32px 24px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
  @media (max-width: 640px) { padding: 0 20px 16px; }
`;

const ThreeCol = styled.div`
  padding: 0 32px 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
  @media (max-width: 640px) { padding: 0 20px 16px; }
`;

const ListItem = styled.div`
  padding: 14px;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
`;

const Dot = styled.div`
  width: 7px; height: 7px; border-radius: 999px;
  background: ${({ $c, theme }) => $c === 'a' ? theme.colors.accent : $c === 'p' ? theme.colors.primary : theme.colors.borderStrong};
  margin-top: 6px; flex-shrink: 0;
`;

const modelLabel = { sponsor: 'Sponsorship', participation: 'Rev. Participation', growth: 'Growth Partnership' };
const money = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
};
const relTime = (d) => {
  const h = Math.max(0, Math.floor((Date.now() - new Date(d)) / 3600000));
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24);
  return dd === 1 ? 'yesterday' : `${dd}d`;
};

export default function CreatorDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    fetch('/api/dashboard/creator')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [status]);

  const firstName = (session?.user?.name || 'there').split(' ')[0];
  const primary = data?.primaryCampaign;
  const kpis = data?.kpis || {};

  return (
    <DashboardShell role="creator" user={{ name: session?.user?.name || 'Creator', initials: (session?.user?.name || 'C').slice(0, 1).toUpperCase(), avatar: session?.user?.avatar }}>
      <Hero>
        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Welcome back, {firstName}</Eyebrow>
          <h1>{primary ? `Here's where ${primary.title.split('—')[0].trim()} stands today.` : loading ? 'Loading your workspace…' : "Let's get your first campaign listed."}</h1>
        </div>
        <PrimaryButton as={Link} href="/campaigns/new">+ New Campaign</PrimaryButton>
      </Hero>

      <KPIRow>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Total pledges</div>
          <StatNumber>{money(kpis.totalPledged)}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E', marginTop: 6 }}>{data?.campaigns?.length || 0} campaign{data?.campaigns?.length === 1 ? '' : 's'}</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Funding progress</div>
          <StatNumber>{kpis.fundingPct ?? 0}%</StatNumber>
          <ProgressBar $value={Math.min(100, kpis.fundingPct || 0)} style={{ marginTop: 10 }}><span /></ProgressBar>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Funding interest</div>
          <StatNumber>{kpis.proposalsOpen ?? 0} <span style={{ fontSize: 14, color: '#8A8A9E' }}>open</span></StatNumber>
          <div style={{ fontSize: 11, color: '#D4FF4A', marginTop: 6 }}>● {kpis.newThisWeek ?? 0} new this week</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 6 }}>Marketing capital sought</div>
          <StatNumber>{money(kpis.totalSeeking)}</StatNumber>
          <div style={{ fontSize: 11, color: '#8A8A9E' }}>{primary ? modelLabel[primary.model] : 'across campaigns'}</div>
        </Card>
      </KPIRow>

      <ChartRow>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ color: '#8A8A9E', fontSize: 11 }}>Pledges (last 30 days)</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>{money(kpis.totalPledged)} raised{primary?.daysLeft != null ? ` · ${primary.daysLeft} days left` : ''}</div>
            </div>
            <div style={{ display: 'flex', background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 8, padding: 2 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, background: '#1F1F2A', color: '#F5F5FA', border: 'none', fontSize: 11, cursor: 'pointer' }}>30d</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', color: '#8A8A9E', border: 'none', fontSize: 11, cursor: 'pointer' }}>7d</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, background: 'transparent', color: '#8A8A9E', border: 'none', fontSize: 11, cursor: 'pointer' }}>All</button>
            </div>
          </div>
          <div style={{ height: 220, position: 'relative' }}>
            <svg viewBox="0 0 560 200" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" aria-label="Pledges chart">
              <defs>
                <linearGradient id="gdc" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7C5CFF" stopOpacity=".45" />
                  <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="560" y2="50" stroke="#1F1F2A" strokeDasharray="2 4" />
              <line x1="0" y1="100" x2="560" y2="100" stroke="#1F1F2A" strokeDasharray="2 4" />
              <line x1="0" y1="150" x2="560" y2="150" stroke="#1F1F2A" strokeDasharray="2 4" />
              <polyline fill="url(#gdc)" stroke="none" points="0,160 40,140 80,110 120,70 160,95 200,55 240,80 280,40 320,70 360,45 400,75 440,60 480,35 520,65 560,45 560,200 0,200" />
              <polyline fill="none" stroke="#7C5CFF" strokeWidth="2.4" points="0,160 40,140 80,110 120,70 160,95 200,55 240,80 280,40 320,70 360,45 400,75 440,60 480,35 520,65 560,45" />
              <circle cx="480" cy="35" r="4" fill="#D4FF4A" />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 11, color: '#8A8A9E' }}>
            <span>Day 1</span><span>Day 8</span><span>Day 15</span><span>Day 22</span><span>Today</span>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Funding proposals</div>
            <Link href="/proposals/all" style={{ fontSize: 12 }}>See all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading && <div style={{ color: '#8A8A9E', fontSize: 13 }}>Loading…</div>}
            {!loading && (data?.proposals?.length || 0) === 0 && (
              <div style={{ color: '#8A8A9E', fontSize: 13 }}>No open proposals yet.</div>
            )}
            {(data?.proposals || []).map((p) => (
              <ListItem key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.fromName}</span>
                  <Chip $variant={p.status === 'countered' ? 'primary' : 'success'}>{p.status === 'countered' ? 'Countered' : `New · ${relTime(p.createdAt)}`}</Chip>
                </div>
                <div style={{ color: '#8A8A9E', fontSize: 12, marginBottom: 10 }}>
                  {money(p.amount)} · {modelLabel[p.model]}{p.revenueSharePct ? ` · ${p.revenueSharePct}% share` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <PrimaryButton $size="sm" as={Link} href={`/proposals/${p.reference}`}>Review</PrimaryButton>
                  <GhostButton $size="sm" as={Link} href={`/proposals/${p.reference}`}>Open thread</GhostButton>
                </div>
              </ListItem>
            ))}
          </div>
        </Card>
      </ChartRow>

      <ThreeCol>
        <Card style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Deployed capital</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <svg width="90" height="90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#1F1F2A" strokeWidth="4" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#7C5CFF" strokeWidth="4" strokeDasharray={`${Math.min(100, Math.round((data?.deployedCapital || 0) / Math.max(1, kpis.totalSeeking || 1) * 100))} 100`} transform="rotate(-90 18 18)" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ color: '#8A8A9E', fontSize: 11 }}>Deployed</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{money(data?.deployedCapital)}</div>
              <div style={{ color: '#8A8A9E', fontSize: 11, marginTop: 2 }}>of {money(kpis.totalSeeking)} sought</div>
            </div>
          </div>
          <div style={{ color: '#8A8A9E', fontSize: 12, lineHeight: 1.55 }}>
            Capital is counted when a proposal is accepted. Tranche releases are tracked on each proposal&apos;s milestone timeline.
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>My campaigns</div>
            <Link href="/explore" style={{ fontSize: 12 }}>Explore →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.campaigns || []).length === 0 && !loading && (
              <div style={{ color: '#8A8A9E', fontSize: 13 }}>No campaigns yet — <Link href="/campaigns/new">list one</Link>.</div>
            )}
            {(data?.campaigns || []).map((c) => (
              <ListItem key={c.slug} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundImage: c.image ? `url(${c.image})` : undefined, background: c.image ? undefined : 'linear-gradient(135deg,#1C1C26,#2A2A3A)', backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <Link href={`/campaigns/${c.slug}`} style={{ flex: 1, minWidth: 0, color: 'inherit' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{c.title.split('—')[0].trim()}</div>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>{c.percent}% · {c.daysLeft} days left</div>
                </Link>
                <Chip $variant={c.status === 'published' || c.status === 'funded' ? 'success' : c.status === 'in_review' ? 'primary' : undefined}>
                  {c.status === 'published' ? '● LIVE' : c.status === 'in_review' ? 'In review' : c.status === 'funded' ? 'Funded' : c.status === 'draft' ? 'Draft' : c.status}
                </Chip>
              </ListItem>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Recent activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(data?.activity || []).length === 0 && !loading && (
              <div style={{ color: '#8A8A9E', fontSize: 12 }}>No activity yet.</div>
            )}
            {(data?.activity || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <Dot $c={a.status === 'accepted' ? 'a' : a.status === 'open' || a.status === 'countered' ? 'p' : 'n'} />
                <div style={{ fontSize: 12 }}>
                  <Link href={`/proposals/${a.reference}`} style={{ color: '#F5F5FA' }}>{a.label}</Link>
                  <span style={{ color: '#8A8A9E' }}> · {relTime(a.at)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ThreeCol>

      <div style={{ padding: '0 32px 32px' }}>
        <RiskBanner>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3 L22 20 H2 Z" stroke="#FFB547" strokeWidth="1.8" />
          </svg>
          Figures reflect pledges and accepted proposals on record. Capital releases on signed terms and met milestones — nothing moves on proposal alone.
        </RiskBanner>
      </div>
    </DashboardShell>
  );
}
