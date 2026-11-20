'use client';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import { Card, Chip, GhostButton, PrimaryButton } from '@/components/ui';
import { img } from '@/lib/images';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: calc(100vh - 69px);
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const List = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  overflow-y: auto;
  @media (max-width: 960px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    border-right: none;
  }
`;

const ListHead = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky; top: 0; background: ${({ theme }) => theme.colors.bg}; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
`;

const Thread = styled.button`
  display: flex; gap: 12px;
  padding: 16px 20px;
  width: 100%; text-align: left;
  background: ${({ $active, theme }) => ($active ? theme.colors.surface : 'transparent')};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-family: inherit;
  &:hover { background: ${({ theme }) => theme.colors.surface}; }
  .av { width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0; color: #0A0A0F; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; background-size: cover; background-position: center; }
  .body { flex: 1; min-width: 0; }
  .top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .name { font-weight: 500; font-size: 13px; }
  .time { color: ${({ theme }) => theme.colors.muted}; font-size: 11px; }
  .sub { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .unread { width: 8px; height: 8px; border-radius: 999px; background: ${({ theme }) => theme.colors.accent}; flex-shrink: 0; margin-top: 16px; }
`;

const ConvoCol = styled.div`
  display: flex; flex-direction: column;
  @media (max-width: 960px) { display: ${({ $open }) => ($open ? 'flex' : 'none')}; }
`;

const ConvoHead = styled.div`
  padding: 18px 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
`;

const Body = styled.div`
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
`;

const Msg = styled.div`
  display: flex; gap: 12px;
  flex-direction: ${({ $me }) => ($me ? 'row-reverse' : 'row')};
  .av { width: 32px; height: 32px; border-radius: 999px; flex-shrink: 0; background-size: cover; background-position: center; background-color: #1C1C26; }
  .bubble { max-width: 520px; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.55;
    background: ${({ $me, theme }) => ($me ? theme.colors.primary : theme.colors.surface)};
    color: ${({ $me, theme }) => ($me ? '#fff' : theme.colors.text)};
    border: ${({ $me, theme }) => ($me ? 'none' : `1px solid ${theme.colors.border}`)};
  }
  .meta { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; }
`;

const Composer = styled.div`
  padding: 16px 28px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; gap: 10px; align-items: flex-end;
  textarea {
    flex: 1;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 13px; outline: none; resize: none; min-height: 48px;
    font-family: inherit;
  }
`;

function fmtTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState([]);
  const [unread, setUnread] = useState(0);
  const [sel, setSel] = useState(null);
  const [convo, setConvo] = useState(null);
  const [openConvo, setOpenConvo] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    fetch('/api/threads').then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d) return;
      setThreads(d.threads || []);
      setUnread(d.unreadCount || 0);
      if (d.threads?.[0]) setSel(d.threads[0].id);
    });
  }, []);

  useEffect(() => {
    if (!sel) return;
    fetch(`/api/threads/${sel}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.thread) setConvo(d.thread);
    });
  }, [sel]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [convo?.messages?.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || !sel || sending) return;
    setSending(true);
    const r = await fetch(`/api/threads/${sel}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: t }),
    });
    const d = r.ok ? await r.json() : null;
    if (d?.message) {
      setConvo((c) => c ? { ...c, messages: [...c.messages, d.message] } : c);
      setThreads((ts) => ts.map((th) => th.id === sel ? { ...th, sub: t.slice(0, 140), time: 'now' } : th));
      setText('');
    }
    setSending(false);
  };

  const userName = session?.user?.name || 'You';
  const userAvatar = session?.user?.avatar || '';
  const role = session?.user?.role === 'investor' ? 'investor' : 'creator';

  return (
    <DashboardShell role={role} user={{ name: userName, initials: (userName || 'U').slice(0, 2).toUpperCase(), avatar: userAvatar }}>
      <Grid>
        <List $open={!openConvo}>
          <ListHead>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Messages</div>
              <div style={{ color: '#8A8A9E', fontSize: 11 }}>{unread} unread</div>
            </div>
            <GhostButton $size="sm">+ New</GhostButton>
          </ListHead>
          {threads.length === 0 && (
            <div style={{ padding: 24, color: '#8A8A9E', fontSize: 13 }}>No conversations yet.</div>
          )}
          {threads.map((t) => (
            <Thread key={t.id} $active={sel === t.id} onClick={() => { setSel(t.id); setOpenConvo(true); }}>
              <div className="av" style={{ backgroundImage: t.pic ? `url(${t.pic})` : undefined, background: t.pic ? undefined : 'linear-gradient(135deg,#1C1C26,#2A2A3A)' }} />
              <div className="body">
                <div className="top">
                  <span className="name">{t.who}</span>
                  <span className="time">{t.time}</span>
                </div>
                <div className="sub">{t.sub || '—'}</div>
              </div>
              {t.unread && <div className="unread" />}
            </Thread>
          ))}
        </List>

        <ConvoCol $open={openConvo}>
          {convo ? (
            <>
              <ConvoHead>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, backgroundImage: convo.other?.avatar ? `url(${convo.other.avatar})` : undefined, background: convo.other?.avatar ? undefined : 'linear-gradient(135deg,#1C1C26,#2A2A3A)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{convo.other?.name || 'Partner'}</div>
                    <div style={{ color: '#8A8A9E', fontSize: 11 }}>{convo.subject || 'Direct message'}</div>
                  </div>
                </div>
                {convo.proposalReference && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Chip $variant="success">Proposal #{convo.proposalReference}</Chip>
                    <GhostButton $size="sm" as="a" href={`/proposals/${convo.proposalReference}`}>View proposal</GhostButton>
                  </div>
                )}
              </ConvoHead>

              <Body ref={bodyRef}>
                {(convo.messages || []).length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#6A6A7E' }}>Start the conversation with a message below.</div>
                )}
                {(convo.messages || []).map((m) => (
                  <Msg key={m.id} $me={m.me}>
                    <div className="av" style={{ backgroundImage: m.byAvatar ? `url(${m.byAvatar})` : (m.me ? `url(${userAvatar})` : undefined) }} />
                    <div>
                      <div className="bubble">{m.text}</div>
                      <div className="meta" style={{ textAlign: m.me ? 'right' : 'left' }}>{fmtTime(m.at)}</div>
                    </div>
                  </Msg>
                ))}
              </Body>

              <Composer>
                <textarea
                  placeholder="Write a reply…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <PrimaryButton onClick={send} disabled={sending || !text.trim()}>{sending ? 'Sending…' : 'Send'}</PrimaryButton>
              </Composer>
            </>
          ) : (
            <div style={{ padding: 40, color: '#8A8A9E' }}>Select a conversation.</div>
          )}
        </ConvoCol>
      </Grid>
    </DashboardShell>
  );
}
