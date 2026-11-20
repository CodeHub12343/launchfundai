'use client';
import Link from 'next/link';
import styled from 'styled-components';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { GhostButton, H1Serif, PageFrame, PrimaryButton } from '@/components/ui';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Body = styled.div`
  padding: 120px 72px;
  text-align: center;
  position: relative;
  overflow: hidden;
  @media (max-width: 640px) { padding: 80px 20px; }
  .halo { position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 520px; height: 520px; background: radial-gradient(circle, rgba(124,92,255,.2), transparent 60%); pointer-events: none; }
  .code { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 160px; line-height: 1; letter-spacing: -0.04em; margin: 0 0 20px;
    background: linear-gradient(135deg, #7C5CFF, #D4FF4A); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
`;

export default function NotFound() {
  return (
    <Page>
      <Nav />
      <PageFrame>
        <Body>
          <div className="halo" />
          <div className="code" style={{ position: 'relative' }}>404</div>
          <H1Serif $size="52px" style={{ marginBottom: 16 }}>This campaign didn&apos;t fund.</H1Serif>
          <p style={{ color: '#8A8A9E', fontSize: 15, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.55 }}>
            The page you&apos;re looking for doesn&apos;t exist, moved somewhere else, or never passed compliance review. Try one of the paths below.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PrimaryButton as={Link} href="/">Back to homepage</PrimaryButton>
            <GhostButton as={Link} href="/explore">Explore campaigns</GhostButton>
          </div>
        </Body>
      </PageFrame>
      <Footer />
    </Page>
  );
}
