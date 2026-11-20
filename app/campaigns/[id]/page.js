'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
  Card, Chip, GhostButton, PageFrame, PrimaryButton, ProgressBar,
  RiskBanner, RiskIcon, StatNumber,
} from '@/components/ui';
import { img, campaignGallery } from '@/lib/images';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Crumb = styled.div`
  padding: 20px 48px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  a { color: inherit; }
  span.cur { color: ${({ theme }) => theme.colors.text}; }
  @media (max-width: 640px) { padding: 16px 20px; }
`;

const Hero = styled.div`
  padding: 12px 48px 32px;
  display: grid;
  grid-template-columns: 1fr 440px;
  gap: 40px;
  @media (max-width: 960px) { grid-template-columns: 1fr; padding: 12px 32px 32px; }
  @media (max-width: 640px) { padding: 12px 20px 24px; gap: 24px; }
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 52px; line-height: 1.02; margin: 0 0 16px;
    @media (max-width: 640px) { font-size: 36px; }
  }
`;

const HeroArt = styled.div`
  height: 440px;
  background-image: linear-gradient(180deg, rgba(10,10,15,.0), rgba(10,10,15,.35)), url(${({ $img }) => $img});
  background-size: cover; background-position: center;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  @media (max-width: 640px) { height: 280px; }
  .thumbs { position: absolute; bottom: 16px; left: 16px; display: flex; gap: 6px; }
  .thumbs div {
    width: 64px; height: 44px; border-radius: 6px;
    background-size: cover; background-position: center;
    opacity: .75; cursor: pointer;
    &.on { opacity: 1; outline: 2px solid #7C5CFF; outline-offset: 1px; }
  }
`;

const Sticky = styled(Card)`
  padding: 28px;
  align-self: start;
  position: sticky;
  top: 20px;
  min-width: 0;
  @media (max-width: 960px) { position: static; }
  @media (max-width: 640px) { padding: 20px 16px; }
`;

const Tabs = styled.div`
  padding: 32px 48px 0;
  @media (max-width: 640px) { padding: 24px 20px 0; }
  .bar { display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; overflow-x: auto; }
  .tab { padding: 14px 20px; font-size: 13px; color: ${({ theme }) => theme.colors.muted}; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
  .tab.on { color: ${({ theme }) => theme.colors.text}; border-bottom-color: ${({ theme }) => theme.colors.primary}; font-weight: 600; }
`;

const ContentGrid = styled.div`
  padding: 0 48px 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
  .wide { grid-column: span 2; }
  > * { min-width: 0; }
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); padding: 0 32px 32px; .wide { grid-column: auto; } }
  @media (max-width: 640px) { padding: 0 14px 24px; gap: 14px; }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 13px;
  gap: 12px;
  &:first-child { border-top: none; padding-top: 0; }
  > span:last-child { text-align: right; min-width: 0; }
  @media (max-width: 640px) {
    font-size: 12px; padding: 12px 0;
    > span:first-child { flex-shrink: 0; }
  }
`;

const MarketingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 760px) { grid-template-columns: 1fr; gap: 10px; }
`;

const PerfStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 18px;
  @media (max-width: 640px) { gap: 14px; }
`;

const StickyKpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

const CardPad = styled(Card)`
  padding: 28px;
  min-width: 0;
  @media (max-width: 640px) { padding: 18px 16px; }
`;

const SectionLabel = styled.div`
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 10px;
`;

const MktHead = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
  .amt { font-weight: 600; font-size: 18px; }
  @media (max-width: 640px) { .amt { font-size: 15px; } }
`;

const MilestoneStep = styled.div`
  display: flex; gap: 14px;
  .dot {
    width: 28px; height: 28px; border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px; flex-shrink: 0;
  }
  .dot.done { background: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.bg}; }
  .dot.active { background: rgba(124,92,255,.15); color: ${({ theme }) => theme.colors.primarySoft}; border: 1px solid ${({ theme }) => theme.colors.primary}; }
  .dot.pending { background: ${({ theme }) => theme.colors.surface}; color: ${({ theme }) => theme.colors.muted}; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; }
  .t { font-weight: 500; font-size: 14px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin-top: 2px; }
`;

const money = (n) => (n || n === 0 ? `$${Math.round(n).toLocaleString()}` : '—');
const modelLabel = { sponsor: 'Marketing Sponsorship', participation: 'Revenue Participation', growth: 'Growth Partnership' };

export default function CampaignDetailsPage() {
  const params = useParams();
  const slug = params.id;
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/campaigns/${slug}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) setError(data.error || 'Not found');
        else setC(data.campaign);
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Page><Nav /><PageFrame><div style={{ padding: 80, textAlign: 'center', color: '#8A8A9E' }}>Loading campaign…</div></PageFrame><Footer /></Page>
    );
  }
  if (error || !c) {
    return (
      <Page><Nav /><PageFrame>
        <div style={{ padding: 80, textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: 40 }}>Campaign not found</h1>
          <p style={{ color: '#8A8A9E' }}>{error || 'The campaign you were looking for is not available.'}</p>
          <PrimaryButton as={Link} href="/explore" style={{ marginTop: 20 }}>Browse campaigns →</PrimaryButton>
        </div>
      </PageFrame><Footer /></Page>
    );
  }

  const percent = c.goal ? Math.round((c.pledged / c.goal) * 100) : 0;
  const gallery = [c.image, ...(c.gallery || [])].filter(Boolean);
  const galleryShown = gallery.length ? gallery : campaignGallery;
  const creatorAvatar = c.creator?.avatar || '';
  const creatorName = c.creator?.company || c.creatorName || `${c.creator?.firstName || ''} ${c.creator?.lastName || ''}`.trim() || 'Creator';

  return (
    <Page>
      <Nav />
      <PageFrame>
      <Crumb>
        <Link href="/explore">Explore</Link> &nbsp;·&nbsp; <Link href="/explore">{c.category}</Link> &nbsp;·&nbsp; <span className="cur">{c.title.split('—')[0].trim()}</span>
      </Crumb>

      <Hero>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <Chip>{c.category}</Chip>
            <Chip $variant="success">● {percent}% funded</Chip>
            {c.status === 'published' && <Chip $variant="primary">Milestone-ready</Chip>}
            {c.status === 'funded' && <Chip $variant="primary">Fully funded</Chip>}
          </div>
          <h1>{c.title}</h1>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, backgroundImage: `url(${creatorAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{creatorName}</div>
              <div style={{ color: '#8A8A9E', fontSize: 12 }}>{c.creatorLocation || '—'} · {c.verified ? 'Verified identity ✓' : 'Unverified'}</div>
            </div>
          </div>
          <HeroArt $img={galleryShown[0]}>
            <div className="thumbs">
              {galleryShown.slice(0, 4).map((src, i) => (
                <div key={i} className={i === 0 ? 'on' : ''} style={{ backgroundImage: `url(${src})` }} />
              ))}
            </div>
          </HeroArt>
        </div>

        <Sticky>
          <div style={{ color: '#8A8A9E', fontSize: 12, marginBottom: 6 }}>Kickstarter progress</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <StatNumber $size="36px">{money(c.pledged)}</StatNumber>
            <span style={{ color: '#8A8A9E', fontSize: 12 }}>of {money(c.goal)} · {percent}%</span>
          </div>
          <ProgressBar $value={Math.min(100, percent)} $height="6px"><span /></ProgressBar>
          <StickyKpiGrid>
            <Card style={{ padding: 14, background: '#0A0A0F' }}>
              <div style={{ color: '#8A8A9E', fontSize: 11 }}>Backers</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{(c.backers || 0).toLocaleString()}</div>
            </Card>
            <Card style={{ padding: 14, background: '#0A0A0F' }}>
              <div style={{ color: '#8A8A9E', fontSize: 11 }}>Days left</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{c.daysLeft ?? '—'}</div>
            </Card>
          </StickyKpiGrid>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1F1F2A' }}>
            <div style={{ color: '#8A8A9E', fontSize: 11, marginBottom: 4 }}>Marketing capital sought</div>
            <StatNumber $size="40px" style={{ color: '#D4FF4A' }}>{money(c.seeking)}</StatNumber>
            <div style={{ color: '#8A8A9E', fontSize: 12, marginTop: 6 }}>under {modelLabel[c.model] || 'Revenue Participation'} · milestone-gated</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
            <PrimaryButton $full as={Link} href={`/proposals/new?campaign=${c.slug}`}>Submit Funding Interest →</PrimaryButton>
            <GhostButton $full>Contact Creator</GhostButton>
            <button style={{ background: 'transparent', border: 'none', color: '#8A8A9E', fontSize: 12, cursor: 'pointer', padding: 6 }}>♡ Save opportunity</button>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,181,71,.06)', border: '1px solid rgba(255,181,71,.2)', borderRadius: 8, fontSize: 11, color: '#B8B8C8', lineHeight: 1.5 }}>
            <strong style={{ color: '#FFB547' }}>Not a security offering.</strong> Interest is non-binding and subject to compliance review in your jurisdiction.
          </div>
        </Sticky>
      </Hero>

      <Tabs>
        <div className="bar">
          <div className="tab on">Overview</div>
          <div className="tab">Marketing Plan</div>
          <div className="tab">Milestones</div>
          <div className="tab">Terms</div>
          <div className="tab">Risk Disclosures</div>
          <div className="tab">Updates</div>
        </div>
      </Tabs>

      <ContentGrid>
        <CardPad>
          <SectionLabel>About the campaign</SectionLabel>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: '#D8D8E4', margin: '0 0 18px' }}>
            {c.tagline || c.description || 'This creator has not written a long-form description yet.'}
          </p>
          {c.description && c.tagline && (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: '#B8B8C8', margin: 0 }}>{c.description}</p>
          )}
        </CardPad>

        <CardPad>
          <SectionLabel>Campaign performance</SectionLabel>
          <PerfStatGrid>
            <div><div style={{ color: '#8A8A9E', fontSize: 11 }}>Average pledge</div><StatNumber $size="28px">{c.backers ? money(Math.round(c.pledged / c.backers)) : '—'}</StatNumber></div>
            <div><div style={{ color: '#8A8A9E', fontSize: 11 }}>Funded</div><StatNumber $size="28px">{percent}%</StatNumber></div>
            <div><div style={{ color: '#8A8A9E', fontSize: 11 }}>Backers</div><StatNumber $size="28px">{(c.backers || 0).toLocaleString()}</StatNumber></div>
            <div><div style={{ color: '#8A8A9E', fontSize: 11 }}>Days left</div><StatNumber $size="28px">{c.daysLeft ?? 0}</StatNumber></div>
          </PerfStatGrid>
          <div style={{ height: 120, position: 'relative', marginTop: 8, borderTop: '1px dashed #2A2A38', paddingTop: 16 }}>
            <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" aria-label="Daily pledge chart">
              <defs>
                <linearGradient id="gcd" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7C5CFF" stopOpacity=".4" />
                  <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="url(#gcd)" stroke="none" points="0,80 20,70 40,50 60,30 80,45 100,25 120,40 140,20 160,35 180,22 200,38 220,30 240,18 260,32 280,25 300,40 320,28 340,35 360,22 380,30 400,40 400,100 0,100" />
              <polyline fill="none" stroke="#7C5CFF" strokeWidth="2" points="0,80 20,70 40,50 60,30 80,45 100,25 120,40 140,20 160,35 180,22 200,38 220,30 240,18 260,32 280,25 300,40 320,28 340,35 360,22 380,30 400,40" />
            </svg>
            <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 11, color: '#8A8A9E' }}>Daily pledges · 30d</div>
          </div>
        </CardPad>

        <CardPad className="wide">
          <MktHead>
            <div>
              <SectionLabel style={{ marginBottom: 6 }}>Marketing strategy (AI-assisted)</SectionLabel>
              <div className="amt">{money(c.seeking)} · 90-day growth plan</div>
            </div>
            <Link href="/studio" style={{ fontSize: 13 }}>Open in Studio →</Link>
          </MktHead>
          <MarketingGrid>
            <div style={{ padding: 18, background: 'rgba(124,92,255,.08)', border: '1px solid rgba(124,92,255,.2)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: '#8A8A9E' }}>Days 0–30</div>
              <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0 10px' }}>Paid acquisition</div>
              <div style={{ fontSize: 12, color: '#B8B8C8', lineHeight: 1.5 }}>Meta prospecting + Google PMax. ~{money(Math.round((c.seeking || 0) * 0.4))}. CAC target $26.</div>
            </div>
            <div style={{ padding: 18, background: 'rgba(212,255,74,.06)', border: '1px solid rgba(212,255,74,.2)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: '#8A8A9E' }}>Days 30–60</div>
              <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0 10px' }}>Creator &amp; UGC</div>
              <div style={{ fontSize: 12, color: '#B8B8C8', lineHeight: 1.5 }}>24 creators across TikTok + YouTube Shorts. ~{money(Math.round((c.seeking || 0) * 0.35))}.</div>
            </div>
            <div style={{ padding: 18, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: '#8A8A9E' }}>Days 60–90</div>
              <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0 10px' }}>Retail &amp; PR</div>
              <div style={{ fontSize: 12, color: '#B8B8C8', lineHeight: 1.5 }}>Trade press, design outlets, pop-ups. ~{money(Math.round((c.seeking || 0) * 0.25))}.</div>
            </div>
          </MarketingGrid>
          <div style={{ fontSize: 11, color: '#8A8A9E', paddingTop: 14, borderTop: '1px dashed #2A2A38' }}>
            Projections are illustrative and based on peer-campaign medians. Not a guaranteed outcome.
          </div>
        </CardPad>

        <CardPad>
          <SectionLabel style={{ marginBottom: 14 }}>Milestones &amp; capital release</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <MilestoneStep>
              <div className="dot done">✓</div>
              <div><div className="t">M0 — Crowdfunding goal reached</div><div className="d">Completed · {money(c.goal)}</div></div>
            </MilestoneStep>
            {(c.milestones || []).map((m, i) => (
              <MilestoneStep key={i}>
                <div className={`dot ${m.status}`}>{m.status === 'done' ? '✓' : i + 1}</div>
                <div>
                  <div className="t">M{i + 1} — {m.label} · <span style={{ color: m.status === 'done' ? '#D4FF4A' : '#B8B8C8' }}>{money(m.amount)} {m.status === 'done' ? 'released' : 'release'}</span></div>
                  <div className="d">{m.description || (m.dueAt ? `Est. ${new Date(m.dueAt).toLocaleDateString()}` : 'Milestone estimate')}</div>
                </div>
              </MilestoneStep>
            ))}
          </div>
        </CardPad>

        <CardPad>
          <SectionLabel style={{ marginBottom: 14 }}>Proposed terms (negotiable)</SectionLabel>
          <Row><span style={{ color: '#8A8A9E' }}>Structure</span><span style={{ fontWeight: 500 }}>{modelLabel[c.model]}</span></Row>
          <Row><span style={{ color: '#8A8A9E' }}>Capital</span><span style={{ fontWeight: 500 }}>{money(c.seeking)} ({(c.milestones || []).length || 3} tranches)</span></Row>
          {c.revenueSharePct > 0 && <Row><span style={{ color: '#8A8A9E' }}>Revenue share</span><span style={{ fontWeight: 500 }}>{c.revenueSharePct}% of defined net revenue</span></Row>}
          {c.returnCap && <Row><span style={{ color: '#8A8A9E' }}>Share duration</span><span style={{ fontWeight: 500 }}>Until {c.returnCap} return cap</span></Row>}
          <Row><span style={{ color: '#8A8A9E' }}>Reporting cadence</span><span style={{ fontWeight: 500 }}>Monthly (automated)</span></Row>
          <Row><span style={{ color: '#8A8A9E' }}>Governing law</span><span style={{ fontWeight: 500 }}>{c.jurisdiction}</span></Row>
          <GhostButton $full style={{ marginTop: 18 }}>Download term sheet (PDF)</GhostButton>
        </CardPad>

        <CardPad className="wide" style={{ borderColor: 'rgba(255,181,71,.25)', background: 'rgba(255,181,71,.03)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <RiskIcon />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>What you should know before proposing</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#B8B8C8', fontSize: 13, lineHeight: 1.8 }}>
                <li>Reaching a crowdfunding goal does not guarantee fulfillment or future revenue.</li>
                <li>Revenue participation is only offered where legally permitted. Compliance review is required in your jurisdiction.</li>
                <li>Capital releases are milestone-gated; a missed milestone can delay or stop further tranches.</li>
                <li>Returns are not guaranteed and may be lower than capital deployed.</li>
                <li>LaunchFund AI is a marketplace, not a broker-dealer. We do not provide investment advice.</li>
                {(c.risks || []).map((r, i) => (
                  <li key={i}>{r.label}{r.note ? ` — ${r.note}` : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardPad>
      </ContentGrid>

      </PageFrame>
      <Footer />
    </Page>
  );
}
