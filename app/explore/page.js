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
import CategorySelect from '@/components/CategorySelect';

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

const Toolbar = styled.div`
  padding: 0 48px 24px;
  @media (max-width: 640px) { padding: 0 16px 16px; }
`;

const ToolbarCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 6px 10px 6px 14px;
  min-width: 0;
  input { flex: 1; min-width: 0; background: transparent; border: none; color: inherit; font: inherit; font-size: 14px; padding: 10px 0; outline: none; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  padding: 10px 2px 0;
  @media (max-width: 760px) { padding-top: 6px; }
`;

const Chip2 = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 999px;
  font: inherit; font-size: 12.5px; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  color: ${({ theme, $on }) => ($on ? theme.colors.bg : theme.colors.mutedSoft)};
  background: ${({ theme, $on }) => ($on ? theme.colors.text : 'transparent')};
  border: 1px solid ${({ theme, $on }) => ($on ? theme.colors.text : theme.colors.border)};
  &:hover { border-color: ${({ theme, $on }) => ($on ? theme.colors.text : theme.colors.borderStrong)}; }
`;

const ViewToggle = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.bg}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; padding: 3px;
  button { padding: 7px 12px; border-radius: 7px; background: transparent; color: ${({ theme }) => theme.colors.muted}; border: none; font-size: 12px; cursor: pointer; font-family: inherit; }
  button.on { background: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; font-weight: 500; }
`;

const SortSelect = styled.select`
  padding: 9px 12px;
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 56px 24px;
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  .icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, rgba(124,92,255,.15), rgba(212,255,74,.08)); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-weight: 400; font-size: 24px; margin: 0 0 8px; }
  p { color: ${({ theme }) => theme.colors.muted}; font-size: 14px; margin: 0 0 20px; line-height: 1.5; max-width: 420px; margin-left: auto; margin-right: auto; }
  .actions { display: inline-flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
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
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');
  const [funded, setFunded] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const activeFilters = (cat !== 'All' ? 1 : 0) + (funded ? 1 : 0) + (milestone ? 1 : 0) + (query ? 1 : 0);
  const resetFilters = () => { setCat('All'); setFunded(false); setMilestone(false); setQuery(''); };

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
      </Header>

      <Toolbar>
        <ToolbarCard>
          <SearchRow>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="#8A8A9E" strokeWidth="1.8" />
              <path d="M20 20 L16 16" stroke="#8A8A9E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search campaigns, creators or keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" style={{ background: 'transparent', border: 'none', color: '#8A8A9E', cursor: 'pointer', padding: 6 }}>×</button>
            )}
          </SearchRow>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <ViewToggle>
              <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Grid</button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button>
            </ViewToggle>
            <SortSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort campaigns">
              <option value="trending">Trending</option>
              <option value="funded">Most funded</option>
              <option value="closing">Closing soon</option>
              <option value="newest">Newest</option>
            </SortSelect>
          </div>
          <FilterRow style={{ gridColumn: '1 / -1' }}>
            <CategorySelect
              compact
              includeAll
              label="Category"
              value={cat}
              onChange={(k) => setCat(k)}
            />
            <Chip2 type="button" $on={funded} onClick={() => setFunded((v) => !v)}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: funded ? '#0A0A0F' : '#D4FF4A' }} />
              Funded 100%+
            </Chip2>
            <Chip2 type="button" $on={milestone} onClick={() => setMilestone((v) => !v)}>Milestone-ready</Chip2>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#B8B8C8', fontSize: 12.5, cursor: 'pointer', padding: '8px 4px', fontFamily: 'inherit' }}
              >
                Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
              </button>
            )}
          </FilterRow>
        </ToolbarCard>
      </Toolbar>

      <CardsGrid>
        {loading && cards.length === 0 && (
          <EmptyState>
            <div className="icon">⏳</div>
            <h3>Loading campaigns…</h3>
            <p>Pulling the latest opportunities from the marketplace.</p>
          </EmptyState>
        )}
        {!loading && cards.length === 0 && (
          <EmptyState>
            <div className="icon">🔍</div>
            <h3>No campaigns match these filters</h3>
            <p>
              {activeFilters > 0
                ? 'Try widening your category, clearing a filter, or searching for a different keyword.'
                : 'Nothing has been listed yet. Check back soon, or be the first to list a campaign.'}
            </p>
            <div className="actions">
              {activeFilters > 0 && (
                <PrimaryButton $size="sm" onClick={resetFilters}>Clear all filters</PrimaryButton>
              )}
              <GhostButton $size="sm" as={Link} href="/campaigns/new">List a campaign →</GhostButton>
            </div>
          </EmptyState>
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
