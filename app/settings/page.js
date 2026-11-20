'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Field, Form } from '@/components/AuthShell';
import { Card, Chip, DangerButton, Eyebrow, GhostButton, PrimaryButton } from '@/components/ui';
import { PLAN_TIERS } from '@/lib/plans';

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 32px;
  padding: 32px;
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); padding: 20px 14px; gap: 14px; }
`;

const SettingsEyebrow = styled(Eyebrow)`
  padding: 0 14px; margin-bottom: 8px;
  @media (max-width: 960px) { display: none; }
`;

const SideNav = styled.div`
  align-self: start;
  position: sticky; top: 90px;
  display: flex; flex-direction: column; gap: 4px;
  @media (max-width: 960px) {
    position: static; flex-direction: row; overflow-x: auto; gap: 8px;
    padding: 4px 2px; margin: 0 -2px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const NavBtn = styled.button`
  text-align: left;
  padding: 10px 14px;
  background: ${({ $on }) => ($on ? 'rgba(124,92,255,.1)' : 'transparent')};
  border: 1px solid ${({ $on, theme }) => ($on ? theme.colors.primary : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  @media (max-width: 960px) {
    flex-shrink: 0;
    padding: 8px 12px;
    background: ${({ $on, theme }) => ($on ? 'rgba(124,92,255,.1)' : theme.colors.surface)};
    border-color: ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 0; border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;
  &:first-child { border-top: none; }
  .k { font-weight: 500; font-size: 14px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin-top: 2px; max-width: 480px; }
  > div:first-child { min-width: 0; }
  .d { overflow-wrap: anywhere; }
  @media (max-width: 640px) {
    flex-direction: column; align-items: stretch; gap: 10px;
    padding: 14px 0;
    .k { font-size: 13px; }
    > div:last-child { display: flex; gap: 8px; }
    > div:last-child button, > div:last-child a, > div:last-child > span { flex: 1; text-align: center; justify-content: center; }
  }
`;

const Toggle = styled.button`
  width: 40px; height: 22px; border-radius: 999px;
  background: ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  border: none; cursor: pointer; position: relative;
  &::after {
    content: ''; width: 16px; height: 16px; border-radius: 999px; background: #fff;
    position: absolute; top: 3px; left: ${({ $on }) => ($on ? '21px' : '3px')};
    transition: left 160ms ease;
  }
`;

const Toast = styled.div`
  position: fixed; bottom: 20px; right: 20px; z-index: 50;
  background: ${({ $err }) => ($err ? '#2A1215' : '#152A1A')};
  color: ${({ $err }) => ($err ? '#FF6B7A' : '#4ADE80')};
  border: 1px solid ${({ $err }) => ($err ? 'rgba(255,107,122,.3)' : 'rgba(74,222,128,.3)')};
  padding: 10px 14px; border-radius: 10px; font-size: 13px;
`;

const HeroBanner = styled.div`
  height: 140px;
  background:
    radial-gradient(60% 120% at 10% 0%, rgba(124,92,255,.35), transparent 60%),
    radial-gradient(60% 120% at 90% 100%, rgba(212,255,74,.14), transparent 60%),
    linear-gradient(135deg,#171725,#0F0F18);
  position: relative;
  @media (max-width: 640px) { height: 96px; }
`;

const AvatarCircle = styled.div`
  width: 112px; height: 112px; flex-shrink: 0; border-radius: 999px;
  border: 4px solid ${({ theme }) => theme.colors.surface};
  background-image: ${({ $img }) => ($img ? `url(${$img})` : 'none')};
  background: ${({ $img }) => ($img ? undefined : 'linear-gradient(135deg,#7C5CFF,#D4FF4A)')};
  background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #0A0A0F; font-size: 40;
  cursor: pointer; position: relative;
  margin-top: -56px;
  @media (max-width: 640px) {
    width: 84px; height: 84px; font-size: 30px; margin-top: -42px;
  }
`;

const IdentityRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: flex-end;
  @media (max-width: 1100px) {
    grid-template-columns: auto 1fr;
    .identity-actions { grid-column: 1 / -1; justify-content: flex-start; padding-top: 4px; }
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    .identity-meta, .identity-actions { grid-column: 1; }
  }
`;

const IdentityMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 8px;
  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 400;
    font-size: 30px;
    line-height: 1.1;
    @media (max-width: 640px) { font-size: 24px; }
  }
  .meta {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
    a { color: #D0C8FF; }
  }
`;

const sections = [
  ['profile', 'Profile'],
  ['account', 'Account & security'],
  ['billing', 'Billing & plan'],
  ['notifications', 'Notifications'],
  ['connected', 'Connected accounts'],
  ['team', 'Team'],
  ['legal', 'Legal & compliance'],
  ['danger', 'Danger zone'],
];

const DEFAULT_PROVIDERS = [
  ['Kickstarter', 'kickstarter'],
  ['Stripe', 'stripe'],
  ['Google Analytics', 'googleAnalytics'],
  ['Meta Ads', 'metaAds'],
  ['Shopify', 'shopify'],
];

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const { data: session, update } = useSession();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = sp.get('tab');
  const validTab = ['profile', 'account', 'billing', 'notifications', 'connected', 'team', 'legal', 'danger'].includes(currentTab) ? currentTab : 'profile';
  const tab = validTab;
  const setTab = (k) => router.push(`${pathname}?tab=${k}`, { scroll: false });
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.ok ? r.json() : null).then((d) => d && setUser(d.user));
  }, []);

  const showToast = (text, err = false) => { setToast({ text, err }); setTimeout(() => setToast(null), 2400); };

  const save = async (section, data) => {
    setSaving(true);
    const r = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section, data }) });
    const d = await r.json().catch(() => null);
    setSaving(false);
    if (!r.ok) { showToast(d?.error || 'Save failed', true); return false; }
    if (d?.user) setUser(d.user);
    showToast('Saved');
    return true;
  };

  const role = session?.user?.role === 'investor' ? 'investor' : 'creator';
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (session?.user?.name || 'You');

  return (
    <DashboardShell role={role} user={{ name, initials: (name || 'U').slice(0, 2).toUpperCase(), avatar: user?.avatar }}>
      <Wrap>
        <div>
          <SettingsEyebrow>Settings</SettingsEyebrow>
          <SideNav>
            {sections.map(([k, label]) => (
              <NavBtn key={k} $on={tab === k} onClick={() => setTab(k)}>{label}</NavBtn>
            ))}
          </SideNav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!user && <div style={{ color: '#8A8A9E' }}>Loading…</div>}
          {user && tab === 'profile' && <ProfilePanel user={user} save={save} saving={saving} />}
          {user && tab === 'account' && <AccountPanel user={user} save={save} saving={saving} showToast={showToast} />}
          {user && tab === 'billing' && <BillingPanel user={user} save={save} saving={saving} showToast={showToast} />}
          {user && tab === 'notifications' && <NotifPanel user={user} save={save} />}
          {user && tab === 'connected' && <ConnectedPanel user={user} save={save} />}
          {user && tab === 'team' && <TeamPanel user={user} save={save} saving={saving} />}
          {user && tab === 'legal' && <LegalPanel user={user} save={save} saving={saving} />}
          {user && tab === 'danger' && <DangerPanel save={save} showToast={showToast} />}
        </div>
      </Wrap>
      {toast && <Toast $err={toast.err}>{toast.text}</Toast>}
    </DashboardShell>
  );
}

function ProfilePanel({ user, save, saving }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/profile/stats', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((d) => d && setStats(d));
  }, [user?._id]);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await save('profile', { avatar: data.url });
    } catch (err) { setUploadError(err.message); } finally { setUploading(false); }
  }

  const full = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your name';
  const role = user.role === 'investor' ? 'Investor / Partner' : user.role === 'admin' ? 'Admin' : 'Creator';
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;
  const siteHost = (() => {
    if (!user.website) return '';
    try { return new URL(user.website.startsWith('http') ? user.website : `https://${user.website}`).host; } catch { return user.website; }
  })();
  const siteHref = user.website ? (user.website.startsWith('http') ? user.website : `https://${user.website}`) : '';
  const money = (n) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${(n || 0).toLocaleString()}`);
  const bio = user.bio?.trim();

  const headerStats = user.role === 'investor'
    ? [
        { k: stats ? String(stats.pledges) : '—', l: 'Backed campaigns' },
        { k: stats ? money(stats.raised) : '—', l: 'Capital deployed' },
        { k: stats ? String(stats.acceptedProposals) : '—', l: 'Accepted deals' },
      ]
    : [
        { k: stats ? String(stats.publishedCampaigns) : '—', l: 'Live campaigns' },
        { k: stats ? money(stats.raised) : '—', l: 'Pledged to date' },
        { k: stats ? String(stats.acceptedProposals) : '—', l: 'Accepted proposals' },
      ];

  const trust = [
    { on: !!user.verified, label: 'Email verified', hint: user.verified ? user.email : 'Verify to improve match rate' },
    { on: !!user.twoFactorEnabled, label: 'Two-factor on', hint: user.twoFactorEnabled ? 'Authenticator app active' : 'Enable in Account & security' },
    { on: !!user.acceptedTerms, label: 'Terms accepted', hint: user.acceptedTerms ? 'Current terms accepted' : 'Pending acceptance' },
  ];

  return (
    <>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhoto} style={{ display: 'none' }} />
        <ProfileHero
          onAvatarClick={() => fileRef.current?.click()}
          user={user}
          uploading={uploading}
        />
        <div style={{ padding: '0 28px 20px' }}>
          <ProfileIdentity
            full={full}
            role={role}
            user={user}
            joined={joined}
            siteHref={siteHref}
            siteHost={siteHost}
            onEdit={() => setEditOpen(true)}
            onPhoto={() => fileRef.current?.click()}
            onRemovePhoto={() => save('profile', { avatar: '' })}
            saving={saving}
            uploading={uploading}
          />
        </div>
        {uploadError && <div style={{ padding: '0 28px 16px', color: '#FF9CA5', fontSize: 12 }}>{uploadError}</div>}
        <div style={{ padding: '0 28px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, borderTop: '1px solid #1E1E28' }}>
          {headerStats.map((s) => (
            <div key={s.l} style={{ padding: '18px 4px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.k}</div>
              <div style={{ color: '#8A8A9E', fontSize: 12, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 20 }}>
        <Card style={{ padding: 24, minHeight: 180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>About</div>
            <GhostButton $size="sm" onClick={() => setEditOpen(true)}>Edit</GhostButton>
          </div>
          {bio ? (
            <div style={{ color: '#D0D0DC', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{bio}</div>
          ) : (
            <div style={{ color: '#6E6E80', fontSize: 13, lineHeight: 1.6 }}>
              Add a short bio so {user.role === 'investor' ? 'creators' : 'partners'} know who you are and what you build.
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1E1E28', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <InfoCell label={user.role === 'investor' ? 'Firm or agency' : 'Studio or company'} value={user.company || '—'} />
            <InfoCell label="Location" value={user.location || '—'} />
            <InfoCell label="Website" value={siteHref ? <a href={siteHref} target="_blank" rel="noreferrer" style={{ color: '#D0C8FF' }}>{siteHost}</a> : '—'} />
            <InfoCell label="Email" value={user.email} />
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Trust & verification</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trust.map((t) => (
              <div key={t.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: t.on ? 'rgba(74,222,128,.12)' : '#1E1E28', color: t.on ? '#4ADE80' : '#6E6E80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {t.on ? '✓' : '○'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ color: '#8A8A9E', fontSize: 11, marginTop: 2, overflowWrap: 'anywhere' }}>{t.hint}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSave={async (data) => { const ok = await save('profile', data); if (ok) setEditOpen(false); }}
        />
      )}
    </>
  );
}

function ProfileHero({ onAvatarClick, user, uploading }) {
  return <HeroBanner />;
}

function ProfileIdentity({ full, role, user, joined, siteHref, siteHost, onEdit, onPhoto, onRemovePhoto, saving, uploading }) {
  return (
    <IdentityRow>
      <AvatarCircle
        $img={user.avatar}
        onClick={onPhoto}
        role="button"
        aria-label="Change profile photo"
      >
        {!user.avatar && (user.firstName?.[0] || 'U').toUpperCase()}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>Uploading…</div>
        )}
      </AvatarCircle>
      <IdentityMeta className="identity-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h1>{full}</h1>
          <Chip $variant="primary">{role}</Chip>
          {user.verified && <Chip $variant="success">✓ Verified</Chip>}
        </div>
        <div className="meta">
          {user.company && <span>{user.company}</span>}
          {user.company && (user.location || siteHost || joined) && <span>·</span>}
          {user.location && <span>{user.location}</span>}
          {user.location && (siteHost || joined) && <span>·</span>}
          {siteHref && <a href={siteHref} target="_blank" rel="noreferrer">{siteHost}</a>}
          {siteHref && joined && <span>·</span>}
          {joined && <span>Joined {joined}</span>}
        </div>
      </IdentityMeta>
      <div className="identity-actions" style={{ display: 'flex', gap: 8, paddingBottom: 8, flexWrap: 'wrap' }}>
        <GhostButton $size="sm" onClick={onPhoto} disabled={uploading || saving}>
          {user.avatar ? 'Change photo' : 'Add photo'}
        </GhostButton>
        {user.avatar && (
          <GhostButton $size="sm" onClick={onRemovePhoto} disabled={uploading || saving}>Remove</GhostButton>
        )}
        <PrimaryButton $size="sm" onClick={onEdit}>Edit profile</PrimaryButton>
      </div>
    </IdentityRow>
  );
}

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ color: '#6E6E80', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div>
    </div>
  );
}

function EditProfileModal({ user, saving, onClose, onSave }) {
  const [f, setF] = useState({
    firstName: user.firstName || '', lastName: user.lastName || '', company: user.company || '',
    bio: user.bio || '', location: user.location || '', website: user.website || '',
  });
  const left = 280 - (f.bio || '').length;

  return (
    <div
      onClick={() => !saving && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70, padding: 20, overflow: 'auto' }}
    >
      <Card onClick={(e) => e.stopPropagation()} style={{ padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, fontSize: 22 }}>Edit profile</div>
          <button onClick={onClose} disabled={saving} style={{ background: 'transparent', border: 'none', color: '#8A8A9E', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <Form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field><span className="lbl">First name</span><input required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
            <Field><span className="lbl">Last name</span><input required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
          </div>
          <Field><span className="lbl">{user.role === 'investor' ? 'Firm or agency' : 'Studio or company'}</span><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
          <Field>
            <span className="lbl">Public bio</span>
            <textarea rows={4} maxLength={280} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="What do you build? What are you looking for?" />
            <div style={{ color: left < 20 ? '#FFB547' : '#6E6E80', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{left} characters left</div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field><span className="lbl">Location</span><input placeholder="City, Country" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
            <Field><span className="lbl">Website</span><input placeholder="https://" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></Field>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <GhostButton type="button" onClick={onClose} disabled={saving}>Cancel</GhostButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryButton>
          </div>
        </Form>
      </Card>
    </div>
  );
}

function AccountPanel({ user, save, saving, showToast }) {
  const change2FA = () => save('account', { twoFactorEnabled: !user.twoFactorEnabled });
  const changeEmail = () => { const v = prompt('New email', user.email); if (v) save('account', { email: v }); };
  const changeRecovery = () => { const v = prompt('Recovery email', user.recoveryEmail || ''); if (v !== null) save('account', { recoveryEmail: v }); };
  const changePwd = async () => {
    const cur = prompt('Current password'); if (!cur) return;
    const np = prompt('New password (min 12 chars)'); if (!np) return;
    const r = await fetch('/api/settings/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: cur, newPassword: np }) });
    const d = await r.json().catch(() => null);
    showToast(r.ok ? 'Password updated' : (d?.error || 'Failed'), !r.ok);
  };
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Account &amp; security</div>
      <Row><div><div className="k">Email</div><div className="d">{user.email} · {user.verified ? 'verified' : 'unverified'}</div></div><GhostButton $size="sm" onClick={changeEmail}>Change</GhostButton></Row>
      <Row><div><div className="k">Password</div><div className="d">Updated {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}</div></div><GhostButton $size="sm" onClick={changePwd}>Update</GhostButton></Row>
      <Row><div><div className="k">Two-factor authentication</div><div className="d">Authenticator app · recommended</div></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user.twoFactorEnabled ? <Chip $variant="success">● On</Chip> : <Chip>Off</Chip>}
          <GhostButton $size="sm" onClick={change2FA} disabled={saving}>{user.twoFactorEnabled ? 'Disable' : 'Enable'}</GhostButton>
        </div>
      </Row>
      <Row><div><div className="k">Active sessions</div><div className="d">1 device currently signed in</div></div><GhostButton $size="sm">Review</GhostButton></Row>
      <Row><div><div className="k">Recovery email</div><div className="d">{user.recoveryEmail || 'Not set'}</div></div><GhostButton $size="sm" onClick={changeRecovery}>Change</GhostButton></Row>
    </Card>
  );
}

function BillingPanel({ user, save, saving, showToast }) {
  const b = user.billing || {};
  const [plan, setPlan] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [totals, setTotals] = useState({ gross: 0, fees: 0 });
  const [switching, setSwitching] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');

  const isInvestor = user.role === 'investor';
  const currentPlanKey = isInvestor
    ? 'investor'
    : (b.plan || '').toLowerCase().includes('pro') ? 'pro' : 'free';
  const tiers = PLAN_TIERS;

  useEffect(() => {
    fetch('/api/billing/invoices', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setInvoices(d.invoices || []); setTotals(d.totals || { gross: 0, fees: 0 }); } });
  }, [user?._id]);

  async function switchPlan(key) {
    if (key === currentPlanKey || isInvestor) return;
    setSwitching(true);
    try {
      const r = await fetch('/api/billing/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: key }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not switch plan');
      await save('billing', { email: b.email || user.email });
      showToast?.(`Switched to ${d.plan.label}`);
    } catch (e) { showToast?.(e.message, true); } finally { setSwitching(false); }
  }

  async function openPortal() {
    setPortalBusy(true);
    try {
      const r = await fetch('/api/billing/portal', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Portal unavailable');
      window.location.href = d.url;
    } catch (e) { showToast?.(e.message, true); setPortalBusy(false); }
  }

  function startEdit(field, initial) {
    setEditField(field); setEditValue(initial || ''); setEditError('');
  }
  async function commitEdit() {
    const ok = await save('billing', { [editField]: editValue });
    if (ok) setEditField(null);
  }

  const money = (n) => (typeof n === 'number' ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—');
  const activeTier = tiers[currentPlanKey];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card style={{ padding: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Current plan</div>
        <div style={{ color: '#8A8A9E', fontSize: 13, marginBottom: 20 }}>
          Fees are charged at the moment a backer pays. There&apos;s no monthly bill unless you switch to a subscription in Stripe.
        </div>
        <div style={{ padding: 20, background: 'rgba(124,92,255,.08)', border: '1px solid rgba(124,92,255,.25)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{activeTier.label}</div>
              {activeTier.recommended && <Chip $variant="primary">Recommended</Chip>}
            </div>
            <div style={{ color: '#8A8A9E', fontSize: 13, marginTop: 4 }}>{activeTier.price} <span style={{ color: '#6E6E80' }}>{activeTier.priceSuffix}</span></div>
            <div style={{ color: '#B8B8C8', fontSize: 12, marginTop: 8 }}>Platform fee on pledges: <strong>{(activeTier.platformFeeBps / 100).toFixed(2)}%</strong></div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <GhostButton $size="sm" onClick={openPortal} disabled={portalBusy}>
              {portalBusy ? 'Opening Stripe…' : 'Manage in Stripe'}
            </GhostButton>
          </div>
        </div>

        {!isInvestor && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {['free', 'pro'].map((k) => {
              const t = tiers[k];
              const isCurrent = k === currentPlanKey;
              return (
                <div key={k} style={{ padding: 16, borderRadius: 12, border: `1px solid ${isCurrent ? '#7C5CFF' : '#2A2A38'}`, background: isCurrent ? 'rgba(124,92,255,.06)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600 }}>{t.label}</div>
                    {isCurrent ? <Chip $variant="success">Current</Chip> : t.recommended && <Chip $variant="primary">Recommended</Chip>}
                  </div>
                  <div style={{ fontSize: 13, color: '#B8B8C8' }}>{t.price} <span style={{ color: '#6E6E80' }}>{t.priceSuffix}</span></div>
                  <ul style={{ padding: 0, margin: '12px 0', listStyle: 'none', fontSize: 12, color: '#B8B8C8', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {t.features.map((f) => <li key={f}>· {f}</li>)}
                  </ul>
                  {!isCurrent && (
                    <PrimaryButton $size="sm" onClick={() => switchPlan(k)} disabled={switching}>
                      {switching ? 'Switching…' : k === 'free' ? 'Downgrade' : 'Upgrade'}
                    </PrimaryButton>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card style={{ padding: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Billing details</div>
        <Row>
          <div>
            <div className="k">Billing email</div>
            <div className="d">{b.email || user.email}</div>
          </div>
          <GhostButton $size="sm" onClick={() => startEdit('email', b.email || user.email)}>Change</GhostButton>
        </Row>
        <Row>
          <div>
            <div className="k">Tax ID</div>
            <div className="d">{b.taxId || 'Not set'}</div>
          </div>
          <GhostButton $size="sm" onClick={() => startEdit('taxId', b.taxId || '')}>Edit</GhostButton>
        </Row>
        {user.role === 'creator' && (
          <Row>
            <div>
              <div className="k">Payout account (Stripe Connect)</div>
              <div className="d">{user.stripePayoutsEnabled ? 'Active — Stripe sends pledges directly to your bank.' : user.stripeAccountId ? 'Setup started — finish onboarding to receive payouts.' : 'Not connected — connect to receive pledges from backers.'}</div>
            </div>
            <GhostButton $size="sm" as="a" href="/creator/payouts">Open</GhostButton>
          </Row>
        )}
      </Card>

      <Card style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{isInvestor ? 'Payment history' : 'Pledge activity'}</div>
          <div style={{ fontSize: 12, color: '#8A8A9E' }}>
            {invoices?.length || 0} paid · Gross {money(totals.gross)} · {isInvestor ? 'Paid' : 'Platform fee'} {money(totals.fees)}
          </div>
        </div>
        {invoices === null && <div style={{ color: '#8A8A9E', fontSize: 13 }}>Loading…</div>}
        {invoices?.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', background: '#0A0A0F', border: '1px dashed #2A2A38', borderRadius: 10, color: '#8A8A9E', fontSize: 13 }}>
            No {isInvestor ? 'payments' : 'completed pledges'} yet. Once backers check out, each payment will show here.
          </div>
        )}
        {invoices?.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#8A8A9E', fontWeight: 500, borderBottom: '1px solid #2A2A38' }}>
                  <th style={{ padding: '10px 6px' }}>Date</th>
                  <th style={{ padding: '10px 6px' }}>Campaign</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right' }}>Gross</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right' }}>{isInvestor ? 'Charged' : 'Fee'}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right' }}>{isInvestor ? '' : 'Net'}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #1E1E28' }}>
                    <td style={{ padding: '12px 6px', color: '#B8B8C8' }}>{new Date(inv.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 6px' }}><a href={`/campaigns/${inv.campaignSlug}`} style={{ color: '#D0C8FF' }}>{inv.campaignSlug}</a></td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{money(inv.amount)}</td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', color: '#FF9CA5', fontVariantNumeric: 'tabular-nums' }}>−{money(isInvestor ? inv.amount : inv.platformFee)}</td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', color: '#4ADE80', fontVariantNumeric: 'tabular-nums' }}>{isInvestor ? '' : money(inv.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ color: '#6E6E80', fontSize: 11, marginTop: 14 }}>
          Formal tax invoices and card receipts live in the Stripe Billing Portal — use <strong>Manage in Stripe</strong> above.
        </div>
      </Card>

      {editField && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }} onClick={() => !saving && setEditField(null)}>
          <Card onClick={(e) => e.stopPropagation()} style={{ padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              {editField === 'email' ? 'Billing email' : 'Tax ID'}
            </div>
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editField === 'email' ? 'name@company.com' : 'e.g. EU VAT or US EIN'}
              style={{ width: '100%', padding: '10px 12px', background: '#0A0A0F', border: '1px solid #2A2A38', borderRadius: 8, color: 'inherit', font: 'inherit' }}
            />
            {editError && <div style={{ color: '#FF9CA5', fontSize: 12, marginTop: 8 }}>{editError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <GhostButton onClick={() => setEditField(null)} disabled={saving}>Cancel</GhostButton>
              <PrimaryButton onClick={commitEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function NotifPanel({ user, save }) {
  const n = user.notificationPrefs || {};
  const items = [
    ['email', 'Email notifications', 'Receive important updates about your campaigns and proposals.'],
    ['product', 'Product updates', 'New features and improvements from the LaunchFund team.'],
    ['deals', 'Partner marketing', 'Occasional offers from partner agencies and sponsors.'],
    ['summary', 'Weekly summary', 'A Monday morning digest of your campaign performance.'],
  ];
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Notifications</div>
      {items.map(([k, t, d]) => (
        <Row key={k}>
          <div><div className="k">{t}</div><div className="d">{d}</div></div>
          <Toggle $on={!!n[k]} onClick={() => save('notifications', { [k]: !n[k] })} aria-label={t} />
        </Row>
      ))}
    </Card>
  );
}

function ConnectedPanel({ user, save }) {
  const ca = user.connectedAccounts || {};
  const toggle = (provider) => {
    const curr = ca[provider] || { meta: '', connected: false };
    if (curr.connected) save('connected', { provider, meta: '', connected: false });
    else {
      const meta = prompt(`${provider} account identifier (handle, acct id, etc.)`);
      if (meta) save('connected', { provider, meta, connected: true });
    }
  };
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Connected accounts</div>
      {DEFAULT_PROVIDERS.map(([name, key]) => {
        const c = ca[key] || {};
        return (
          <Row key={key}>
            <div><div className="k">{name}</div><div className="d">{c.meta || 'Not connected'}</div></div>
            {c.connected ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Chip $variant="success">● Connected</Chip>
                <GhostButton $size="sm" onClick={() => toggle(key)}>Disconnect</GhostButton>
              </div>
            ) : <PrimaryButton $size="sm" onClick={() => toggle(key)}>Connect</PrimaryButton>}
          </Row>
        );
      })}
    </Card>
  );
}

function TeamPanel({ user, save, saving }) {
  const team = user.team || [];
  const invite = () => {
    const name = prompt('Member name'); if (!name) return;
    const email = prompt('Member email'); if (!email) return;
    const role = prompt('Role: Admin or Editor', 'Editor'); if (!role) return;
    save('team_invite', { name, email, role });
  };
  const remove = (email) => save('team_remove', { email });
  const owner = { name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email, email: user.email, role: 'Owner' };
  const all = [owner, ...team];
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Team members</div>
        <PrimaryButton $size="sm" onClick={invite} disabled={saving}>+ Invite</PrimaryButton>
      </div>
      {all.map((m) => (
        <Row key={m.email}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#7C5CFF,#D4FF4A)', color: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{(m.name || m.email).split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}</div>
            <div><div className="k">{m.name}</div><div className="d">{m.email}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Chip>{m.role}</Chip>
            {m.role !== 'Owner' && <GhostButton $size="sm" onClick={() => remove(m.email)}>Remove</GhostButton>}
          </div>
        </Row>
      ))}
    </Card>
  );
}

function LegalPanel({ user, save, saving }) {
  const l = user.legal || {};
  const edit = () => { const v = prompt('Jurisdiction', l.jurisdiction || ''); if (v !== null) save('legal', { jurisdiction: v }); };
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Legal &amp; compliance</div>
      <Row><div><div className="k">Jurisdiction</div><div className="d">{l.jurisdiction || 'Not set'}</div></div><GhostButton $size="sm" onClick={edit} disabled={saving}>Change</GhostButton></Row>
      <Row><div><div className="k">Revenue participation eligibility</div><div className="d">{l.eligible !== false ? 'Eligible — review current' : 'Under review'}</div></div>{l.eligible !== false ? <Chip $variant="success">✓ Eligible</Chip> : <Chip>Pending</Chip>}</Row>
      <Row><div><div className="k">Signed templates</div><div className="d">Platform ToS · Risk disclosure · Partner NDA</div></div><GhostButton $size="sm">Review</GhostButton></Row>
      <Row><div><div className="k">Data export</div><div className="d">Download everything we hold about your account.</div></div><GhostButton $size="sm">Request export</GhostButton></Row>
    </Card>
  );
}

function DangerPanel({ save, showToast }) {
  const archive = async () => { if (confirm('Archive your account? You can restore later.')) save('archive', {}); };
  const del = async () => {
    if (!confirm('Permanently delete account after 30 days? Active deals block deletion.')) return;
    const r = await fetch('/api/settings/delete', { method: 'POST' });
    const d = await r.json().catch(() => null);
    showToast(r.ok ? 'Account scheduled for deletion' : (d?.error || 'Failed'), !r.ok);
  };
  return (
    <Card style={{ padding: 28, borderColor: 'rgba(255,107,122,.25)' }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6, color: '#FF6B7A' }}>Danger zone</div>
      <div style={{ color: '#8A8A9E', fontSize: 13, marginBottom: 20 }}>Irreversible actions. Please read carefully.</div>
      <Row><div><div className="k">Archive account</div><div className="d">Hides your profile and pauses matching. You can restore later.</div></div><GhostButton $size="sm" onClick={archive}>Archive</GhostButton></Row>
      <Row><div><div className="k">Delete account</div><div className="d">Permanently removes your data after a 30-day grace period. Active deals block deletion.</div></div><DangerButton $size="sm" onClick={del}>Delete account</DangerButton></Row>
    </Card>
  );
}
