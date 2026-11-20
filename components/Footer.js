'use client';
import styled from 'styled-components';
import Link from 'next/link';

const Wrap = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 72px 40px;
  @media (max-width: 960px) { padding: 48px 32px 32px; }
  @media (max-width: 640px) { padding: 40px 20px 28px; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 48px;
  @media (max-width: 960px) { grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr 1fr; gap: 28px; }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  margin-bottom: 16px;
  .m { width: 24px; height: 24px; border-radius: 7px; background: ${({ theme }) => theme.colors.primary}; }
  .d { color: ${({ theme }) => theme.colors.accent}; }
`;

const Col = styled.div`
  .title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 14px;
    color: ${({ theme }) => theme.colors.text};
  }
  .links { display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: ${({ theme }) => theme.colors.mutedSoft}; }
  .links a:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Legal = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  @media (max-width: 640px) { flex-direction: column; gap: 8px; }
`;

export default function Footer() {
  return (
    <Wrap>
      <Inner>
      <Grid>
        <div>
          <Brand>
            <span className="m" />
            LaunchFund<span className="d">.ai</span>
          </Brand>
          <div style={{ color: '#B8B8C8', fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
            AI-powered post-goal funding and marketing marketplace for crowdfunding creators.
          </div>
        </div>
        <Col>
          <div className="title">Platform</div>
          <div className="links">
            <Link href="/explore">Explore</Link>
            <Link href="/creator">For Creators</Link>
            <Link href="/investor">For Investors</Link>
            <Link href="/studio">AI Studio</Link>
          </div>
        </Col>
        <Col>
          <div className="title">Company</div>
          <div className="links">
            <Link href="#">About</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Press</Link>
            <Link href="#">Contact</Link>
          </div>
        </Col>
        <Col>
          <div className="title">Legal</div>
          <div className="links">
            <Link href="#">Risk Disclosures</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Compliance</Link>
          </div>
        </Col>
        <Col>
          <div className="title">Resources</div>
          <div className="links">
            <Link href="#">Playbook</Link>
            <Link href="#">Case Studies</Link>
            <Link href="#">Blog</Link>
            <Link href="#">Help Center</Link>
          </div>
        </Col>
      </Grid>
      <Legal>
        <span>© 2026 LaunchFund AI, Inc. All rights reserved.</span>
        <span>Securities-related activities conducted in compliance with applicable local regulations.</span>
      </Legal>
      </Inner>
    </Wrap>
  );
}
