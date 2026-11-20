'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styled from 'styled-components';
import AuthShell, { AuthDivider, AuthSub, AuthTitle, Field, Form } from '@/components/AuthShell';
import { GhostButton, PrimaryButton } from '@/components/ui';

const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,107,122,.08);
  border: 1px solid rgba(255,107,122,.3);
  color: #FF9CA5;
  font-size: 13px;
  margin-bottom: 12px;
`;

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') || '/creator';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }
    router.push(res?.url || callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell>
      <AuthTitle>Welcome back.</AuthTitle>
      <AuthSub>Sign in to continue building your launch.</AuthSub>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Form onSubmit={handleSubmit}>
        <Field>
          <span className="lbl">Email</span>
          <input required type="email" placeholder="you@studio.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lbl">Password</span>
            <Link href="#" style={{ fontSize: 12 }}>Forgot?</Link>
          </div>
          <input required type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#B8B8C8' }}>
          <input type="checkbox" style={{ accentColor: '#7C5CFF' }} />
          Keep me signed in on this device
        </label>
        <PrimaryButton $full type="submit" disabled={loading} style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </PrimaryButton>
      </Form>

      <AuthDivider>or continue with</AuthDivider>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <GhostButton type="button" disabled title="Social sign-in coming soon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22 12 Q22 7 18 5 Q14 3 10 5 Q6 7 6 12 Q6 17 10 19 Q14 21 18 19" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Google
        </GhostButton>
        <GhostButton type="button" disabled title="Social sign-in coming soon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2 Q6 2 4 8 Q2 14 6 20 Q10 24 14 20 Q18 14 16 8 Q14 2 12 2 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          Apple
        </GhostButton>
      </div>

      <div style={{ marginTop: 28, fontSize: 13, color: '#B8B8C8', textAlign: 'center' }}>
        New to LaunchFund? <Link href="/signup">Create an account</Link>
      </div>
    </AuthShell>
  );
}
