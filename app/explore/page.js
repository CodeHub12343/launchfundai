'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CampaignCard from '@/components/CampaignCard';
import {
  Card, Chip, Eyebrow, GhostButton, PageFrame, PrimaryButton, ProgressBar,
  RiskBanner, RiskIcon,
} from '@/components/ui';
import { img } from '@/lib/images';
import Link from 'next/link';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  padding: 40px 48px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 48px; line-height: 1; margin: 0 0 10px;
  }
  @media (max-width: 640px) { padding: 32px 20px 16px; h1 { font-size: 36px; } }
`;

const Controls = styled.div`
  display: flex; gap: 10px; align-items: center;
  select { padding: 9px 12px; background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; border-radius: 10px; font-size: 13px; }
  .tabs { display: flex; background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; padding: 3px; }
  .tabs button { padding: 7px 12px; border-radius: 7px; background: transparent; color: ${({ theme }) => theme.colors.muted}; border: none; font-size: 12px; cursor: pointer; }
  .tabs button.on { background: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; font-weight: 500; }
`;

const SearchBar = styled.div`
  padding: 0 48px 20px;
  @media (max-width: 640px) { padding: 0 20px 16px; }
  .box {
    display: flex; gap: 10px; align-items: center;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px; padding: 6px 6px 6px 18px;
    flex-wrap: wrap;
  }
  input { flex: 1; min-width: 160px; background: transparent; border: none; color: ${({ theme }) => theme.colors.text}; font-size: 14px; padding: 12px 0; outline: none; }
`;

const Pills = styled.div`
  padding: 0 48px 32px;
  display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
  .label { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin-right: 4px; }
  .spacer { flex: 1; }
  @media (max-width: 640px) { padding: 0 20px 20px; .spacer { display: none; } }
`;

const Pill = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; font-size: 13px; cursor: pointer;
  color: ${({ theme, $on }) => ($on ? theme.colors.bg : theme.colors.mutedSoft)};
  border: 1px solid ${({ theme, $on }) => ($on ? theme.colors.text : theme.colors.border)};
  background: ${({ theme, $on }) => ($on ? theme.colors.text : 'transparent')};
  font-weight: ${({ $on }) => ($on ? 600 : 400)};
`;

const CardsGrid = styled.div`
  padding: 0 48px 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  .wide { grid-column: span 2; }
  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); .wide { grid-column: span 2; } }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 14px 32px;
    .wide { grid-column: span 2; }
  }
`;

const Spotlight = styled(Card)`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  overflow: hidden;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
  .art {
    min-height: 260px;
    background-size: cover; background-position: center;
    display: flex; align-items: center; justify-content: center; position: relative;
  }
  .ribbon { position: absolute; top: 12px; left: 12px; }
  .inner { padding: 28px; }
`;

const Pagination = styled.div`
  padding: 0 48px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  @media (max-width: 640px) { padding: 0 20px 32px; }
  .pages { display: flex; gap: 6px; flex-wrap: wrap; }
  .pages button { padding: 8px 12px; background: transparent; color: ${({ theme }) => theme.colors.text}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 8px; font-size: 13px; cursor: pointer; }
  .pages button.on { background: ${({ theme }) => theme.colors.primary}; color: #fff; border-color: transparent; font-weight: 600; }
`;

function fmtMoney(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

function toCard(c) {
  const percent = c.goal ? Math.round((c.pledged / c.goal) * 100) : 0;
  return {
    id: c.slug,
    image: c.image,
    category: c.category,
    percent,
    title: c.title,
    creator: `${c.creatorName || 'Creator'}${c.verified ? ' · Verified ✓' : ''}`,
    pledged: `${fmtMoney(c.pledged)} pledged`,
    goal: `${fmtMoney(c.goal)} goal`,
    seeking: `$${(c.seeking || 0).toLocaleString()}`,
    progress: Math.min(100, percent),
  };
}

export default function ExplorePage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('trending');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '12', sort });
    if (cat !== 'All') params.set('category', cat);
    fetch(`/api/campaigns?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCards((data.items || []).map(toCard));
        setTotal(data.total || 0);
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [cat, sort]);

  return (
    <Page>
      <Nav />

      <PageFrame>

      <Header>
        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Marketplace</Eyebrow>
          <h1>Explore funded campaigns</h1>
          <div style={{ color: '#8A8A9E', fontSize: 14 }}>{total || '—'} opportunities actively seeking post-goal growth capital · updated just now</div>
        </div>
        <Controls>
          <div className="tabs">
            <button className="on">Grid</button>
            <button>List</button>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="trending">Sort: Trending</option>
            <option value="funded">Most funded</option>
            <option value="closing">Closing soon</option>
            <option value="newest">Newest</option>
          </select>
        </Controls>
      </Header>

      <SearchBar>
        <div className="box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="#8A8A9E" strokeWidth="1.8" />
            <path d="M20 20 L16 16" stroke="#8A8A9E" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input placeholder="Search by product, creator, or keyword…" />
          <GhostButton $size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6 H21 M6 12 H18 M10 18 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Filters · 3
          </GhostButton>
          <PrimaryButton $size="sm">Search</PrimaryButton>
        </div>
      </SearchBar>

      <Pills>
        <span className="label">Category:</span>
        <Pill $on={cat === 'All'} onClick={() => setCat('All')}>All</Pill>
        {['Hardware', 'Tech', 'Games', 'Food & Beverage', 'Fashion', 'Home', 'Publishing', 'Film & Video', 'Music', 'Art', 'Design', 'Health & Wellness', 'Sports & Outdoors', 'Travel', 'Education', 'Other'].map((c) => (
          <Pill key={c} $on={cat === c} onClick={() => setCat(c)}>{c}</Pill>
        ))}
        <span className="spacer" />
        <Pill style={{ background: 'rgba(212,255,74,.08)', borderColor: 'rgba(212,255,74,.3)', color: '#D4FF4A' }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: '#D4FF4A' }} />
          Funded (142%+)
        </Pill>
        <Pill>Milestone-ready</Pill>
      </Pills>

      <CardsGrid>
        {loading && cards.length === 0 && (
          <div style={{ gridColumn: 'span 3', padding: 40, textAlign: 'center', color: '#8A8A9E' }}>Loading campaigns…</div>
        )}
        {!loading && cards.length === 0 && (
          <div style={{ gridColumn: 'span 3', padding: 40, textAlign: 'center', color: '#8A8A9E' }}>No campaigns match these filters.</div>
        )}
        {cards.map((c) => <CampaignCard key={c.id} {...c} />)}
      </CardsGrid>

      {total > cards.length && (
        <Pagination>
          <div style={{ color: '#8A8A9E', fontSize: 13 }}>Showing {cards.length} of {total} campaigns</div>
        </Pagination>
      )}

      <div style={{ padding: '0 48px 48px' }}>
        <RiskBanner>
          <RiskIcon />
          <div>
            Campaign listings show pledged amounts and milestone status. They are not offers of securities. Review each campaign&apos;s risk disclosures before submitting interest.
          </div>
        </RiskBanner>
      </div>

      </PageFrame>

      <Footer />
    </Page>
  );
}
