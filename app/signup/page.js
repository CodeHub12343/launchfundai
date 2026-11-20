'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styled from 'styled-components';
import AuthShell, { AuthSub, AuthTitle, Field, Form } from '@/components/AuthShell';
import { Card, Chip, PrimaryButton } from '@/components/ui';

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const RolePick = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const RoleCard = styled.button`
  text-align: left;
  padding: 16px;
  background: ${({ $on, theme }) => ($on ? 'rgba(124,92,255,.1)' : theme.colors.surface)};
  border: 1px solid ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  .t { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; line-height: 1.5; }
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

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const roleParam = sp.get('role');
  const planParam = sp.get('plan');
  const callbackUrl = sp.get('callbackUrl') || '';
  const [role, setRole] = useState(roleParam === 'investor' ? 'investor' : 'creator');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', password: '', acceptedTerms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, plan: planParam || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      const signin = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (signin?.error) {
        setError('Account created, but sign-in failed. Try logging in.');
        setLoading(false);
        return;
      }
      const dest = callbackUrl || (role === 'creator' ? '/creator' : '/investor');
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError('Network error. Try again.');
      setLoading(false);
    }
  }

  return (
    <AuthShell side="right">
      <AuthTitle>Create your account.</AuthTitle>
      <AuthSub>Takes under a minute. Verification happens on submission.</AuthSub>

      <div style={{ fontSize: 12, fontWeight: 500, color: '#B8B8C8', marginBottom: 10 }}>I&apos;m here as a…</div>
      <RolePick>
        <RoleCard type="button" $on={role === 'creator'} onClick={() => setRole('creator')}>
          <div className="t">Creator</div>
          <div className="d">I run a funded Kickstarter and need growth capital or marketing partners.</div>
        </RoleCard>
        <RoleCard type="button" $on={role === 'investor'} onClick={() => setRole('investor')}>
          <div className="t">Investor / Partner</div>
          <div className="d">I deploy capital or marketing services into post-goal campaigns.</div>
        </RoleCard>
      </RolePick>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Form onSubmit={handleSubmit}>
        <NameRow>
          <Field>
            <span className="lbl">First name</span>
            <input required placeholder="Maya" value={form.firstName} onChange={set('firstName')} />
          </Field>
          <Field>
            <span className="lbl">Last name</span>
            <input required placeholder="Chen" value={form.lastName} onChange={set('lastName')} />
          </Field>
        </NameRow>
        <Field>
          <span className="lbl">Work email</span>
          <input required type="email" placeholder="you@studio.com" value={form.email} onChange={set('email')} />
        </Field>
        <Field>
          <span className="lbl">{role === 'creator' ? 'Studio or company' : 'Firm or agency'}</span>
          <input placeholder={role === 'creator' ? 'Your studio or company' : 'Your firm or company'} value={form.company} onChange={set('company')} />
        </Field>
        <Field>
          <span className="lbl">Password</span>
          <input required type="password" placeholder="At least 12 characters" value={form.password} onChange={set('password')} />
        </Field>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#8A8A9E', lineHeight: 1.5 }}>
          <input required type="checkbox" style={{ accentColor: '#7C5CFF', marginTop: 2, flexShrink: 0 }} checked={form.acceptedTerms} onChange={set('acceptedTerms')} />
          <span>I agree to the <Link href="#">Terms</Link>, <Link href="#">Privacy</Link>, and the <Link href="#">Risk Disclosures</Link>. I understand funding is not risk-free and returns are not guaranteed.</span>
        </label>
        <PrimaryButton $full type="submit" disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Creating account…' : 'Create account →'}
        </PrimaryButton>
      </Form>

      <div style={{ marginTop: 28, fontSize: 13, color: '#B8B8C8', textAlign: 'center' }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </div>
    </AuthShell>
  );
}
