'use client';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import {
  Card, Chip, Eyebrow, GhostButton, H1Serif, H2Serif, PageFrame, PrimaryButton,
  ProgressBar, RiskBanner, RiskIcon, StatNumber,
} from '@/components/ui';
import { img, category, caseStudy } from '@/lib/images';

const float = keyframes`
  0%, 100% { transform: rotate(-1.5deg) translateY(0); }
  50%      { transform: rotate(-1.5deg) translateY(-10px); }
`;

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
`;

const Section = styled.section`
  padding: ${({ $pad }) => $pad || '96px 72px'};
  @media (max-width: 960px) { padding: 64px 32px; }
  @media (max-width: 640px) { padding: 48px 20px; }
`;

const Hero = styled(Section)`
  position: relative;
  overflow: hidden;
  .halo-a { position: absolute; top: -120px; right: -120px; width: 520px; height: 520px; background: radial-gradient(circle, rgba(124,92,255,.22), transparent 60%); pointer-events: none; }
  .halo-b { position: absolute; bottom: -200px; left: 200px; width: 420px; height: 420px; background: radial-gradient(circle, rgba(212,255,74,.08), transparent 60%); pointer-events: none; }
  .grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 72px; align-items: center; position: relative; }
  @media (max-width: 960px) { .grid { grid-template-columns: 1fr; gap: 48px; } }
  @media (max-width: 640px) { .hero-lede { font-size: 15px !important; line-height: 1.5 !important; margin-bottom: 28px !important; } }
`;

const KPIs = styled.div`
  display: flex;
  gap: 32px;
  padding-top: 28px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  max-width: 520px;
  .k { min-width: 0; strong { display: block; font-size: 24px; font-weight: 700; } span { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; line-height: 1.35; display: block; } }
  @media (max-width: 640px) {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px; padding-top: 20px;
    .k strong { font-size: 20px; }
    .k span { font-size: 11px; }
  }
`;

const HeroCard = styled(Card)`
  padding: 24px;
  transform: rotate(-1.5deg);
  animation: ${float} 6s ease-in-out infinite;
  @media (max-width: 640px) { transform: none; animation: none; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const HeroArt = styled.div`
  background-image: linear-gradient(180deg, rgba(10,10,15,.0), rgba(10,10,15,.55)), url(${({ $img }) => $img});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  height: 220px;
  margin-bottom: 18px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
`;

const HeroPop = styled(Card)`
  padding: 16px 20px;
  position: absolute;
  bottom: -32px;
  left: -40px;
  display: flex;
  gap: 12px;
  align-items: center;
  transform: rotate(2deg);
  box-shadow: ${({ theme }) => theme.shadow.pop};
  @media (max-width: 640px) { position: static; transform: none; margin-top: 16px; }
`;

const LogoStrip = styled.div`
  padding: 24px 72px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  .lbl { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
  .brands { display: flex; gap: 44px; align-items: center; opacity: .65; font-family: ${({ theme }) => theme.fonts.serif}; font-size: 22px; flex-wrap: wrap; }
  @media (max-width: 960px) { padding: 20px 32px; flex-direction: column; align-items: flex-start; gap: 16px; .brands { gap: 24px; font-size: 18px; } }
  @media (max-width: 640px) { padding: 20px; }
`;

const Grid4 = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  @media (max-width: 960px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const StepCard = styled(Card)`
  padding: 28px;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 12px 30px -16px rgba(124, 92, 255, 0.45);
  }
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 44px; color: ${({ theme }) => theme.colors.primary}; line-height: 1; margin-bottom: 20px; }
  .t { font-weight: 600; font-size: 17px; margin-bottom: 8px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 14px; line-height: 1.55; }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const ModelCard = styled(Card)`
  padding: 32px;
  border-top: 3px solid ${({ $color }) => $color || '#7C5CFF'};
  position: relative;
  transition: transform 220ms ease, box-shadow 220ms ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 34px -18px ${({ $color }) => $color || '#7C5CFF'}80;
  }
  .ribbon {
    position: absolute; top: -10px; right: 20px;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.bg};
    font-size: 11px; font-weight: 700;
    padding: 3px 8px; border-radius: 999px;
  }
  ul { list-style: none; padding: 0; margin: 0; font-size: 13px; color: ${({ theme }) => theme.colors.mutedSoft}; }
  ul li { padding: 10px 0; border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`;

const Studio = styled(Card)`
  padding: 56px;
  background: linear-gradient(135deg, #13131A 0%, #1C1C26 100%);
  position: relative;
  overflow: hidden;
  .halo { position: absolute; top: -80px; right: -80px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(124,92,255,.15), transparent 60%); pointer-events: none; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; position: relative; }
  @media (max-width: 960px) { padding: 32px; .grid { grid-template-columns: 1fr; gap: 32px; } }
`;

const Mock = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 4px;
  .bar { padding: 12px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; display: flex; gap: 8px; align-items: center; }
  .bar span.dot { width: 10px; height: 10px; border-radius: 999px; }
  .bar .url { margin-left: 14px; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
  .inner { padding: 20px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${({ theme }) => theme.colors.surface}; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
  .foot { margin-top: 14px; padding: 10px; font-size: 11px; color: ${({ theme }) => theme.colors.muted}; border-top: 1px dashed ${({ theme }) => theme.colors.borderStrong}; }
`;

const Pricing = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const PriceCard = styled(Card)`
  padding: 32px;
  ${({ $featured, theme }) => $featured && `border-color: ${theme.colors.primary};`}
  .n { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
  .p { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 56px; line-height: 1; margin-bottom: 6px; span { font-size: 18px; color: ${({ theme }) => theme.colors.muted}; } }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 13px; margin-bottom: 28px; }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 960px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const CategoryCard = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 180px;
  padding: 18px;
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-image: linear-gradient(180deg, rgba(10,10,15,.1) 0%, rgba(10,10,15,.75) 85%), url(${({ $img }) => $img});
  background-size: cover;
  background-position: center;
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 16px 32px -18px rgba(124, 92, 255, 0.5);
  }
  .lbl { font-weight: 600; font-size: 16px; }
  .ct { color: #D4FF4A; font-size: 12px; margin-top: 2px; }
`;

const CaseStudyCard = styled(Card)`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  overflow: hidden;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
  .img {
    min-height: 340px;
    background-image: url(${({ $img }) => $img});
    background-size: cover;
    background-position: center;
    position: relative;
  }
  .img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 60%, rgba(19,19,26,.6)); }
  @media (max-width: 960px) { .img { min-height: 220px; } }
  .body { padding: 48px; }
  @media (max-width: 640px) { .body { padding: 28px; } }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 20px 0; margin: 22px 0; border-top: 1px solid ${({ theme }) => theme.colors.border}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  .stats strong { display: block; font-family: ${({ theme }) => theme.fonts.serif}; font-size: 26px; color: #D4FF4A; }
  .stats span { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; }
`;

const ReviewCard = styled(Card)`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 16px 36px -20px rgba(124, 92, 255, 0.55);
  }
  .img {
    position: relative;
    min-height: 160px;
    background-size: cover;
    background-position: center;
    padding: 14px;
    display: flex;
    align-items: flex-end;
  }
  .body { padding: 24px 26px 26px; display: flex; flex-direction: column; gap: 0; }
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const FAQItem = styled(Card)`
  padding: 24px 26px;
  .q { font-weight: 600; font-size: 15px; margin-bottom: 8px; display: flex; justify-content: space-between; gap: 12px; }
  .q span.plus { color: ${({ theme }) => theme.colors.primary}; font-size: 20px; line-height: 1; }
  .a { color: ${({ theme }) => theme.colors.muted}; font-size: 13.5px; line-height: 1.6; }
`;

const CTABox = styled(Card)`
  padding: 72px;
  text-align: center;
  background: linear-gradient(135deg, rgba(124,92,255,.14), rgba(212,255,74,.06));
  border-color: rgba(124,92,255,.3);
  @media (max-width: 640px) { padding: 40px 24px; }
`;

const fmtMoney = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v.toLocaleString()}`;
};

export default function HomePage() {
  const [stats, setStats] = useState({ liveCampaigns: 0, deployedCapital: 0, partners: 0 });
  useEffect(() => {
    fetch('/api/stats').then((r) => (r.ok ? r.json() : null)).then((d) => d && setStats(d));
  }, []);
  return (
    <Page>
      <Nav />

      <PageFrame>

      <Hero>
        <div className="halo-a" />
        <div className="halo-b" />
        <div className="grid">
          <div>
            <Chip style={{ marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#D4FF4A' }} /> Now onboarding Q1 2027 campaigns
            </Chip>
            <H1Serif style={{ margin: '16px 0 24px' }}>
              Your Kickstarter<br />deserves a <em>bigger</em> launch.
            </H1Serif>
            <p className="hero-lede" style={{ fontSize: 18, lineHeight: 1.55, color: '#B8B8C8', maxWidth: 520, margin: '0 0 36px' }}>
              Reach your goal, then scale it. LaunchFund AI connects post-goal creators with vetted marketing partners and funding sponsors — with AI to plan, allocate, and measure the growth capital that gets you from funded to flagship.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
              <PrimaryButton as={Link} href="/campaigns/new">List My Campaign →</PrimaryButton>
              <GhostButton as={Link} href="/explore">Explore Campaigns</GhostButton>
            </div>
            <KPIs>
              <div className="k"><strong>{fmtMoney(stats.deployedCapital)}</strong><span>Capital deployed</span></div>
              <div className="k"><strong>{stats.liveCampaigns.toLocaleString()}</strong><span>Live campaigns</span></div>
              <div className="k"><strong>{stats.partners.toLocaleString()}</strong><span>Partners onboarded</span></div>
            </KPIs>
          </div>

          <div style={{ position: 'relative' }}>
            <HeroCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Chip>Example preview</Chip>
                <span style={{ color: '#8A8A9E', fontSize: 12 }}>What a listing looks like</span>
              </div>
              <HeroArt $img={img.heroProduct}>
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <Chip>Your category</Chip>
                </div>
              </HeroArt>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Your funded campaign</div>
              <div style={{ color: '#8A8A9E', fontSize: 13, marginBottom: 16 }}>by your studio · your city</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#8A8A9E' }}>Pledged</span>
                <span style={{ fontWeight: 600 }}>Your pledge total / goal</span>
              </div>
              <ProgressBar $value={72}><span /></ProgressBar>
              <div style={{ marginTop: 18, padding: 14, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" stroke="#7C5CFF" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#8A8A9E' }}>AI growth plan</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Sized to your category &amp; velocity</div>
                </div>
              </div>
            </HeroCard>
            <HeroPop>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#7C5CFF,#D4FF4A)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Partner proposals</div>
                <div style={{ color: '#8A8A9E', fontSize: 11 }}>sponsorship · revenue share · growth</div>
              </div>
            </HeroPop>
          </div>
        </div>
      </Hero>

      <LogoStrip>
        <div className="lbl">Working alongside creators and partners from</div>
        <div className="brands">
          <span>Kickstarter</span><span>Indiegogo</span><span>Shopify</span><span>Stripe</span><span>Meta</span><span>TikTok</span>
        </div>
      </LogoStrip>

      <Section id="how">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 56, gap: 20, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 620 }}>
            <Eyebrow style={{ marginBottom: 14 }}>How post-goal funding works</Eyebrow>
            <H2Serif>From funded to flagship,<br />in four deliberate steps.</H2Serif>
          </div>
          <Link href="#" style={{ fontSize: 14 }}>Read the full playbook →</Link>
        </div>
        <Grid4>
          {[
            ['01', 'Submit your funded campaign', 'Connect your Kickstarter or Indiegogo. We verify funding status, creator identity, and fulfillment plan.'],
            ['02', 'AI plans your growth', 'Marketing Studio builds a 30/60/90-day plan, estimates channel ROI, and sizes the capital you actually need.'],
            ['03', 'Receive partner proposals', 'Vetted sponsors and funding partners submit non-binding proposals. Compare terms side by side.'],
            ['04', 'Execute against milestones', 'Capital releases on agreed milestones. You report transparently. Both sides see the same numbers.'],
          ].map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 100}>
              <StepCard>
                <div className="n">{n}</div>
                <div className="t">{t}</div>
                <div className="d">{d}</div>
              </StepCard>
            </Reveal>
          ))}
        </Grid4>
      </Section>

      <Section $pad="0 72px 120px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40, gap: 20, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 620 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Browse by category</Eyebrow>
            <H2Serif>Capital flows to every shape of product.</H2Serif>
          </div>
          <Link href="/explore" style={{ fontSize: 14 }}>See all categories →</Link>
        </div>
        <CategoryGrid>
          {[
            ['Hardware', 'Open to listings', category.hardware, 'hardware'],
            ['Tech', 'Open to listings', category.tech, 'tech'],
            ['Games', 'Open to listings', category.games, 'games'],
            ['Food & Beverage', 'Open to listings', category.food, 'food'],
            ['Fashion', 'Open to listings', category.fashion, 'fashion'],
            ['Home', 'Open to listings', category.home, 'home'],
            ['Publishing', 'Open to listings', category.publishing, 'publishing'],
            ['Travel', 'Open to listings', category.travel, 'travel'],
          ].map(([name, count, src, slug]) => (
            <CategoryCard key={name} href={`/explore?cat=${slug}`} $img={src}>
              <div className="lbl">{name}</div>
              <div className="ct">{count}</div>
            </CategoryCard>
          ))}
        </CategoryGrid>
      </Section>

      <Section $pad="0 72px 120px">
        <div style={{ marginBottom: 48 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Three ways to partner</Eyebrow>
          <H2Serif style={{ maxWidth: 720 }}>Pick the model that matches the risk, not the hype.</H2Serif>
        </div>
        <Grid3>
          <Reveal>
          <ModelCard $color="#7C5CFF">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Chip $variant="primary">Marketing Sponsorship</Chip>
              <span style={{ color: '#8A8A9E', fontSize: 12 }}>No financial return</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Pay to promote</div>
            <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.55, margin: '0 0 24px' }}>
              Brands pay for co-marketing placements alongside your campaign. Simple fee, no revenue claim, straightforward disclosure.
            </p>
            <ul>
              <li>Flat sponsorship fee</li>
              <li>Co-branded content assets</li>
              <li>Performance reporting only</li>
            </ul>
          </ModelCard>
          </Reveal>
          <Reveal delay={120}>
          <ModelCard $color="#D4FF4A">
            <div className="ribbon">MOST COMMON</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Chip $variant="success">Revenue Participation</Chip>
              <span style={{ color: '#8A8A9E', fontSize: 12 }}>Where legally permitted</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Post-goal capital</div>
            <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.55, margin: '0 0 24px' }}>
              Partners deploy capital after agreed milestones and earn an agreed share of defined revenue. Milestone-gated, transparently reported.
            </p>
            <ul>
              <li>Milestone-released tranches</li>
              <li>Defined revenue share (not profit)</li>
              <li>Compliance review required</li>
            </ul>
          </ModelCard>
          </Reveal>
          <Reveal delay={240}>
          <ModelCard $color="#4ADE80">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Chip $variant="partner">Growth Partnership</Chip>
              <span style={{ color: '#8A8A9E', fontSize: 12 }}>Services + capital</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Marketing + money</div>
            <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.55, margin: '0 0 24px' }}>
              Agencies bring services, media budget, or both under a hybrid compensation structure negotiated on-platform.
            </p>
            <ul>
              <li>Services-as-capital</li>
              <li>Hybrid fee + performance</li>
              <li>Agency vetting on file</li>
            </ul>
          </ModelCard>
          </Reveal>
        </Grid3>
      </Section>

      <Section $pad="0 72px 120px">
        <div style={{ marginBottom: 40 }}>
          <Eyebrow style={{ marginBottom: 14 }}>How a deal works</Eyebrow>
          <H2Serif style={{ maxWidth: 720 }}>From a funded campaign to milestone-gated growth capital.</H2Serif>
        </div>
        <Reveal>
        <CaseStudyCard $img={caseStudy}>
          <div className="img" />
          <div className="body">
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              <Chip $variant="primary">Any category</Chip>
              <Chip $variant="success">Any structure</Chip>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.4, marginBottom: 16 }}>
              You list a funded campaign. Partners submit proposals. You compare terms side by side, counter if needed, and sign the one that fits. Capital releases tranche by tranche as each milestone is met.
            </div>
            <div style={{ color: '#8A8A9E', fontSize: 13, marginBottom: 4 }}>The same flow for every deal on the platform.</div>
            <div className="stats">
              <div><strong>Listed</strong><span>Verified funding</span></div>
              <div><strong>Signed</strong><span>Agreed term sheet</span></div>
              <div><strong>Released</strong><span>Milestones met</span></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <PrimaryButton as={Link} href="/campaigns/new">List your campaign →</PrimaryButton>
              <GhostButton as={Link} href="/explore">Explore listings</GhostButton>
            </div>
          </div>
        </CaseStudyCard>
        </Reveal>
      </Section>

      <Section $pad="0 72px 120px">
        <Studio>
          <div className="halo" />
          <div className="grid">
            <div>
              <Eyebrow style={{ marginBottom: 14 }}>AI Marketing Studio</Eyebrow>
              <H2Serif style={{ marginBottom: 20 }}>Plans built on your campaign, not a template.</H2Serif>
              <p style={{ color: '#B8B8C8', fontSize: 16, lineHeight: 1.6, margin: '0 0 28px' }}>
                Paste your Kickstarter URL and the Studio reads your category, audience, and backer velocity. You get a channel mix, a weekly test cadence, and a capital ask it can actually defend.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <PrimaryButton as={Link} href="/studio">Try the Studio</PrimaryButton>
                <GhostButton>See a sample plan</GhostButton>
              </div>
            </div>
            <Mock>
              <div className="bar">
                <span className="dot" style={{ background: '#FF6B7A' }} />
                <span className="dot" style={{ background: '#FFB547' }} />
                <span className="dot" style={{ background: '#4ADE80' }} />
                <span className="url">studio.launchfund.ai / plan</span>
              </div>
              <div className="inner">
                <div style={{ fontSize: 12, color: '#8A8A9E' }}>Day 0–30 plan</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: 140, padding: 12, background: 'rgba(124,92,255,.12)', border: '1px solid rgba(124,92,255,.3)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#8A8A9E' }}>Meta ads</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>$48k · CAC ~$22</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, padding: 12, background: 'rgba(212,255,74,.08)', border: '1px solid rgba(212,255,74,.25)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#8A8A9E' }}>Creator UGC</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>$18k</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 80, padding: 12, background: '#13131A', border: '1px solid #1F1F2A', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#8A8A9E' }}>PR</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>$8k</div>
                  </div>
                </div>
                <div className="row"><span>Projected incremental backers</span><span style={{ fontWeight: 600, color: '#D4FF4A' }}>+2,840</span></div>
                <div className="row"><span>Confidence band</span><span style={{ fontWeight: 600 }}>±18%</span></div>
                <div className="foot">Projections are illustrative. Not a forecast of actual campaign outcomes.</div>
              </div>
            </Mock>
          </div>
        </Studio>
      </Section>

      <Section $pad="0 72px 100px">
        <RiskBanner>
          <RiskIcon />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#F5F5FA' }}>
              Reaching a funding goal is not the same as being risk-free.
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 900 }}>
              Campaigns can miss fulfillment, pivot, or underperform. Revenue participation is only available in jurisdictions where it is legally permitted, is milestone-gated, and is never guaranteed. Every opportunity on LaunchFund AI discloses its structure, milestones, and known risks. Read them before proposing capital.
            </div>
          </div>
          <Link href="#" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Full risk policy →</Link>
        </RiskBanner>
      </Section>

      <Section $pad="0 72px 120px">
        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Built for both sides</Eyebrow>
            <H2Serif style={{ maxWidth: 720 }}>What creators and partners get on day one.</H2Serif>
          </div>
        </Reveal>
        <Grid3>
          {[
            { title: 'For funded creators', role: 'Creators', quote: 'List a funded campaign, compare partner proposals side by side, and plan the growth capital you can actually defend with the AI Studio.', image: img.studioDesk },
            { title: 'For sponsors & partners', role: 'Partners', quote: 'Browse verified funded campaigns, see backer data and fulfillment risk up front, and propose on terms you choose — sponsorship, revenue share, or growth.', image: img.teamWorking },
            { title: 'Milestone-gated by default', role: 'Both sides', quote: 'Nothing moves on a handshake. Capital releases tranche by tranche as each milestone is met, with both parties seeing the same numbers.', image: caseStudy },
          ].map((t, i) => (
            <Reveal key={t.title} delay={i * 120}>
              <ReviewCard>
                <div className="img" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,15,.1), rgba(10,10,15,.65)), url(${t.image})` }}>
                  <Chip $variant="primary">{t.role}</Chip>
                </div>
                <div className="body">
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.5, marginBottom: 20, color: '#E6E6EE' }}>{t.quote}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, paddingTop: 16, borderTop: '1px solid #1F1F2A' }}>{t.title}</div>
                </div>
              </ReviewCard>
            </Reveal>
          ))}
        </Grid3>
      </Section>

      <Section id="pricing" $pad="0 72px 120px">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Pricing</Eyebrow>
          <H2Serif>Honest fees. No surprises on the way up.</H2Serif>
        </div>
        <Pricing>
          <PriceCard>
            <div className="n">Creator</div>
            <div className="p">Free</div>
            <div className="d">List, discover partners, use AI drafts</div>
            <GhostButton $full>Start listing</GhostButton>
          </PriceCard>
          <PriceCard $featured>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="n" style={{ margin: 0 }}>Creator Pro</span>
              <Chip $variant="primary">Recommended</Chip>
            </div>
            <div className="p">4% <span>of deployed capital</span></div>
            <div className="d">Full AI Studio, priority matching, legal templates</div>
            <PrimaryButton $full>Upgrade</PrimaryButton>
          </PriceCard>
          <PriceCard>
            <div className="n">Investor / Partner</div>
            <div className="p">1.5% <span>per deal</span></div>
            <div className="d">Deal flow, diligence tools, milestone tracking</div>
            <GhostButton $full>Apply for access</GhostButton>
          </PriceCard>
        </Pricing>
      </Section>

      <Section $pad="0 72px 120px">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Frequently asked</Eyebrow>
          <H2Serif>Straight answers, before you commit.</H2Serif>
        </div>
        <FAQGrid>
          {[
            ['Is revenue participation a security?', 'In most jurisdictions, it is structured as a revenue-share contract — not a security — and we only enable it where that structure is legally permitted. Every contract is reviewed by our compliance team before capital releases.'],
            ['When does money actually move?', 'Nothing moves on proposal. Capital releases only when both parties sign the term sheet and the first milestone is met. All tranches are held in escrow.'],
            ['What does LaunchFund take?', 'Creators pay 4% of deployed capital on the Pro plan; partners pay 1.5% per closed deal. No listing fees, no success fees beyond those two numbers.'],
            ['Who verifies the creator?', 'We verify Kickstarter/Indiegogo funding status, legal entity, prior delivery history, and identity of signatories. The verification badge is only shown once all four pass.'],
            ['Can I lose money as a partner?', 'Yes. Post-goal capital is at risk: campaigns can under-deliver, miss revenue targets, or fail to ship. Every opportunity discloses its structure and known risks in writing.'],
            ['Is the AI Studio plan a forecast?', 'No. It is a planning scenario with an explicit confidence band. We say "projected" or "estimated" — never "guaranteed" — and we show the inputs behind every number.'],
          ].map(([q, a]) => (
            <FAQItem key={q}>
              <div className="q">{q}<span className="plus">+</span></div>
              <div className="a">{a}</div>
            </FAQItem>
          ))}
        </FAQGrid>
      </Section>

      <Section $pad="0 72px 120px">
        <Reveal>
        <CTABox>
          <H2Serif style={{ maxWidth: 720, margin: '0 auto 20px' }}>
            Funded is the start line.<br />Let&apos;s build the launch.
          </H2Serif>
          <p style={{ color: '#8A8A9E', fontSize: 16, maxWidth: 520, margin: '0 auto 32px' }}>
            Turn a successful Kickstarter into a market-ready brand — with vetted partners and milestone-gated growth capital.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PrimaryButton as={Link} href="/creator">List My Campaign →</PrimaryButton>
            <GhostButton>Talk to our team</GhostButton>
          </div>
        </CTABox>
        </Reveal>
      </Section>

      </PageFrame>

      <Footer />
    </Page>
  );
}
