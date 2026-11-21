'use client';
import styled from 'styled-components';
import Nav from './Nav';
import Footer from './Footer';
import { PageFrame, Eyebrow, H1Serif } from './ui';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`;

const Hero = styled.section`
  padding: 72px 72px 48px;
  max-width: 980px;
  margin: 0 auto;
  @media (max-width: 960px) { padding: 56px 32px 32px; }
  @media (max-width: 640px) { padding: 40px 20px 24px; }
  p.lede {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 17px;
    line-height: 1.6;
    max-width: 680px;
    margin: 20px 0 0;
  }
`;

const Body = styled.section`
  padding: 24px 72px 96px;
  max-width: 980px;
  margin: 0 auto;
  @media (max-width: 960px) { padding: 24px 32px 72px; }
  @media (max-width: 640px) { padding: 16px 20px 56px; }
`;

const Sec = styled.section`
  scroll-margin-top: 90px;
  padding: 40px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-of-type { border-top: 0; padding-top: 24px; }
  h2 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400;
    font-size: clamp(26px, 4vw, 34px);
    line-height: 1.2;
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.mutedDim};
    margin-bottom: 10px;
  }
  p, li {
    color: ${({ theme }) => theme.colors.mutedSoft};
    font-size: 15px;
    line-height: 1.7;
  }
  p { margin: 0 0 14px; }
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 20px 0 8px;
  }
  ul { padding-left: 20px; margin: 0 0 14px; }
  ul li { margin-bottom: 6px; }
  a { color: ${({ theme }) => theme.colors.primary}; }
  strong { color: ${({ theme }) => theme.colors.text}; }
`;

const Toc = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 0 8px;
  margin-bottom: 8px;
  a {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.mutedSoft};
    font-size: 13px;
    font-weight: 500;
    &:hover {
      border-color: ${({ theme }) => theme.colors.borderStrong};
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

export default function InfoPage({ eyebrow, title, lede, sections = [], children }) {
  return (
    <Page>
      <Nav />
      <PageFrame>
        <Hero>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <H1Serif style={{ marginTop: 14 }}>{title}</H1Serif>
          {lede && <p className="lede">{lede}</p>}
        </Hero>
        <Body>
          {sections.length > 1 && (
            <Toc>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}>{s.label || s.title}</a>
              ))}
            </Toc>
          )}
          {sections.map((s) => (
            <Sec key={s.id} id={s.id}>
              {s.eyebrow && <div className="eyebrow">{s.eyebrow}</div>}
              <h2>{s.title}</h2>
              {s.content}
            </Sec>
          ))}
          {children}
        </Body>
      </PageFrame>
      <Footer />
    </Page>
  );
}
