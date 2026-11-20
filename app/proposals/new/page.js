'use client';
import { Suspense, useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Field, Form } from '@/components/AuthShell';
import {
  Card, Chip, Eyebrow, GhostButton, PageFrame, PrimaryButton, RiskIcon, StatNumber,
} from '@/components/ui';
import { img } from '@/lib/images';

const Page = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  padding: 32px 48px 20px;
  @media (max-width: 640px) { padding: 24px 20px 16px; }
  h1 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400; font-size: 40px; line-height: 1.05; margin: 10px 0 10px;
    @media (max-width: 640px) { font-size: 28px; }
  }
`;

const Grid = styled.div`
  padding: 16px 48px 48px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  @media (max-width: 960px) { grid-template-columns: 1fr; padding: 16px 32px 32px; }
  @media (max-width: 640px) { padding: 16px 20px 24px; }
`;

const ModelPick = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const ModelBtn = styled.button`
  text-align: left;
  padding: 16px;
  background: ${({ $on, theme }) => ($on ? 'rgba(124,92,255,.08)' : theme.colors.surface)};
  border: 1px solid ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-family: inherit;
  .t { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; line-height: 1.5; }
`;

const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,107,122,.08);
  border: 1px solid rgba(255,107,122,.3);
  color: #FF9CA5;
  font-size: 13px;
`;

const parseMoney = (v) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const fmtK = (n) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n || 0}`);

export default function NewProposal() {
  return (
    <Suspense fallback={null}>
      <NewProposalInner />
    </Suspense>
  );
}

function NewProposalInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const sp = useSearchParams();
  const slugFromQuery = sp.get('campaign') || '';

  const [campaign, setCampaign] = useState(null);
  const [loadingCampaign, setLoadingCampaign] = useState(!!slugFromQuery);
  const [model, setModel] = useState('participation');
  const [form, setForm] = useState({
    amount: '',
    releaseAcross: '3 milestones',
    revenueSharePct: '',
    returnCap: '',
    durationMonths: '',
    message: '',
    reportingCadence: 'Monthly (automated)',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!slugFromQuery) return;
    fetch(`/api/campaigns/${slugFromQuery}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.campaign) {
          setCampaign(data.campaign);
          setForm((f) => ({
            ...f,
            amount: data.campaign.seeking ? String(data.campaign.seeking) : f.amount,
            revenueSharePct: data.campaign.revenueSharePct ? String(data.campaign.revenueSharePct) : f.revenueSharePct,
            returnCap: data.campaign.returnCap || f.returnCap,
          }));
          if (data.campaign.model) setModel(data.campaign.model);
        }
      })
      .finally(() => setLoadingCampaign(false));
  }, [slugFromQuery]);

  async function submit(e) {
    e?.preventDefault?.();
    setError('');
    if (!session?.user) { router.push(`/login?callbackUrl=/proposals/new?campaign=${slugFromQuery}`); return; }
    if (!campaign) { setError('Pick a campaign to submit to'); return; }
    if (!parseMoney(form.amount)) { setError('Enter the capital amount you are offering'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: campaign.slug,
          model,
          amount: parseMoney(form.amount),
          releaseAcross: form.releaseAcross,
          revenueSharePct: Number(form.revenueSharePct) || 0,
          returnCap: form.returnCap,
          durationMonths: Number(form.durationMonths) || 0,
          reportingCadence: form.reportingCadence,
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not submit'); setSubmitting(false); return; }
      router.push(`/proposals/${data.proposal.reference}`);
      router.refresh();
    } catch (e) {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  const displayTitle = campaign?.title?.split('—')[0].trim() || 'a campaign';

  return (
    <Page>
      <Nav />
      <PageFrame>
        <Header>
          <div style={{ fontSize: 12, color: '#8A8A9E' }}>
            <Link href="/explore">Explore</Link> ·{' '}
            {campaign ? <Link href={`/campaigns/${campaign.slug}`}>{displayTitle}</Link> : <span>Campaign</span>} ·{' '}
            <span style={{ color: '#F5F5FA' }}>Submit funding interest</span>
          </div>
          <h1>Submit funding interest{campaign ? ` to ${displayTitle}` : ''}</h1>
          <div style={{ color: '#8A8A9E', fontSize: 13 }}>
            Non-binding. The creator and our compliance team review before anything advances.
          </div>
        </Header>

        <Grid>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card style={{ padding: 28 }}>
              <Eyebrow style={{ marginBottom: 10 }}>Partnership model</Eyebrow>
              <ModelPick>
                <ModelBtn type="button" $on={model === 'sponsor'} onClick={() => setModel('sponsor')}>
                  <div className="t">Marketing Sponsorship</div>
                  <div className="d">Flat fee. No financial return.</div>
                </ModelBtn>
                <ModelBtn type="button" $on={model === 'participation'} onClick={() => setModel('participation')}>
                  <div className="t">Revenue Participation</div>
                  <div className="d">Milestone-gated capital + share.</div>
                </ModelBtn>
                <ModelBtn type="button" $on={model === 'growth'} onClick={() => setModel('growth')}>
                  <div className="t">Growth Partnership</div>
                  <div className="d">Services + capital hybrid.</div>
                </ModelBtn>
              </ModelPick>
            </Card>

            <Card style={{ padding: 28 }}>
              <Eyebrow style={{ marginBottom: 14 }}>Proposal details</Eyebrow>
              <Form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field>
                    <span className="lbl">Capital offered</span>
                    <input value={form.amount} onChange={up('amount')} placeholder="$180,000" />
                  </Field>
                  <Field>
                    <span className="lbl">Release across</span>
                    <select value={form.releaseAcross} onChange={up('releaseAcross')}>
                      <option>3 milestones</option>
                      <option>2 milestones</option>
                      <option>Lump sum</option>
                    </select>
                  </Field>
                </div>
                {model === 'participation' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field>
                      <span className="lbl">Revenue share %</span>
                      <input value={form.revenueSharePct} onChange={up('revenueSharePct')} placeholder="8" />
                    </Field>
                    <Field>
                      <span className="lbl">Return cap</span>
                      <input value={form.returnCap} onChange={up('returnCap')} placeholder="1.5×" />
                    </Field>
                    <Field>
                      <span className="lbl">Duration (months)</span>
                      <input value={form.durationMonths} onChange={up('durationMonths')} placeholder="18" />
                    </Field>
                  </div>
                )}
                <Field>
                  <span className="lbl">Message to the creator</span>
                  <textarea value={form.message} onChange={up('message')} rows={5} placeholder="Why this campaign, what you bring beyond capital, scheduling for a call…" style={{ resize: 'vertical' }} />
                </Field>
                <Field>
                  <span className="lbl">Preferred reporting cadence</span>
                  <select value={form.reportingCadence} onChange={up('reportingCadence')}>
                    <option>Monthly (automated)</option>
                    <option>Quarterly</option>
                    <option>On milestone only</option>
                  </select>
                </Field>
              </Form>
              {error && <ErrorBox style={{ marginTop: 14 }}>{error}</ErrorBox>}
            </Card>

            <Card style={{ padding: 20, borderColor: 'rgba(255,181,71,.25)', background: 'rgba(255,181,71,.03)' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <RiskIcon />
                <div style={{ fontSize: 13, color: '#B8B8C8', lineHeight: 1.6 }}>
                  Submitting interest does not create a contract. Both parties and our compliance team must agree on terms before any capital is held in escrow or released. You can withdraw any time before counter-signature.
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'start', position: 'sticky', top: 20 }}>
            <Card style={{ padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Campaign snapshot</div>
              {loadingCampaign ? (
                <div style={{ color: '#8A8A9E', fontSize: 13 }}>Loading campaign…</div>
              ) : campaign ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundImage: `url(${campaign.image})`, backgroundSize: 'cover', backgroundPosition: 'center', background: campaign.image ? undefined : 'linear-gradient(135deg,#1C1C26,#2A2A3A)' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{displayTitle}</div>
                      <div style={{ color: '#8A8A9E', fontSize: 11 }}>{campaign.creatorName || 'Creator'}{campaign.verified ? ' · Verified' : ''}</div>
                    </div>
                  </div>
                  <StatNumber $size="28px" style={{ color: '#D4FF4A' }}>{fmtK(campaign.seeking)}</StatNumber>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>sought · milestone-gated</div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Chip>{campaign.category}</Chip>
                    <Chip $variant="success">{campaign.goal ? Math.round((campaign.pledged / campaign.goal) * 100) : 0}% funded</Chip>
                  </div>
                </>
              ) : (
                <div style={{ color: '#8A8A9E', fontSize: 13 }}>Open a campaign from <Link href="/explore">Explore</Link> and click &ldquo;Submit funding interest&rdquo; to prefill this form.</div>
              )}
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>You&apos;re submitting as</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: session?.user?.avatar ? `url(${session.user.avatar}) center/cover no-repeat` : 'linear-gradient(135deg,#7C5CFF,#D4FF4A)' }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{session?.user?.name || 'Sign in to submit'}</div>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>{session?.user?.role === 'investor' ? 'Verified partner' : session?.user?.role === 'creator' ? 'Creator' : 'Not signed in'}</div>
                </div>
              </div>
            </Card>

            <PrimaryButton $full onClick={submit} disabled={submitting || !campaign} style={{ opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Submitting…' : 'Submit proposal →'}
            </PrimaryButton>
            <GhostButton $full as={Link} href={campaign ? `/campaigns/${campaign.slug}` : '/explore'}>Cancel</GhostButton>
          </div>
        </Grid>
      </PageFrame>
      <Footer />
    </Page>
  );
}
