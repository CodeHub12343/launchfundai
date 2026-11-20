'use client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
  Card, Chip, DangerButton, Eyebrow, GhostButton, PageFrame, PrimaryButton,
  RiskIcon, StatNumber, SuccessButton,
} from '@/components/ui';
import { img } from '@/lib/images';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Crumb = styled.div`
  padding: 20px 48px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  @media (max-width: 640px) { padding: 16px 20px; }
  .path { display: flex; gap: 8px; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; flex-wrap: wrap; }
  .path .cur { color: ${({ theme }) => theme.colors.text}; }
`;

const Title = styled.div`
  padding: 36px 48px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  @media (max-width: 640px) { padding: 24px 20px 16px; }
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 44px; line-height: 1.02; margin: 0;
    @media (max-width: 640px) { font-size: 32px; }
  }
`;

const Grid = styled.div`
  padding: 16px 48px 48px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 28px;
  @media (max-width: 960px) { grid-template-columns: 1fr; padding: 16px 32px 32px; }
  @media (max-width: 640px) { padding: 16px 20px 24px; gap: 20px; }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 13px;
  &:first-child { border-top: none; padding-top: 0; }
`;

const Message = styled.div`
  display: flex; gap: 12px;
  ${({ $me }) => $me && 'flex-direction: row-reverse;'}
  .avatar { width: 32px; height: 32px; border-radius: 999px; flex-shrink: 0; background-size: cover; background-position: center; }
  .body { flex: 1; min-width: 0; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
  .meta .name { font-weight: 500; font-size: 13px; color: ${({ theme }) => theme.colors.text}; }
  .bubble { padding: 12px 14px; background: ${({ theme }) => theme.colors.bg}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; font-size: 13px; line-height: 1.6; }
`;

const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,107,122,.08);
  border: 1px solid rgba(255,107,122,.3);
  color: #FF9CA5;
  font-size: 13px;
  margin-bottom: 12px;
`;

const money = (n) => (n || n === 0 ? `$${Math.round(n).toLocaleString()}` : '—');
const modelLabel = { sponsor: 'Marketing Sponsorship', participation: 'Revenue Participation', growth: 'Growth Partnership' };
const statusLabel = { open: '● Awaiting your decision', countered: '● Countered — awaiting response', accepted: '✓ Accepted', declined: '✗ Declined', withdrawn: '✗ Withdrawn', expired: '○ Expired' };

export default function ProposalPage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params.id;
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/proposals/${id}`);
    const data = await r.json();
    if (!r.ok) setError(data.error || 'Could not load proposal');
    else setP(data.proposal);
    setLoading(false);
  }
  useEffect(() => { if (id) load(); }, [id]);

  async function doAction(action, note = '') {
    setActing(action);
    const r = await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    });
    const data = await r.json();
    if (!r.ok) setError(data.error || `Could not ${action}`);
    else { setP(data.proposal); setError(''); }
    setActing('');
  }

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    const r = await fetch(`/api/proposals/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reply.trim() }),
    });
    const data = await r.json();
    if (r.ok) { setP((prev) => ({ ...prev, messages: data.messages })); setReply(''); }
    else setError(data.error || 'Could not send reply');
    setSending(false);
  }

  if (loading) return (<Page><Nav /><PageFrame><div style={{ padding: 80, textAlign: 'center', color: '#8A8A9E' }}>Loading proposal…</div></PageFrame><Footer /></Page>);
  if (error && !p) return (<Page><Nav /><PageFrame><div style={{ padding: 80, textAlign: 'center' }}><h1 style={{ fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: 40 }}>Proposal unavailable</h1><p style={{ color: '#8A8A9E' }}>{error}</p><PrimaryButton as={Link} href="/creator" style={{ marginTop: 20 }}>Back to dashboard →</PrimaryButton></div></PageFrame><Footer /></Page>);
  if (!p) return null;

  const isCreator = session?.user?.id === String(p.creator?._id || p.creator);
  const isFrom = session?.user?.id === String(p.from?._id || p.from);
  const canAccept = isCreator && ['open', 'countered'].includes(p.status);
  const canCounter = (isCreator || isFrom) && ['open', 'countered'].includes(p.status);
  const canDecline = isCreator && ['open', 'countered'].includes(p.status);
  const canWithdraw = isFrom && ['open', 'countered'].includes(p.status);

  const fromName = p.from?.company || `${p.from?.firstName || ''} ${p.from?.lastName || ''}`.trim() || p.fromName;
  const creatorName = p.creator?.company || `${p.creator?.firstName || ''} ${p.creator?.lastName || ''}`.trim() || 'Creator';
  const campaignTitle = p.campaign?.title?.split('—')[0].trim() || 'Campaign';
  const expires = p.expiresAt ? Math.max(0, Math.ceil((new Date(p.expiresAt) - new Date()) / (24 * 60 * 60 * 1000))) : null;

  return (
    <Page>
      <Nav />
      <PageFrame>
      <Crumb>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div className="path">
            <Link href={isFrom ? '/investor' : '/creator'}>Dashboard</Link>›
            <span>Funding Opportunities</span>›
            <span className="cur">Proposal · {fromName}</span>
          </div>
        </div>
        <Chip $variant={p.status === 'accepted' ? 'success' : p.status === 'declined' || p.status === 'withdrawn' ? 'danger' : 'primary'}>
          {statusLabel[p.status] || p.status}
        </Chip>
      </Crumb>

      <Title>
        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Funding proposal</Eyebrow>
          <h1>{fromName} → {campaignTitle}</h1>
          <div style={{ color: '#8A8A9E', fontSize: 13, marginTop: 10 }}>
            Proposal #{p.reference} · Submitted {new Date(p.createdAt).toLocaleDateString()} · {expires != null && p.status === 'open' ? `Expires in ${expires} day${expires === 1 ? '' : 's'}` : `Status: ${p.status}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostButton>Download PDF</GhostButton>
          <GhostButton>Message partner</GhostButton>
        </div>
      </Title>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Proposal overview</div>
              <Chip $variant="success">{modelLabel[p.model]}</Chip>
            </div>
            <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.65, margin: '0 0 20px' }}>
              {p.initialMessage || `${fromName} proposes ${money(p.amount)} in post-goal capital under ${modelLabel[p.model]}${p.revenueSharePct ? `, with a ${p.revenueSharePct}% revenue share${p.returnCap ? ` capped at ${p.returnCap}` : ''}` : ''}. Release: ${p.releaseAcross}. Reporting: ${p.reportingCadence}.`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10 }}>
                <div style={{ color: '#8A8A9E', fontSize: 11 }}>Requested capital</div>
                <StatNumber $size="32px">{money(p.amount)}</StatNumber>
              </div>
              <div style={{ padding: 16, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10 }}>
                <div style={{ color: '#8A8A9E', fontSize: 11 }}>Revenue share</div>
                <StatNumber $size="32px">{p.revenueSharePct ? `${p.revenueSharePct}%` : '—'}</StatNumber>
              </div>
              <div style={{ padding: 16, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10 }}>
                <div style={{ color: '#8A8A9E', fontSize: 11 }}>Return cap</div>
                <StatNumber $size="32px">{p.returnCap || '—'}</StatNumber>
              </div>
            </div>
          </Card>

          <Card style={{ padding: 28 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Milestone-based capital release</div>
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 12, top: 10, bottom: 10, width: 1, background: '#2A2A38' }} />
              {(() => {
                const parts = p.releaseAcross?.includes('Lump') ? [1] : p.releaseAcross?.startsWith('2') ? [0.5, 0.5] : [0.33, 0.37, 0.3];
                const labels = ['Tooling & supplier contracts filed', 'First shipments', 'Post-campaign revenue milestone'];
                return parts.map((share, i) => {
                  const active = i === 0;
                  return (
                    <div key={i} style={{ marginBottom: 22, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -28, top: 0, width: 24, height: 24, borderRadius: 999, background: active ? '#7C5CFF' : '#13131A', color: active ? '#fff' : '#8A8A9E', border: active ? 'none' : '1px solid #2A2A38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>{i + 1}</div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{labels[i] || `Milestone ${i + 1}`}</div>
                      <div style={{ color: '#8A8A9E', fontSize: 12, marginTop: 2 }}>Release: {money(Math.round(p.amount * share))}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>

          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Discussion thread</div>
              <Chip>{p.messages?.length || 0} message{p.messages?.length === 1 ? '' : 's'}</Chip>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(p.messages || []).map((m) => {
                const mine = session?.user?.id === String(m.by);
                return (
                  <Message key={m._id || m.at} $me={mine}>
                    <div className="avatar" style={{ backgroundImage: mine && session?.user?.avatar ? `url(${session.user.avatar})` : 'linear-gradient(135deg,#7C5CFF,#D4FF4A)' }} />
                    <div className="body">
                      <div className="meta">
                        <div className="name">{m.byName} <span style={{ color: '#8A8A9E', fontWeight: 400 }}>· {m.byRole === 'creator' ? 'Creator' : m.byRole === 'admin' ? 'Admin' : 'Partner'}</span></div>
                        <div style={{ color: '#8A8A9E' }}>{new Date(m.at).toLocaleString()}</div>
                      </div>
                      <div className="bubble">{m.text}</div>
                    </div>
                  </Message>
                );
              })}
              {(!p.messages || p.messages.length === 0) && (
                <div style={{ color: '#8A8A9E', fontSize: 13 }}>No messages yet — open the conversation below.</div>
              )}
            </div>
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1F1F2A' }}>
              <div style={{ background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10, padding: 12 }}>
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply… Markdown supported." style={{ width: '100%', background: 'transparent', border: 'none', color: '#F5F5FA', fontSize: 13, outline: 'none', minHeight: 60, fontFamily: 'inherit', resize: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>All messages are logged to the proposal record.</div>
                  <PrimaryButton $size="sm" onClick={sendReply} disabled={sending || !reply.trim()} style={{ opacity: sending ? 0.6 : 1 }}>{sending ? 'Sending…' : 'Send reply'}</PrimaryButton>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'start', position: 'sticky', top: 20 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Actions</div>
            {error && <ErrorBox>{error}</ErrorBox>}
            {!session?.user && <div style={{ color: '#8A8A9E', fontSize: 12, marginBottom: 10 }}>Sign in to act on this proposal.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SuccessButton $full onClick={() => doAction('accept')} disabled={!canAccept || acting === 'accept'}>{acting === 'accept' ? 'Accepting…' : '✓ Accept proposal'}</SuccessButton>
              <PrimaryButton $full onClick={() => doAction('counter', 'Counter-offer submitted')} disabled={!canCounter || acting === 'counter'}>{acting === 'counter' ? 'Sending…' : 'Negotiate terms'}</PrimaryButton>
              <GhostButton $full onClick={() => doAction('request_documents')} disabled={!isCreator || !['open', 'countered'].includes(p.status) || acting === 'request_documents'}>Request documents</GhostButton>
              {canWithdraw ? (
                <DangerButton $full onClick={() => doAction('withdraw')} disabled={acting === 'withdraw'}>{acting === 'withdraw' ? 'Withdrawing…' : 'Withdraw proposal'}</DangerButton>
              ) : (
                <DangerButton $full onClick={() => doAction('decline')} disabled={!canDecline || acting === 'decline'}>{acting === 'decline' ? 'Declining…' : 'Decline proposal'}</DangerButton>
              )}
            </div>
            <div style={{ color: '#8A8A9E', fontSize: 11, lineHeight: 1.6, marginTop: 14, paddingTop: 14, borderTop: '1px solid #1F1F2A' }}>
              Accepting generates a draft agreement using your jurisdiction&apos;s template. Both parties must counter-sign before any capital is released.
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>{isFrom ? 'Creator' : 'Partner'}</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              {(() => {
                const av = isFrom ? p.creator?.avatar : p.from?.avatar;
                return <div style={{ width: 44, height: 44, borderRadius: 999, background: av ? `url(${av}) center/cover no-repeat` : 'linear-gradient(135deg,#7C5CFF,#D4FF4A)' }} />;
              })()}
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{isFrom ? creatorName : fromName}</div>
                <div style={{ color: '#8A8A9E', fontSize: 11 }}>Verified · on LaunchFund</div>
              </div>
            </div>
            <Row><span style={{ color: '#8A8A9E' }}>Model</span><span>{modelLabel[p.model]}</span></Row>
            <Row><span style={{ color: '#8A8A9E' }}>Amount</span><span>{money(p.amount)}</span></Row>
            <Row><span style={{ color: '#8A8A9E' }}>Release</span><span>{p.releaseAcross}</span></Row>
            <Row><span style={{ color: '#8A8A9E' }}>Reporting</span><span>{p.reportingCadence}</span></Row>
          </Card>

          <Card style={{ padding: 20, borderColor: 'rgba(255,181,71,.25)', background: 'rgba(255,181,71,.03)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <RiskIcon />
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>Before you accept</div>
                <div style={{ color: '#8A8A9E', fontSize: 11, lineHeight: 1.6 }}>
                  This proposal is a contractual commitment once counter-signed. Capital release is milestone-gated and returns are not guaranteed. Read the term sheet and your jurisdiction&apos;s disclosures carefully. LaunchFund AI does not provide investment advice.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Grid>

      </PageFrame>
      <Footer />
    </Page>
  );
}
