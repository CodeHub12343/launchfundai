'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { GhostButton, PrimaryButton } from '@/components/ui';

export default function PricingCTA({ variant = 'ghost', plan, role, label }) {
  const { data: session, status } = useSession();
  const Button = variant === 'primary' ? PrimaryButton : GhostButton;

  if (status === 'loading') {
    return <Button $full disabled style={{ opacity: 0.6 }}>{label}</Button>;
  }

  const signedIn = !!session?.user?.id;
  const currentRole = session?.user?.role;

  let href;
  if (plan === 'pro') {
    href = signedIn
      ? (currentRole === 'creator' ? '/settings?tab=billing' : `/signup?role=creator&plan=pro&callbackUrl=${encodeURIComponent('/settings?tab=billing')}`)
      : `/signup?role=creator&plan=pro&callbackUrl=${encodeURIComponent('/creator')}`;
  } else if (role === 'investor') {
    href = signedIn
      ? (currentRole === 'investor' ? '/investor' : currentRole === 'admin' ? '/admin' : '/explore')
      : `/signup?role=investor&callbackUrl=${encodeURIComponent('/investor')}`;
  } else if (role === 'creator') {
    href = signedIn
      ? (currentRole === 'creator' ? '/campaigns/new' : currentRole === 'admin' ? '/admin' : '/creator')
      : `/signup?role=creator&callbackUrl=${encodeURIComponent('/campaigns/new')}`;
  } else {
    href = signedIn ? '/creator' : '/signup';
  }

  return (
    <Button as={Link} href={href} $full>
      {label}
    </Button>
  );
}
