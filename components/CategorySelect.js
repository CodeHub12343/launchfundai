'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { CATEGORY_GROUPS, iconFor } from '@/lib/categories';

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.borderStrong}; }
  .left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .icon { width: 36px; height: 36px; border-radius: 10px; background: ${({ theme }) => theme.colors.bg}; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .label { font-weight: 500; }
  .hint { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin-top: 2px; }
  .caret { color: ${({ theme }) => theme.colors.muted}; flex-shrink: 0; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 80; padding: 20px;
`;

const Modal = styled.div`
  width: 100%; max-width: 640px; max-height: 80vh;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  display: flex; flex-direction: column; overflow: hidden;
`;

const Head = styled.div`
  padding: 20px 20px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { margin: 0 0 12px; font-family: ${({ theme }) => theme.fonts.serif}; font-weight: 400; font-size: 22px; }
  .search {
    display: flex; gap: 10px; align-items: center;
    background: ${({ theme }) => theme.colors.bg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px; padding: 0 12px;
    input { flex: 1; background: transparent; border: none; color: inherit; font: inherit; padding: 10px 0; outline: none; }
    .count { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; white-space: nowrap; }
  }
`;

const Body = styled.div`
  overflow-y: auto;
  padding: 8px 12px 16px;
  flex: 1;
`;

const Group = styled.div`
  padding: 10px 8px 4px;
  .g {
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
    color: ${({ theme }) => theme.colors.mutedDim}; font-weight: 600;
    padding: 0 8px 6px;
  }
`;

const Item = styled.button`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin: 2px 0;
  background: ${({ $on }) => ($on ? 'rgba(124,92,255,.10)' : 'transparent')};
  border: 1px solid ${({ $on, theme }) => ($on ? theme.colors.primary : 'transparent')};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer; font: inherit; text-align: left;
  &:hover { background: ${({ theme }) => theme.colors.surface2}; }
  .icon { width: 36px; height: 36px; border-radius: 10px; background: ${({ theme }) => theme.colors.bg}; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
  .label { font-weight: 500; font-size: 14px; }
  .hint { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; margin-top: 2px; }
  .check { color: ${({ theme }) => theme.colors.primary}; font-weight: 700; opacity: ${({ $on }) => ($on ? 1 : 0)}; }
`;

const Foot = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: flex-end; gap: 8px;
`;

const Btn = styled.button`
  padding: 8px 14px;
  border-radius: 10px;
  font: inherit; font-weight: 500; cursor: pointer;
  background: ${({ $primary, theme }) => ($primary ? theme.colors.primary : 'transparent')};
  color: ${({ $primary, theme }) => ($primary ? '#fff' : theme.colors.text)};
  border: 1px solid ${({ $primary, theme }) => ($primary ? theme.colors.primary : theme.colors.border)};
  &:hover { opacity: .9; }
`;

export default function CategorySelect({ value, onChange, label = 'Category', placeholder = 'Pick a category' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const searchRef = useRef(null);
  const current = value || '';

  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return CATEGORY_GROUPS;
    return CATEGORY_GROUPS
      .map((g) => ({ ...g, items: g.items.filter((i) => i.key.toLowerCase().includes(term) || i.hint.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [q]);

  const totalShown = filtered.reduce((n, g) => n + g.items.length, 0);

  function hintFor(key) {
    for (const g of CATEGORY_GROUPS) {
      const hit = g.items.find((i) => i.key === key);
      if (hit) return hit.hint;
    }
    return '';
  }

  return (
    <>
      <div style={{ fontSize: 12, color: '#B8B8C8', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <Trigger type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <div className="left">
          <span className="icon">{current ? iconFor(current) : '＋'}</span>
          <div style={{ minWidth: 0 }}>
            <div className="label">{current || placeholder}</div>
            {current && <div className="hint">{hintFor(current)}</div>}
          </div>
        </div>
        <svg className="caret" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Trigger>

      {open && (
        <Overlay onClick={() => setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Choose category">
            <Head>
              <h3>Choose a category</h3>
              <div className="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="7" stroke="#8A8A9E" strokeWidth="1.8" />
                  <path d="M20 20 L16 16" stroke="#8A8A9E" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories…" />
                <span className="count">{totalShown} shown</span>
              </div>
            </Head>
            <Body>
              {filtered.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: '#8A8A9E', fontSize: 13 }}>
                  No categories match &ldquo;{q}&rdquo;. Try another term or pick &ldquo;Other&rdquo;.
                </div>
              )}
              {filtered.map((g) => (
                <Group key={g.group}>
                  <div className="g">{g.group}</div>
                  {g.items.map((i) => (
                    <Item key={i.key} type="button" $on={current === i.key} onClick={() => { onChange(i.key); setOpen(false); }}>
                      <span className="icon">{i.icon}</span>
                      <span>
                        <div className="label">{i.key}</div>
                        <div className="hint">{i.hint}</div>
                      </span>
                      <span className="check">✓</span>
                    </Item>
                  ))}
                </Group>
              ))}
            </Body>
            <Foot>
              <Btn type="button" onClick={() => setOpen(false)}>Close</Btn>
            </Foot>
          </Modal>
        </Overlay>
      )}
    </>
  );
}
