'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { Card, PrimaryButton, GhostButton } from '@/components/ui';

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 50; padding: 20px;
`;

const Modal = styled(Card)`
  padding: 24px; width: 100%; max-width: 420px;
  h3 { margin: 0 0 6px; font-family: ${({ theme }) => theme.fonts.serif}; font-weight: 400; font-size: 24px; }
  p { margin: 0 0 16px; color: #B8B8C8; font-size: 13px; line-height: 1.5; }
  .row { display: flex; gap: 8px; margin-bottom: 14px; }
  .row button {
    flex: 1; padding: 10px; background: ${({ theme }) => theme.colors.bg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px; cursor: pointer; font: inherit; font-weight: 600;
    &.on { border-color: ${({ theme }) => theme.colors.primary}; background: rgba(124,92,255,.1); }
  }
  input {
    width: 100%; padding: 10px 12px;
    background: ${({ theme }) => theme.colors.bg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px; color: inherit; font: inherit;
  }
  .err { color: #FF9CA5; font-size: 12px; margin-top: 8px; }
  .actions { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
`;

const presets = [25, 100, 250];

export default function BackCampaignButton({ slug, title }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function openModal() {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/campaigns/${slug}`)}`);
      return;
    }
    setOpen(true);
  }

  async function submit() {
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignSlug: slug, amount: Number(amount) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Checkout failed');
      window.location.href = d.url;
    } catch (e) { setError(e.message); setBusy(false); }
  }

  return (
    <>
      <PrimaryButton $full onClick={openModal}>Back this campaign →</PrimaryButton>
      {open && (
        <Overlay onClick={() => !busy && setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h3>Back {title || 'this campaign'}</h3>
            <p>Choose an amount. You&apos;ll check out securely with Stripe.</p>
            <div className="row">
              {presets.map((p) => (
                <button key={p} className={Number(amount) === p ? 'on' : ''} type="button" onClick={() => setAmount(p)}>${p}</button>
              ))}
            </div>
            <input
              type="number" min="1" step="1" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Amount in USD"
            />
            {error && <div className="err">{error}</div>}
            <div className="actions">
              <GhostButton onClick={() => setOpen(false)} disabled={busy}>Cancel</GhostButton>
              <PrimaryButton onClick={submit} disabled={busy || !amount || Number(amount) < 1}>
                {busy ? 'Opening Stripe…' : `Continue to Stripe →`}
              </PrimaryButton>
            </div>
          </Modal>
        </Overlay>
      )}
    </>
  );
}
