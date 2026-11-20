'use client';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Field, Form } from '@/components/AuthShell';
import { Card, Chip, Eyebrow, GhostButton, PrimaryButton, RiskIcon } from '@/components/ui';
import CategorySelect from '@/components/CategorySelect';
import { CATEGORIES } from '@/lib/categories';

const Wrap = styled.div`
  padding: 32px 32px 48px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 32px;
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 20px 16px 32px;
    gap: 16px;
  }
  > * { min-width: 0; }
`;

const StepsEyebrow = styled(Eyebrow)`
  margin-bottom: 12px; padding: 0 14px;
  @media (max-width: 960px) { display: none; }
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: start;
  position: sticky; top: 90px;
  @media (max-width: 960px) {
    position: static; flex-direction: row; overflow-x: auto; gap: 8px;
    padding: 4px 2px 10px; margin: 0 -2px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const Step = styled.button`
  text-align: left;
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: ${({ $active }) => ($active ? 'rgba(124,92,255,.1)' : 'transparent')};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  .n {
    width: 24px; height: 24px; border-radius: 999px;
    background: ${({ $done, $active, theme }) =>
      $done ? theme.colors.accent : $active ? theme.colors.primary : theme.colors.surface};
    color: ${({ $done, $active, theme }) =>
      $done || $active ? theme.colors.bg : theme.colors.muted};
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 11px; flex-shrink: 0;
    border: 1px solid ${({ $active, $done, theme }) =>
      $active || $done ? 'transparent' : theme.colors.border};
  }
  .t { font-weight: 500; font-size: 13px; }
  .d { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; margin-top: 2px; }
  @media (max-width: 960px) {
    padding: 8px 12px;
    background: ${({ $active, theme }) => ($active ? 'rgba(124,92,255,.1)' : theme.colors.surface)};
    border-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
    .d { display: none; }
  }
`;

const StepCard = styled(Card)`
  padding: 32px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  @media (max-width: 640px) { padding: 20px 16px; }
`;

const StepHeading = styled.h2`
  font-family: 'Instrument Serif', serif;
  font-weight: 400;
  font-size: 32px;
  margin: 0 0 24px;
  line-height: 1.1;
  @media (max-width: 640px) { font-size: 24px; margin-bottom: 18px; }
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
`;

const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #1F1F2A;
  flex-wrap: wrap;
  @media (max-width: 640px) {
    margin-top: 22px; padding-top: 16px;
    button { flex: 1; min-width: 0; }
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 760px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Cat = styled.button`
  padding: 16px 12px;
  background: ${({ $on, theme }) => ($on ? 'rgba(124,92,255,.1)' : theme.colors.surface)};
  border: 1px solid ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
`;

const CoverDrop = styled.button`
  width: 100%;
  min-height: 180px;
  border: 1px dashed ${({ $has, theme }) => ($has ? 'transparent' : theme.colors.border)};
  background: ${({ $has, theme, $url }) =>
    $has ? `url(${$url}) center/cover no-repeat` : theme.colors.surface};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
  .inner { text-align: center; }
  .t { color: ${({ theme }) => theme.colors.text}; font-weight: 500; font-size: 14px; margin-bottom: 6px; }
  .d { font-size: 12px; }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(10,10,15,.75));
    display: flex; align-items: flex-end; justify-content: flex-end;
    padding: 12px;
  }
  .replace {
    background: rgba(10,10,15,.65);
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    padding: 6px 10px; border-radius: 8px; font-size: 11px;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
  @media (max-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const GalleryTile = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: ${({ $url, theme }) =>
    $url ? `url(${$url}) center/cover no-repeat` : theme.colors.surface};
  border: 1px ${({ $url, theme }) => ($url ? 'solid transparent' : `dashed ${theme.colors.border}`)};
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 24px;
  cursor: pointer;
  overflow: hidden;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
  .x {
    position: absolute; top: 6px; right: 6px;
    width: 22px; height: 22px; border-radius: 999px;
    background: rgba(10,10,15,.75);
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; line-height: 1;
  }
`;

const UploadStatus = styled.div`
  margin-top: 8px; font-size: 12px;
  color: ${({ $error, theme }) => ($error ? '#FF9CA5' : theme.colors.muted)};
`;

const ErrorBox = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,107,122,.08);
  border: 1px solid rgba(255,107,122,.3);
  color: #FF9CA5;
  font-size: 13px;
`;

const stepList = [
  ['Campaign basics', 'Title, link, category'],
  ['Funding target', 'Capital + structure'],
  ['Marketing plan', 'AI-assisted draft'],
  ['Risk & terms', 'Disclosures + templates'],
  ['Review & submit', 'Final check'],
];

const CATS = CATEGORIES;
const MODELS = [
  ['sponsor', 'Marketing Sponsorship', 'Flat fee. No financial return.'],
  ['participation', 'Revenue Participation', 'Milestone-gated capital + share.'],
  ['growth', 'Growth Partnership', 'Services + capital hybrid.'],
];
const JURISDICTIONS = ['Delaware, USA', 'England & Wales', 'Ontario, Canada'];
const modelLabel = Object.fromEntries(MODELS.map(([k, t]) => [k, t]));

const parseMoney = (v) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function CreateCampaign() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    platformUrl: '',
    category: 'Hardware',
    description: '',
    seeking: '',
    minAcceptable: '',
    goal: '',
    pledged: '',
    backers: '',
    model: 'participation',
    revenueSharePct: '',
    returnCap: '',
    jurisdiction: 'Delaware, USA',
    agreed: false,
    image: '',
    gallery: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function uploadOne(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  }

  async function handleCover(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadOne(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleGallery(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploadError('');
    setUploading(true);
    try {
      const slots = Math.max(0, 8 - form.gallery.length);
      const chunk = files.slice(0, slots);
      const urls = await Promise.all(chunk.map(uploadOne));
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeGallery(url) {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((u) => u !== url) }));
  }

  function validateStep(i) {
    if (i === 0) {
      if (!form.title.trim() || form.title.trim().length < 3) return 'Give the campaign a title (3+ chars)';
      if (!form.platformUrl.trim()) return 'Kickstarter/Indiegogo URL is required';
    }
    if (i === 1) {
      if (!parseMoney(form.seeking)) return 'Enter the capital amount you are seeking';
      if (!parseMoney(form.goal)) return 'Enter your crowdfunding goal';
    }
    if (i === 3) {
      if (!form.agreed) return 'Confirm the jurisdiction + no-guarantee disclosure';
    }
    return '';
  }

  function next() {
    const v = validateStep(step);
    if (v) { setError(v); return; }
    setError('');
    setStep((s) => Math.min(stepList.length - 1, s + 1));
  }

  async function submit() {
    if (!session?.user) { router.push('/login?callbackUrl=/campaigns/new'); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      platformUrl: form.platformUrl.trim(),
      pledged: parseMoney(form.pledged),
      goal: parseMoney(form.goal) || 1,
      backers: parseMoney(form.backers),
      seeking: parseMoney(form.seeking) || 1,
      minAcceptable: parseMoney(form.minAcceptable),
      model: form.model,
      revenueSharePct: form.model === 'participation' ? Number(form.revenueSharePct) || 0 : 0,
      returnCap: form.model === 'participation' ? form.returnCap : '',
      jurisdiction: form.jurisdiction,
      image: form.image,
      gallery: form.gallery,
    };
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit campaign');
        setSubmitting(false);
        return;
      }
      router.push(`/campaigns/${data.campaign.slug}`);
      router.refresh();
    } catch (e) {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell role="creator" user={{ name: session?.user?.name || 'Creator', initials: (session?.user?.name || 'C').slice(0, 1).toUpperCase(), avatar: session?.user?.avatar }}>
      <Wrap>
        <div>
          <StepsEyebrow>New campaign</StepsEyebrow>
          <Steps>
            {stepList.map(([t, d], i) => (
              <Step key={t} onClick={() => setStep(i)} $active={step === i} $done={step > i}>
                <div className="n">{step > i ? '✓' : i + 1}</div>
                <div>
                  <div className="t">{t}</div>
                  <div className="d">{d}</div>
                </div>
              </Step>
            ))}
          </Steps>
        </div>

        <StepCard>
          {step === 0 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Step 1 of 5</Eyebrow>
              <StepHeading>Start with the basics.</StepHeading>
              <Form onSubmit={(e) => e.preventDefault()}>
                <Field>
                  <span className="lbl">Campaign title</span>
                  <input value={form.title} onChange={up('title')} placeholder="e.g. Lumen Mesh — Modular Smart Lighting" />
                </Field>
                <Field>
                  <span className="lbl">Kickstarter or Indiegogo URL</span>
                  <input value={form.platformUrl} onChange={up('platformUrl')} placeholder="https://kickstarter.com/projects/…" />
                </Field>
                <div>
                  <CategorySelect
                    value={form.category}
                    onChange={(k) => setForm((f) => ({ ...f, category: k }))}
                  />
                </div>
                <Field>
                  <span className="lbl">Short description</span>
                  <textarea value={form.description} onChange={up('description')} placeholder="One sentence a stranger could understand." rows={3} style={{ resize: 'vertical' }} />
                </Field>
                <div>
                  <span style={{ fontSize: 12, color: '#B8B8C8', fontWeight: 500, display: 'block', marginBottom: 8 }}>Cover image</span>
                  <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCover} style={{ display: 'none' }} />
                  <CoverDrop type="button" $has={!!form.image} $url={form.image} onClick={() => coverInputRef.current?.click()}>
                    {form.image ? (
                      <div className="scrim"><span className="replace">Replace cover</span></div>
                    ) : (
                      <div className="inner">
                        <div className="t">Click to upload cover image</div>
                        <div className="d">JPEG, PNG, WebP or GIF · up to 5 MB</div>
                      </div>
                    )}
                  </CoverDrop>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#B8B8C8', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                    Gallery <span style={{ color: '#8A8A9E', fontWeight: 400 }}>· optional, up to 8</span>
                  </span>
                  <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleGallery} style={{ display: 'none' }} />
                  <GalleryGrid>
                    {form.gallery.map((url) => (
                      <GalleryTile key={url} $url={url}>
                        <button
                          type="button"
                          className="x"
                          onClick={(e) => { e.stopPropagation(); removeGallery(url); }}
                          aria-label="Remove image"
                        >×</button>
                      </GalleryTile>
                    ))}
                    {form.gallery.length < 8 && (
                      <GalleryTile onClick={() => galleryInputRef.current?.click()}>+</GalleryTile>
                    )}
                  </GalleryGrid>
                  {(uploading || uploadError) && (
                    <UploadStatus $error={!!uploadError}>
                      {uploadError || 'Uploading…'}
                    </UploadStatus>
                  )}
                </div>
              </Form>
            </>
          )}

          {step === 1 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Step 2 of 5</Eyebrow>
              <StepHeading>How much capital, and how do you want it structured?</StepHeading>
              <Grid2>
                <Field>
                  <span className="lbl">Growth capital sought</span>
                  <input value={form.seeking} onChange={up('seeking')} placeholder="$180,000" />
                </Field>
                <Field>
                  <span className="lbl">Minimum acceptable</span>
                  <input value={form.minAcceptable} onChange={up('minAcceptable')} placeholder="$80,000" />
                </Field>
                <Field>
                  <span className="lbl">Crowdfunding goal</span>
                  <input value={form.goal} onChange={up('goal')} placeholder="$200,000" />
                </Field>
                <Field>
                  <span className="lbl">Already pledged</span>
                  <input value={form.pledged} onChange={up('pledged')} placeholder="$284,150" />
                </Field>
              </Grid2>
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 12, color: '#B8B8C8', fontWeight: 500, display: 'block', marginBottom: 8 }}>Partnership structure</span>
                <ModelGrid>
                  {MODELS.map(([k, t, d]) => (
                    <Cat key={k} type="button" $on={form.model === k} onClick={() => setForm((f) => ({ ...f, model: k }))} style={{ textAlign: 'left', padding: 16 }}>
                      <div style={{ fontWeight: 600 }}>{t}</div>
                      <div style={{ color: '#8A8A9E', fontSize: 11, marginTop: 4, fontWeight: 400 }}>{d}</div>
                    </Cat>
                  ))}
                </ModelGrid>
              </div>
              {form.model === 'participation' && (
                <Grid2 style={{ marginTop: 16 }}>
                  <Field>
                    <span className="lbl">Proposed revenue share %</span>
                    <input value={form.revenueSharePct} onChange={up('revenueSharePct')} placeholder="8" />
                  </Field>
                  <Field>
                    <span className="lbl">Return cap</span>
                    <input value={form.returnCap} onChange={up('returnCap')} placeholder="1.5×" />
                  </Field>
                </Grid2>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Step 3 of 5</Eyebrow>
              <StepHeading>Let AI draft your 30/60/90-day plan.</StepHeading>
              <p style={{ color: '#8A8A9E', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                We&apos;ll read your campaign page and backer data, then propose a channel mix and CAC targets. You can edit everything in the Studio after submission.
              </p>
              <Card style={{ padding: 20, background: 'rgba(124,92,255,.06)', borderColor: 'rgba(124,92,255,.25)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#7C5CFF,#D4FF4A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" stroke="#0A0A0F" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Draft plan generated after submission</div>
                    <div style={{ color: '#8A8A9E', fontSize: 12 }}>You can skip now and open the Studio after your campaign is live.</div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {step === 3 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Step 4 of 5</Eyebrow>
              <StepHeading>Risk disclosures &amp; term templates.</StepHeading>
              <Card style={{ padding: 20, borderColor: 'rgba(255,181,71,.25)', background: 'rgba(255,181,71,.03)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <RiskIcon />
                  <div style={{ fontSize: 13, color: '#B8B8C8', lineHeight: 1.6 }}>
                    Every campaign must publish risk disclosures. We generate a draft from your inputs; review and edit before submitting. LaunchFund never claims risk-free returns.
                  </div>
                </div>
              </Card>
              <Field>
                <span className="lbl">Governing jurisdiction</span>
                <select value={form.jurisdiction} onChange={up('jurisdiction')}>
                  {JURISDICTIONS.map((j) => <option key={j}>{j}</option>)}
                </select>
              </Field>
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#8A8A9E', lineHeight: 1.5, marginTop: 14 }}>
                <input type="checkbox" style={{ accentColor: '#7C5CFF', marginTop: 2 }} checked={form.agreed} onChange={up('agreed')} />
                I confirm Revenue Participation is permitted in my jurisdiction and I will not claim guaranteed returns in any marketing.
              </label>
            </>
          )}

          {step === 4 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Step 5 of 5</Eyebrow>
              <StepHeading>Review and submit.</StepHeading>
              {form.image && (
                <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundImage: `url(${form.image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 12, marginBottom: 14 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Title', form.title || '—'],
                  ['Category', form.category],
                  ['Structure', modelLabel[form.model]],
                  ['Capital sought', form.seeking || '—'],
                  form.model === 'participation' ? ['Share / cap', `${form.revenueSharePct || '—'}% · ${form.returnCap || '—'}`] : null,
                  ['Jurisdiction', form.jurisdiction],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #1F1F2A', fontSize: 13 }}>
                    <span style={{ color: '#8A8A9E' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#8A8A9E', marginTop: 16, lineHeight: 1.6 }}>
                Review goes to our team within one business day. You can edit until it&apos;s published.
              </div>
            </>
          )}

          {error && <ErrorBox>{error}</ErrorBox>}

          <NavRow>
            <GhostButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              ← Back
            </GhostButton>
            {step < stepList.length - 1 ? (
              <PrimaryButton onClick={next}>Continue →</PrimaryButton>
            ) : (
              <PrimaryButton onClick={submit} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Submitting…' : 'Submit for review →'}
              </PrimaryButton>
            )}
          </NavRow>
        </StepCard>
      </Wrap>
    </DashboardShell>
  );
}
