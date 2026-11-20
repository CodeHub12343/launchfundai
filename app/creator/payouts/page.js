'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styled from 'styled-components';
import DashboardShell from '@/components/DashboardShell';
import { Card, Chip, PrimaryButton, GhostButton, Eyebrow } from '@/components/ui';

const Wrap = styled.div`
  padding: 32px;
  display: grid;
  gap: 16px;
  max-width: 820px;
  @media (max-width: 640px) { padding: 20px; }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 400; font-size: 32px; margin: 0;
`;

const Row = styled.div`
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
`;

const Note = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(124,92,255,.08);
  border: 1px solid rgba(124,92,255,.25);
  color: #D0C8FF;
  font-size: 13px;
  line-height: 1.5;
`;

const Danger = styled(Note)`
  background: rgba(255,107,122,.08);
  border-color: rgba(255,107,122,.3);
  color: #FF9CA5;
`;

export default function PayoutsPage() {
  return (
    <Suspense fallback={null}>
      <PayoutsInner />
    </Suspense>
  );
}

function PayoutsInner() {
  const { data: session } = useSession();
  const sp = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/stripe/connect/status', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to load status');
      setStatus(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function startOnboarding() {
    setStarting(true); setError('');
    try {
      const r = await fetch('/api/stripe/connect/onboard', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not start onboarding');
      window.location.href = d.url;
    } catch (e) { setError(e.message); setStarting(false); }
  }

  const justReturned = sp.get('connected') === '1';

  return (
    <DashboardShell role="creator" user={{ name: session?.user?.name || 'Creator', initials: (session?.user?.name || 'C').slice(0, 1).toUpperCase(), avatar: session?.user?.avatar }}>
      <Wrap>
        <div>
          <Eyebrow>Settings</Eyebrow>
          <Title>Payouts</Title>
          <div style={{ color: '#B8B8C8', marginTop: 6 }}>
            Backers pay by card through Stripe. Once a payment succeeds, the funds
            (minus the platform fee) are transferred into your connected Stripe account
            and paid out to your bank on Stripe&apos;s schedule.
          </div>
        </div>

        {error && <Danger>{error}</Danger>}
        {justReturned && <Note>Stripe onboarding closed. Refreshing status…</Note>}

        <Card style={{ padding: 20 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Stripe Connect account</div>
              <div style={{ color: '#8A8A9E', fontSize: 13, marginTop: 4 }}>
                {loading ? 'Checking…'
                  : !status?.configured ? 'Stripe keys are not set on the server yet.'
                  : !status?.connected ? 'Not connected.'
                  : status?.payoutsEnabled ? 'Connected. Payouts enabled.'
                  : status?.detailsSubmitted ? 'Details submitted. Stripe is verifying your account.'
                  : 'Started. Finish onboarding to enable payouts.'}
              </div>
            </div>
            <Row>
              {status?.connected && (
                <Chip $variant={status.payoutsEnabled ? 'success' : 'warning'}>
                  {status.payoutsEnabled ? 'Active' : 'Action needed'}
                </Chip>
              )}
            </Row>
          </Row>

          <Row style={{ marginTop: 16 }}>
            {status?.configured ? (
              <PrimaryButton onClick={startOnboarding} disabled={starting || loading}>
                {starting ? 'Opening Stripe…' : status?.payoutsEnabled ? 'Update payout details' : status?.connected ? 'Continue onboarding →' : 'Connect with Stripe →'}
              </PrimaryButton>
            ) : (
              <PrimaryButton disabled>Stripe not configured</PrimaryButton>
            )}
            <GhostButton onClick={refresh} disabled={loading}>Refresh</GhostButton>
          </Row>
        </Card>

        <Note>
          <strong>How payouts work.</strong> When a backer completes checkout, Stripe
          charges their card and splits the money: the platform fee goes to LaunchFund
          and the rest is transferred to your connected account. Stripe pays that
          balance out to the bank you link during onboarding on its standard schedule
          (daily to weekly depending on your country).
        </Note>
      </Wrap>
    </DashboardShell>
  );
}
