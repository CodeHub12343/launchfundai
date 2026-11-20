'use client';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Card, Chip, Eyebrow, GhostButton, PrimaryButton, StatNumber } from '@/components/ui';

const Top = styled.div`
  padding: 18px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
  @media (max-width: 640px) {
    padding: 14px 16px;
    flex-direction: column;
    align-items: stretch;
    .brand { gap: 10px; }
    .brand > div > div:first-child { font-size: 14px !important; }
    .brand > div > div:last-child { font-size: 11px !important; }
  }
  .brand { display: flex; gap: 10px; align-items: center; min-width: 0; }
  .brand > div { min-width: 0; }
  .dot { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#7C5CFF,#D4FF4A); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
`;

const Work = styled.div`
  padding: 24px 32px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 440px;
  gap: 20px;
  min-height: 1200px;
  @media (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 640px) { padding: 16px 14px; gap: 14px; min-height: 0; }
`;

const Phase = styled.div`
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  min-width: 140px;
  background: ${({ $bg }) => $bg || '#0A0A0F'};
  border: 1px solid ${({ $border }) => $border || '#1F1F2A'};
  .l { font-size: 11px; color: #8A8A9E; }
  .n { font-weight: 600; font-size: 14px; margin: 4px 0; }
`;

const ChannelRow = styled.div`
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr) 80px 80px;
  gap: 12px; align-items: center; font-size: 13px;
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) 70px;
    gap: 8px; font-size: 12px;
    .bar, .cac { display: none; }
  }
`;

const Calc = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); gap: 20px; }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
`;

const PhaseRow = styled.div`
  display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
  @media (max-width: 640px) { gap: 8px; margin-bottom: 14px; }
`;

const Toolbar = styled.div`
  display: flex; background: #0A0A0F; border: 1px solid #1F1F2A; border-radius: 8px; padding: 2px;
  button { padding: 6px 12px; border-radius: 6px; border: none; font-size: 11px; cursor: pointer; }
  @media (max-width: 640px) { button { padding: 5px 10px; font-size: 10px; } }
`;

const SectionHead = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;
  @media (max-width: 640px) { margin-bottom: 14px; gap: 8px; > div:first-child { font-size: 14px !important; } }
`;

const StepCard = styled(Card)`
  padding: 24px;
  min-width: 0; max-width: 100%; overflow: hidden;
  @media (max-width: 640px) { padding: 16px; }
`;

const Chat = styled(Card)`
  display: flex; flex-direction: column; align-self: start;
  position: sticky; top: 20px;
  max-height: 1500px; overflow: hidden;
  @media (max-width: 1100px) { position: static; max-height: none; }
  .head { padding: 18px 20px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; display: flex; gap: 10px; align-items: center; }
  .head .mark { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#7C5CFF,#D4FF4A); display: flex; align-items: center; justify-content: center; }
  .body { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow: auto; }
  .foot { padding: 16px 20px; border-top: 1px solid ${({ theme }) => theme.colors.border}; background: ${({ theme }) => theme.colors.bgAlt}; }
  .foot input { flex: 1; background: transparent; border: none; color: ${({ theme }) => theme.colors.text}; font-size: 13px; outline: none; padding: 4px 0; }
  .foot .box { display: flex; gap: 8px; align-items: center; background: ${({ theme }) => theme.colors.bg}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; padding: 8px 10px 8px 14px; }
`;

const Bubble = styled.div`
  display: flex; gap: 10px;
  flex-direction: ${({ $me }) => ($me ? 'row-reverse' : 'row')};
  .avatar { width: 26px; height: 26px; border-radius: 7px; background: ${({ $me, theme }) => ($me ? theme.colors.border : theme.colors.primary)}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
  .msg { background: ${({ $me, theme }) => ($me ? theme.colors.surface2 : theme.colors.bg)}; border: ${({ $me, theme }) => ($me ? 'none' : `1px solid ${theme.colors.border}`)}; border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.6; max-width: 280px; }
`;

const money = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v.toLocaleString()}`;
};

export default function StudioPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [calc, setCalc] = useState(null);
  const [window, setWindow] = useState('30d');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    fetch('/api/studio/plan').then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d) return;
      setData(d);
      setCalc(d.plan?.calc || {});
      setCalcResult(d.calcResult);
      setWindow(d.plan?.window || '30d');
      setMessages(d.plan?.messages || []);
    });
  }, []);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages.length]);

  const recompute = async (next) => {
    const merged = { ...calc, ...next };
    setCalc(merged);
    const r = await fetch('/api/studio/calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) });
    const d = await r.json();
    if (d.result) setCalcResult(d.result);
  };

  const savePlan = async (patch) => {
    const r = await fetch('/api/studio/plan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignSlug: data?.campaign?.slug, patch }) });
    const d = await r.json();
    if (d.plan) {
      setData((cur) => ({ ...cur, plan: d.plan }));
      if (d.calcResult) setCalcResult(d.calcResult);
    }
  };

  const changeWindow = (w) => { setWindow(w); savePlan({ window: w }); };

  const send = async () => {
    const t = input.trim();
    if (!t || sending) return;
    setSending(true);
    setMessages((m) => [...m, { by: 'me', text: t, at: new Date() }]);
    setInput('');
    const r = await fetch('/api/studio/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignSlug: data?.campaign?.slug, text: t }) });
    const d = await r.json();
    if (d.messages?.[1]) setMessages((m) => [...m, d.messages[1]]);
    setSending(false);
  };

  const role = session?.user?.role === 'investor' ? 'investor' : 'creator';
  const name = session?.user?.name || 'You';
  const plan = data?.plan;
  const channels = plan?.channels || [];
  const phases = plan?.phaseBudgets || { acquisition: 0, creators: 0, retail: 0 };

  return (
    <DashboardShell role={role} user={{ name, initials: (name || 'U').slice(0, 2).toUpperCase(), avatar: session?.user?.avatar }}>
      <Top>
        <div className="brand">
          <div className="dot">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" stroke="#0A0A0F" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI Marketing Studio</div>
            <div style={{ color: '#8A8A9E', fontSize: 12 }}>
              {data?.campaign?.title?.split('—')[0].trim() || 'No campaign'} · Plan v{plan?.version || 1} · Updated {plan?.updatedAt ? new Date(plan.updatedAt).toLocaleString() : 'just now'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostButton onClick={() => savePlan({})}>Save plan</GhostButton>
          <PrimaryButton onClick={() => savePlan({})}>Export to Budget</PrimaryButton>
        </div>
      </Top>

      <Work>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StepCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Eyebrow style={{ marginBottom: 6 }}>Campaign analysis</Eyebrow>
                <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.35 }}>{plan?.summary || 'Loading campaign analysis…'}</div>
              </div>
              <Chip $variant="success">Confidence · {plan?.confidence || 'High'}</Chip>
            </div>
            <KpiGrid>
              {[
                ['Suggested capital', money(plan?.kpis?.suggestedCapital)],
                ['Projected ROAS', `${plan?.kpis?.projectedRoas || 0}×`],
                ["Add'l backers", `+${(plan?.kpis?.additionalBackers || 0).toLocaleString()}`],
                ['Confidence band', `±${plan?.kpis?.confidenceBand || 0}%`],
              ].map(([l, v]) => (
                <div key={l} style={{ padding: 14, background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 10, minWidth: 0 }}>
                  <div style={{ color: '#8A8A9E', fontSize: 11 }}>{l}</div>
                  <StatNumber $size="24px">{v}</StatNumber>
                </div>
              ))}
            </KpiGrid>
          </StepCard>

          <StepCard>
            <SectionHead>
              <div style={{ fontWeight: 600, fontSize: 16 }}>90-day marketing plan</div>
              <Toolbar>
                {['30d', '60d', '90d'].map((w) => (
                  <button key={w} onClick={() => changeWindow(w)} style={{ background: window === w ? '#1F1F2A' : 'transparent', color: window === w ? '#F5F5FA' : '#8A8A9E', fontWeight: window === w ? 600 : 400 }}>{w}</button>
                ))}
              </Toolbar>
            </SectionHead>
            <PhaseRow>
              <Phase $bg="rgba(124,92,255,.08)" $border="rgba(124,92,255,.25)">
                <div className="l">Phase 1</div><div className="n">Acquisition</div><StatNumber $size="20px">{money(phases.acquisition)}</StatNumber>
              </Phase>
              <Phase $bg="rgba(212,255,74,.06)" $border="rgba(212,255,74,.25)">
                <div className="l">Phase 2</div><div className="n">Creator &amp; UGC</div><StatNumber $size="20px">{money(phases.creators)}</StatNumber>
              </Phase>
              <Phase>
                <div className="l">Phase 3</div><div className="n">Retail &amp; PR</div><StatNumber $size="20px">{money(phases.retail)}</StatNumber>
              </Phase>
            </PhaseRow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ChannelRow style={{ color: '#8A8A9E', fontSize: 12, padding: '10px 0', borderBottom: '1px solid #1F1F2A' }}>
                <span>Channel</span><span className="bar">Allocation</span><span style={{ textAlign: 'right' }}>Budget</span><span className="cac" style={{ textAlign: 'right' }}>Est. CAC</span>
              </ChannelRow>
              {channels.map((ch) => {
                const phaseColor = ch.phase === 'acquisition' ? '#7C5CFF' : ch.phase === 'creators' ? '#D4FF4A' : '#4ADE80';
                return (
                  <ChannelRow key={ch.name}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                    <div className="bar" style={{ height: 8, background: '#1F1F2A', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, ch.pct * 2)}%`, height: '100%', background: phaseColor }} />
                    </div>
                    <span style={{ textAlign: 'right', fontWeight: 600 }}>{money(ch.budget)}</span>
                    <span className="cac" style={{ textAlign: 'right', color: '#8A8A9E' }}>{ch.estCac ? `$${ch.estCac}` : '—'}</span>
                  </ChannelRow>
                );
              })}
            </div>
          </StepCard>

          <StepCard>
            <SectionHead>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Illustrative funding calculator</div>
                <div style={{ color: '#8A8A9E', fontSize: 12, marginTop: 2 }}>What-if math. Not a forecast of cash, profits, or returns.</div>
              </div>
              <button onClick={() => recompute({ goal: 200000, pledges: 280000, investorCapital: 180000, revSharePct: 8, reinvestPct: 22, durationMonths: 18 })} style={{ background: 'none', border: 'none', color: '#8A8A9E', fontSize: 12, cursor: 'pointer' }}>Reset</button>
            </SectionHead>
            <Calc>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'goal', label: 'Kickstarter funding goal', min: 50000, max: 500000, step: 5000, fmt: money },
                  { key: 'pledges', label: 'Campaign pledges', min: 0, max: 500000, step: 5000, fmt: money },
                  { key: 'investorCapital', label: 'Additional investor capital', min: 0, max: 500000, step: 5000, fmt: money },
                  { key: 'revSharePct', label: 'Revenue participation %', min: 0, max: 20, step: 0.5, fmt: (v) => `${v}%` },
                  { key: 'reinvestPct', label: 'Creator marketing reinvestment', min: 0, max: 100, step: 1, fmt: (v) => `${v}%` },
                ].map((s) => (
                  <div key={s.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: '#8A8A9E' }}>{s.label}</span>
                      <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.fmt(calc?.[s.key] ?? 0)}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={calc?.[s.key] ?? 0} onChange={(e) => recompute({ [s.key]: Number(e.target.value) })} onMouseUp={() => savePlan({ calc })} onTouchEnd={() => savePlan({ calc })} style={{ width: '100%', accentColor: '#7C5CFF' }} />
                  </div>
                ))}
              </div>
              <div style={{ background: '#0A0A0F', border: '1px solid #1F1F2A', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: '#8A8A9E' }}>Combined illustrative marketing budget</div>
                <StatNumber $size="44px" style={{ margin: '4px 0 20px', color: '#D4FF4A' }}>{money(calcResult?.combinedBudget)}</StatNumber>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                  {[
                    ['Goal progress', `${calcResult?.goalProgressPct || 0}%`],
                    ['Illustrative investor share', `~${money(calcResult?.investorShareIllustrative)} over ${calcResult?.durationMonths || 18}mo`],
                    ['Creator marketing allocation', money(calcResult?.creatorMarketing)],
                    ['Additional growth capital', money(calcResult?.additionalGrowthCapital)],
                  ].map(([l, v], i, a) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: i === a.length - 1 ? 'none' : '1px solid #1F1F2A' }}>
                      <span style={{ color: '#8A8A9E' }}>{l}</span>
                      <span style={{ fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: 10, fontSize: 11, color: '#8A8A9E', borderTop: '1px dashed #2A2A38', lineHeight: 1.5 }}>
                  These calculations are illustrative. They do not represent available cash, actual profits, or guaranteed investor returns.
                </div>
              </div>
            </Calc>
          </StepCard>
        </div>

        <Chat>
          <div className="head">
            <div className="mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" stroke="#0A0A0F" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Studio assistant</div>
              <div style={{ fontSize: 11, color: '#8A8A9E' }}>Reading your campaign · {data?.campaign?.title?.split('—')[0].trim() || '—'}</div>
            </div>
          </div>
          <div className="body" ref={bodyRef}>
            {messages.length === 0 && <div style={{ color: '#8A8A9E', fontSize: 12 }}>Ask about your campaign to begin.</div>}
            {messages.map((m, i) => (
              <Bubble key={i} $me={m.by === 'me'}>
                <div className="avatar">{m.by === 'me' ? (name[0] || 'M') : 'AI'}</div>
                <div className="msg">{m.text}</div>
              </Bubble>
            ))}
          </div>
          <div className="foot">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['Generate caption', 'Draft press release', 'Explain CAC math'].map((s) => (
                <Chip key={s} style={{ cursor: 'pointer' }} onClick={() => { setInput(s); setTimeout(send, 0); }}>+ {s}</Chip>
              ))}
            </div>
            <div className="box">
              <input placeholder="Ask about your campaign…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
              <PrimaryButton $size="sm" onClick={send} disabled={sending || !input.trim()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 12 L21 3 L15 21 L11 13 L3 12 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </PrimaryButton>
            </div>
            <div style={{ fontSize: 10, color: '#6A6A7E', marginTop: 8 }}>
              Studio output is a working draft, not verified investment advice.
            </div>
          </div>
        </Chat>
      </Work>
    </DashboardShell>
  );
}
