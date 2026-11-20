'use client';
import styled from 'styled-components';
import Link from 'next/link';
import { Card, Chip, ProgressBar, GhostButton, Muted } from './ui';

const Wrap = styled(Card)`
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Art = styled.div`
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $grad, $img }) =>
    $img
      ? `linear-gradient(180deg, rgba(10,10,15,.05), rgba(10,10,15,.55)), url(${$img})`
      : $grad || 'linear-gradient(135deg,#1C1C26,#2A2A3A)'};
  background-size: cover;
  background-position: center;
  @media (max-width: 640px) { height: 120px; }
`;

const TopChips = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  @media (max-width: 640px) {
    top: 8px; left: 8px; right: 8px;
    > * { font-size: 10px !important; padding: 2px 6px !important; }
  }
`;

const Body = styled.div`
  padding: 20px;
  @media (max-width: 640px) { padding: 14px; }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    margin-top: 12px;
    padding-top: 12px;
    text-align: left;
    > div { min-width: 0; }
    a, button { width: 100%; text-align: center; }
  }
`;

const Title = styled.div`
  font-weight: 600; font-size: 16px; margin-bottom: 4px;
  @media (max-width: 640px) { font-size: 13px; line-height: 1.3; }
`;

const CreatorLine = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 640px) { font-size: 11px; }
`;

const StatsRow = styled.div`
  display: flex; justify-content: space-between; font-size: 12px;
  margin-top: 16px; margin-bottom: 6px; gap: 8px;
  @media (max-width: 640px) { font-size: 11px; margin-top: 10px; }
`;

const thumbs = {
  hw: 'linear-gradient(135deg,#1C1C26,#2A2A3A)',
  fb: 'linear-gradient(135deg,#2A1C1C,#3A2A2A)',
  tech: 'linear-gradient(135deg,#1C2A1C,#2A3A2A)',
  game: 'linear-gradient(135deg,#1C1C2A,#2A2A3A)',
  fash: 'linear-gradient(135deg,#2A1C2A,#3A2A3A)',
  home: 'linear-gradient(135deg,#2A2A1C,#3A3A2A)',
};

export default function CampaignCard({
  id,
  thumb = 'hw',
  icon,
  category = '',
  percent = 0,
  title = '',
  creator = '',
  pledged = '',
  goal = '',
  seeking = '',
  progress = 0,
  image,
}) {
  return (
    <Wrap>
      <Art $grad={thumbs[thumb] || thumbs.hw} $img={image}>
        {!image && icon}
        <TopChips>
          <Chip>{category}</Chip>
          <Chip $variant="success">● {percent}% funded</Chip>
        </TopChips>
      </Art>
      <Body>
        <Title>{title}</Title>
        <CreatorLine>{creator}</CreatorLine>
        <StatsRow>
          <Muted>{pledged}</Muted>
          <span style={{ color: '#D4FF4A', fontWeight: 600, whiteSpace: 'nowrap' }}>{goal}</span>
        </StatsRow>
        <ProgressBar $value={progress}><span /></ProgressBar>
        <Row>
          <div>
            <div style={{ fontSize: 11, color: '#8A8A9E' }}>Marketing capital sought</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{seeking}</div>
          </div>
          <GhostButton as={Link} href={`/campaigns/${id}`} $size="sm">View →</GhostButton>
        </Row>
      </Body>
    </Wrap>
  );
}
