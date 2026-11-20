'use client';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Field, Form } from '@/components/AuthShell';
import { Card, Chip, DangerButton, Eyebrow, GhostButton, PrimaryButton } from '@/components/ui';

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
  const { data: session, update } = useSession();
  const [tab, setTab] = useState('profile');
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
          {user && tab === 'billing' && <BillingPanel user={user} save={save} saving={saving} />}
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
  const [f, setF] = useState({
    firstName: user.firstName || '', lastName: user.lastName || '', company: user.company || '',
    bio: user.bio || '', location: user.location || '', website: user.website || '',
  });
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      await save('profile', { avatar: data.url });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Profile</div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 999, backgroundImage: user.avatar ? `url(${user.avatar})` : undefined, background: user.avatar ? undefined : 'linear-gradient(135deg,#7C5CFF,#D4FF4A)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A0A0F', fontSize: 24 }}>{!user.avatar && (f.firstName?.[0] || 'U')}</div>
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhoto} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <GhostButton $size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || saving}>
              {uploading ? 'Uploading…' : user.avatar ? 'Replace photo' : 'Upload photo'}
            </GhostButton>
            {user.avatar && (
              <GhostButton $size="sm" onClick={() => save('profile', { avatar: '' })} disabled={uploading || saving}>Remove</GhostButton>
            )}
          </div>
          <div style={{ color: uploadError ? '#FF9CA5' : '#8A8A9E', fontSize: 11, marginTop: 6 }}>
            {uploadError || 'JPEG, PNG, WebP or GIF · up to 5 MB'}
          </div>
        </div>
      </div>
      <Form onSubmit={(e) => { e.preventDefault(); save('profile', f); }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field><span className="lbl">First name</span><input value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
          <Field><span className="lbl">Last name</span><input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        </div>
        <Field><span className="lbl">Studio or company</span><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
        <Field><span className="lbl">Public bio</span><textarea rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></Field>
        <Field><span className="lbl">Location</span><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        <Field><span className="lbl">Website</span><input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></Field>
        <div><PrimaryButton disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryButton></div>
      </Form>
    </Card>
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

function BillingPanel({ user, save, saving }) {
  const b = user.billing || {};
  const edit = (key, label) => { const v = prompt(label, b[key] || ''); if (v !== null) save('billing', { [key]: v }); };
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 20 }}>Billing &amp; plan</div>
      <div style={{ padding: 20, background: 'rgba(124,92,255,.08)', border: '1px solid rgba(124,92,255,.25)', borderRadius: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{b.plan || 'Creator Pro'}</div>
          <div style={{ color: '#8A8A9E', fontSize: 12 }}>4% of deployed capital · renews with each deal</div>
        </div>
        <GhostButton $size="sm" onClick={() => edit('plan', 'Plan name')}>Manage plan</GhostButton>
      </div>
      <Row><div><div className="k">Payment method</div><div className="d">{b.cardLast4 ? `Card · · · · ${b.cardLast4} — expires ${b.cardExpiry || '—'}` : 'No card on file'}</div></div><GhostButton $size="sm" onClick={() => edit('cardLast4', 'Card last 4')} disabled={saving}>Update</GhostButton></Row>
      <Row><div><div className="k">Billing email</div><div className="d">{b.email || user.email}</div></div><GhostButton $size="sm" onClick={() => edit('email', 'Billing email')}>Change</GhostButton></Row>
      <Row><div><div className="k">Invoices</div><div className="d">0 invoices · $0 YTD</div></div><GhostButton $size="sm">Download</GhostButton></Row>
      <Row><div><div className="k">Tax ID</div><div className="d">{b.taxId || 'Not set'}</div></div><GhostButton $size="sm" onClick={() => edit('taxId', 'Tax ID')}>Edit</GhostButton></Row>
    </Card>
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
