import React, { useEffect, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { CARD, saveContact, shareCard, scrollToSection } from './cardData.js';

export { saveContact, shareCard, scrollToSection };

// Tiny base class so each template's original logic runs unchanged.
export class DCLogic {
  constructor() {
    this.props = {};
    this.state = {};
  }
}

export function useDC(Logic, props) {
  const [, force] = useReducer((x) => x + 1, 0);
  const ref = useRef(null);
  if (!ref.current) {
    const inst = new Logic();
    inst.props = props || {};
    inst.setState = (u, cb) => {
      const next = typeof u === 'function' ? u(inst.state, inst.props) : u;
      inst.state = { ...inst.state, ...next };
      force();
      if (cb) cb();
    };
    inst.forceUpdate = () => force();
    ref.current = inst;
  }
  ref.current.props = props || {};
  useEffect(() => {
    const i = ref.current;
    if (i.componentDidMount) i.componentDidMount();
    return () => {
      if (i.componentWillUnmount) i.componentWillUnmount();
    };
  }, []);
  return ref.current.renderVals() || {};
}

// Chat sheet open/close, first-visit tooltip (auto-hides after 4s), keyboard detection, scroll state.
export function useLive() {
  const [chat, setChat] = useState(false);
  const [tip, setTip] = useState(() => {
    try {
      return !sessionStorage.getItem('wc-tip-seen');
    } catch {
      return false;
    }
  });
  const [kb, setKb] = useState(false);
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!tip) return;
    const t = setTimeout(() => {
      setTip(false);
      try {
        sessionStorage.setItem('wc-tip-seen', '1');
      } catch {
        /* storage blocked */
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [tip]);
  useEffect(() => {
    const onFocus = (e) => {
      if (e.target.matches && e.target.matches('input, textarea, [contenteditable]')) setKb(true);
    };
    const onBlur = () => setKb(false);
    const vv = window.visualViewport;
    const onVV = () => setKb(window.innerHeight - vv.height > 150);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    if (vv) vv.addEventListener('resize', onVV);
    return () => {
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
      if (vv) vv.removeEventListener('resize', onVV);
    };
  }, []);
  useEffect(() => {
    if (!chat) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setChat(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [chat]);
  return {
    chat,
    tip,
    kb,
    past,
    openChat: (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      setTip(false);
      setChat(true);
    },
    closeChat: () => setChat(false),
  };
}

const VIDEO_CHIP = 'Video call';
const API = import.meta.env.VITE_API_URL;

const store = {
  get(k) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* storage blocked */
    }
  },
};

// Dipstick test group: a card link with ?dipstick=<name> tags this visitor's chats and
// enquiries with that group for the whole visit, so the owner can compare it with live traffic.
export function visitorCohort() {
  const fromUrl = new URLSearchParams(window.location.search).get('dipstick');
  const clean = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
  if (clean(fromUrl)) store.set('wc-cohort', clean(fromUrl));
  return clean(store.get('wc-cohort')) || 'live';
}

const newSessionId = () =>
  (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^\w-]/g, '');

// Real AI conversation behind each template's chat sheet.
export function useChat() {
  const first = CARD.firstName || 'me';
  const greeting = CARD.ai?.greeting || `Hi! I'm ${first}'s AI assistant. Ask me about services, work, or how to get in touch.`;
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: greeting }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [sessionId] = useState(newSessionId);
  const consentKey = 'wc-chat-consent-' + (CARD.slug || '');
  const [consented, setConsented] = useState(() => !!store.get(consentKey));
  // A question typed before the visitor accepted the notice; sent once they do.
  const [pending, setPending] = useState('');
  const [offer, setOffer] = useState('hidden'); // hidden | shown | clicked
  const [nps, setNps] = useState('hidden'); // hidden | ask | done

  const nicheChips = CARD.ai?.chips || [];
  const chips = [
    ...(nicheChips.length
      ? nicheChips
      : [CARD.services?.length ? 'What services do you offer?' : null, CARD.projects?.length ? 'Show recent projects' : null, 'How can I contact you?']),
    CARD.href?.WhatsApp ? 'Share contact on WhatsApp' : null,
    CARD.videoRoomUrl ? VIDEO_CHIP : null,
  ].filter(Boolean);

  const ask = async (text, history) => {
    const next = [...history, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await axios.post(`${API}/api/ai/chat/${CARD.slug}`, {
        messages: next.map(({ role, content }) => ({ role, content })),
        consent: true,
        sessionId,
        cohort: visitorCohort(),
      });
      const updated = [...next, { role: 'assistant', content: res.data.reply }];
      setMessages(updated);
      if (res.data.showOffer && CARD.ai?.offer) setOffer((o) => (o === 'hidden' ? 'shown' : o));
      // Ask for a rating once the conversation has had a few real answers.
      const answers = updated.filter((m) => m.role === 'assistant').length - 1;
      if (CARD.ai?.nps && answers >= 3) setNps((n) => (n === 'hidden' ? 'ask' : n));
    } catch (err) {
      if (err.response?.data?.needConsent) {
        store.set(consentKey, '');
        setConsented(false);
        setPending(text);
        setMessages(history);
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: err.response?.data?.msg || 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const send = async (raw) => {
    const text = String(raw || '').trim().slice(0, 1000);
    if (!text || busyRef.current) return;
    if (text === VIDEO_CHIP && CARD.videoRoomUrl) {
      window.open(CARD.videoRoomUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!CARD.slug) {
      setMessages((m) => [
        ...m,
        { role: 'user', content: text },
        { role: 'assistant', content: 'The AI assistant answers on your live card once it is published.' },
      ]);
      setInput('');
      return;
    }
    if (!consented) {
      setPending(text);
      setInput('');
      return;
    }
    await ask(text, messages);
  };

  const accept = () => {
    store.set(consentKey, String(Date.now()));
    setConsented(true);
    const text = pending;
    setPending('');
    if (text) ask(text, messages);
  };

  const clickOffer = () => {
    setOffer('clicked');
    axios.post(`${API}/api/ai/offer-click/${CARD.slug}`, { sessionId }).catch(() => {});
    const o = CARD.ai.offer;
    const go = o.url || CARD.href?.WhatsApp || CARD.href?.Call || '';
    if (go) openLink(go)();
    else scrollToSection('Contact');
    if (CARD.ai?.nps) setTimeout(() => setNps((n) => (n === 'hidden' ? 'ask' : n)), 1500);
  };

  const rate = async (score, comment) => {
    setNps('done');
    try {
      await axios.post(`${API}/api/ai/feedback/${CARD.slug}`, { sessionId, score, comment });
    } catch {
      /* feedback is best-effort */
    }
  };

  return {
    messages,
    input,
    busy,
    chips,
    send,
    setInput,
    consented,
    pending,
    accept,
    offer,
    clickOffer,
    nps,
    rate,
    submit: (e) => {
      if (e && e.preventDefault) e.preventDefault();
      send(input);
    },
    onKeyDown: (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input);
      }
    },
  };
}

// Small buttons inside chat bubbles; colours follow the bubble so every template keeps its look.
const chipBtn = {
  font: 'inherit',
  fontSize: '13px',
  fontWeight: 600,
  padding: '7px 12px',
  borderRadius: '999px',
  border: '1px solid currentColor',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
};

function ConsentNote({ chat }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontWeight: 700 }}>Before we chat</div>
      <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
        Your messages will be processed by an AI service to answer you on behalf of {CARD.fullName}.
        {CARD.ai?.sensitive ? ' Please don’t share health reports, ID numbers or other sensitive details here.' : ''} We don’t store your
        chat text. See our{' '}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="/ai-data-privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          how the AI uses data
        </a>
        .
      </div>
      <div>
        <button type="button" onClick={chat.accept} style={chipBtn}>
          I agree, continue
        </button>
      </div>
    </div>
  );
}

function OfferNote({ chat }) {
  const o = CARD.ai.offer;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontWeight: 700 }}>{o.title}</div>
      <div>
        <button type="button" onClick={chat.clickOffer} style={chipBtn}>
          {o.cta || o.title} →
        </button>
      </div>
    </div>
  );
}

function NpsNote({ chat }) {
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  if (chat.nps === 'done') return <div style={{ fontWeight: 600 }}>Thank you for the feedback! 🙏</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontWeight: 700 }}>How likely are you to recommend {CARD.firstName || 'us'} to a friend?</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-pressed={score === n}
            onClick={() => setScore(n)}
            style={{ ...chipBtn, padding: 0, width: '28px', height: '28px', fontSize: '12px', opacity: score === null || score === n ? 1 : 0.45, ...(score === n ? { outline: '2px solid currentColor', outlineOffset: '1px' } : {}) }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.7 }}>
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
      {score !== null && (
        <>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder={score >= 9 ? 'What did you like most? (optional)' : 'What could be better? (optional)'}
            style={{ font: 'inherit', fontSize: '16px', padding: '8px 10px', borderRadius: '10px', border: '1px solid currentColor', background: 'transparent', color: 'inherit', outline: 'none' }}
          />
          <div>
            <button type="button" onClick={() => chat.rate(score, comment)} style={chipBtn}>
              Send feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Inline formatting for AI replies: **bold**, [links](url), bare URLs, emails. Colours follow the bubble.
function inline(str, keyBase) {
  return str.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|https?:\/\/[^\s)>]+|[\w.+-]+@[\w-]+\.[a-z]{2,})/gi).map((part, i) => {
    const k = keyBase + '-' + i;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const internal = /^(tel|mailto):/.test(link[2]);
      return (
        <a
          key={k}
          href={link[2]}
          target={internal ? undefined : '_blank'}
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', fontWeight: 600 }}
        >
          {link[1]}
        </a>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//i.test(part))
      return (
        <a key={k} href={part} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
          {part}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(part))
      return (
        <a key={k} href={`mailto:${part}`} style={{ textDecoration: 'underline' }}>
          {part}
        </a>
      );
    return <React.Fragment key={k}>{part}</React.Fragment>;
  });
}

export function ChatText({ text }) {
  if (React.isValidElement(text)) return text;
  const lines = String(text || '').split('\n');
  return lines.map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: '6px' }} />;
    const bullet = /^([•*-]|\d+\.)\s+/.exec(t);
    if (bullet)
      return (
        <div key={i} style={{ display: 'flex', gap: '6px' }}>
          <span style={{ opacity: 0.6 }}>{/\d/.test(bullet[1]) ? bullet[1] : '•'}</span>
          <span>{inline(t.slice(bullet[0].length), i)}</span>
        </div>
      );
    return <div key={i}>{inline(t.replace(/^#{1,3}\s+/, ''), i)}</div>;
  });
}

// Renders the conversation using the template's own bubble designs.
export function ChatThread({ chat, bot, user, typing }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [chat.messages.length, chat.busy, chat.pending, chat.offer, chat.nps]);
  return (
    <>
      {chat.messages.map((m, i) => (m.role === 'user' ? user(m.content, i) : bot(m.content, i)))}
      {CARD.ai?.disclaimer ? bot(<div style={{ fontSize: '12.5px', opacity: 0.85 }}>ⓘ {CARD.ai.disclaimer}</div>, 'disclaimer') : null}
      {chat.pending ? user(chat.pending, 'pending') : null}
      {!chat.consented && chat.pending ? bot(<ConsentNote chat={chat} />, 'consent') : null}
      {chat.busy ? typing || bot('…', 'typing') : null}
      {chat.offer !== 'hidden' && CARD.ai?.offer ? bot(<OfferNote chat={chat} />, 'offer') : null}
      {chat.nps !== 'hidden' ? bot(<NpsNote chat={chat} />, 'nps') : null}
      <div ref={end} style={{ height: '1px', flexShrink: 0 }} />
    </>
  );
}

// Live phone settings: use the "full scroll" frame and switch on the live states.
export function liveFrame(frames, live, props) {
  const list = frames || [];
  const base = list.find((x) => x.key === 'full') || {};
  const dark = list.find((x) => x.key === 'dark');
  const ai = !!(CARD.ai && CARD.ai.enabled);
  return {
    ...base,
    h: 'auto',
    barHidden: !live.past,
    launchBottom: live.past ? base.launchBottom || 100 : 24,
    chat: ai && live.chat,
    tip: ai && live.tip && !live.chat,
    launch: ai && !live.kb && !live.chat,
    ...(props && props.dark && dark ? { t: dark.t } : {}),
  };
}

const KEY_RE = /^t\d+-(av|logo|cover|proj-(\d+))/;

// Replaces the design tool's image slot with the card's real images.
export function ImageSlot({ id, placeholder, shape, radius, style }) {
  // Ids carry the design's frame name (t4-proj-full-0); drop it to get the slot key.
  const m = String(id || '')
    .replace(/-(full|hero|small|chat|dark)(?=-|$)/, '')
    .match(KEY_RE);
  let src = null;
  if (m) {
    if (m[1] === 'av') src = CARD.avatar;
    else if (m[1] === 'logo') src = CARD.logo;
    else if (m[1] === 'cover') src = CARD.cover;
    else if (m[2] !== undefined) src = CARD.projects?.[+m[2]]?.image;
  }
  const r = shape === 'circle' ? '50%' : shape === 'rounded' ? `${radius || 8}px` : undefined;
  const letters =
    m && m[1] === 'av' ? CARD.initials : m && m[1] === 'logo' ? (CARD.company || CARD.fullName || '').charAt(0).toUpperCase() : '';
  const showInitials = !src && !!letters;
  return (
    <div
      aria-label={placeholder}
      style={{
        overflow: 'hidden',
        borderRadius: r,
        ...(showInitials ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : null),
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: /mshots/.test(src) ? 'top' : undefined,
            display: 'block',
          }}
        />
      ) : showInitials ? (
        <span
          style={{
            fontWeight: 700,
            fontSize: m[1] === 'logo' ? '12px' : 'clamp(22px, 9cqi, 36px)',
            opacity: 0.75,
            color: m[1] === 'logo' ? '#1A1A1A' : undefined,
          }}
        >
          {letters}
        </span>
      ) : null}
    </div>
  );
}

// Cover image (when the owner uploaded a banner) laid over a template's designed cover background.
export function CoverImage({ style }) {
  if (!CARD.cover) return null;
  return (
    <img
      src={CARD.cover}
      alt=""
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  );
}

// Image inside a styled placeholder box (projects, portfolio tiles, reels).
export function Fill({ src, style }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: /mshots/.test(src) ? 'top' : undefined, // website screenshots: keep the header in view
        display: 'block',
        ...style,
      }}
    />
  );
}

// Minimum widths the Instagram / Facebook embeds lay themselves out for; smaller boxes scale them down.
const EMBED_BASE = { instagram: 326, facebook: 320 };

// Plays a reel inside its card: YouTube and video files start muted when scrolled into view,
// Instagram and Facebook use their official embed players.
export function ReelMedia({ reel, index = 0, openable = true }) {
  const box = useRef(null);
  const [visible, setVisible] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);
  // Inline players stop while the full-screen viewer is open.
  const [viewerOpen, setViewerOpen] = useState(reelStore.index >= 0);
  useEffect(() => {
    const l = () => setViewerOpen(reelStore.index >= 0);
    reelStore.listeners.add(l);
    return () => reelStore.listeners.delete(l);
  }, []);
  if (!reel) return null;
  const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' };
  let media = null;
  if (viewerOpen && openable) {
    media = reel.thumb ? <img src={reel.thumb} alt="" style={{ ...fill, objectFit: 'cover' }} /> : null;
  } else if (reel.kind === 'file') {
    media = (
      <video
        src={reel.src}
        poster={reel.thumb || undefined}
        autoPlay
        muted
        loop
        playsInline
        controls
        style={{ ...fill, objectFit: 'cover', background: '#000' }}
      />
    );
  } else if (reel.kind === 'youtube') {
    media = visible ? (
      <iframe
        src={reel.embed}
        title={reel.title || 'YouTube video'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ ...fill, background: '#000' }}
      />
    ) : (
      <img src={reel.thumb} alt="" style={{ ...fill, objectFit: 'cover' }} />
    );
  } else if (reel.kind === 'instagram' || reel.kind === 'facebook') {
    const base = EMBED_BASE[reel.kind];
    const scale = size.w ? Math.min(1, size.w / base) : 1;
    media = visible ? (
      <div style={{ ...fill, overflow: 'hidden', background: '#fff' }}>
        <iframe
          src={reel.embed}
          title={reel.title || `${reel.platform} reel`}
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
          allowFullScreen
          style={{ border: 0, width: `${base}px`, height: `${size.h / scale}px`, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        />
      </div>
    ) : reel.thumb ? (
      <img src={reel.thumb} alt="" style={{ ...fill, objectFit: 'cover' }} />
    ) : null;
  } else if (reel.thumb) {
    media = <img src={reel.thumb} alt="" style={{ ...fill, objectFit: 'cover' }} />;
  }
  const playable = reel.kind !== 'external';
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, zIndex: media && playable ? 2 : 0 }}>
      {media}
      {playable && openable ? (
        // Taps go to the viewer instead of the small inline player.
        <button
          type="button"
          aria-label={`Open ${reel.platform} reel`}
          onClick={(e) => {
            e.stopPropagation();
            // the viewer only lists playable reels
            openReel((CARD.reels || []).slice(0, index).filter((x) => x.kind !== 'external').length);
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 3, border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}
        />
      ) : null}
    </div>
  );
}

// ── Reel viewer: one per page, opened from any reel card ─────────────────────
const reelStore = { index: -1, listeners: new Set() };
export const openReel = (i) => {
  reelStore.index = typeof i === 'number' ? i : 0;
  reelStore.listeners.forEach((l) => l());
};
const closeReel = () => openReel(-1);

export function ReelViewer() {
  const [index, setIndex] = useState(reelStore.index);
  useEffect(() => {
    const l = () => setIndex(reelStore.index);
    reelStore.listeners.add(l);
    return () => reelStore.listeners.delete(l);
  }, []);
  const reels = (CARD.reels || []).filter((r) => r.kind !== 'external');
  const open = index >= 0 && reels.length > 0;
  const i = open ? Math.min(index, reels.length - 1) : 0;
  const go = (d) => openReel((i + d + reels.length) % reels.length);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeReel();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  });
  if (!open) return null;
  const r = reels[i];
  const frame = { width: '100%', height: '100%', border: 0, display: 'block', background: '#000' };
  let media;
  if (r.kind === 'file') media = <video key={r.src} src={r.src} autoPlay controls playsInline style={{ ...frame, objectFit: 'contain' }} />;
  else
    media = (
      <iframe
        key={r.full}
        src={r.full}
        title={r.title || `${r.platform} reel`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
        allowFullScreen
        style={{ ...frame, background: r.kind === 'youtube' ? '#000' : '#fff' }}
      />
    );
  const arrow = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: '8px',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 0,
    background: 'rgba(255,255,255,.14)',
    color: '#fff',
    fontSize: '26px',
    lineHeight: '44px',
    cursor: 'pointer',
    zIndex: 2,
  });
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${r.platform} reel`}
      onClick={closeReel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
      >
        <div
          style={{
            position: 'relative',
            height: 'min(78vh, calc((100vw - 32px) * 16 / 9))',
            aspectRatio: '9/16',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}
        >
          {media}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '14px', maxWidth: '100%' }}>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.title || r.platform}
          </span>
          {reels.length > 1 ? <span style={{ opacity: 0.6 }}>{`${i + 1} / ${reels.length}`}</span> : null}
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', opacity: 0.8, textDecoration: 'underline', whiteSpace: 'nowrap' }}
          >
            {`Open on ${r.platform} ↗`}
          </a>
        </div>
      </div>
      {reels.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous reel"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            style={arrow('left')}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next reel"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            style={arrow('right')}
          >
            ›
          </button>
        </>
      ) : null}
      <button
        type="button"
        aria-label="Close"
        onClick={closeReel}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 0,
          background: 'rgba(255,255,255,.14)',
          color: '#fff',
          fontSize: '22px',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        ✕
      </button>
    </div>
  );
}

const rowStep = (row) => {
  const card = row.firstElementChild;
  return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap || '10') : row.clientWidth * 0.6;
};

// Holds off the auto-slide after someone steps through a row themselves.
const pauseRow = (row) => (row.dataset.wcPause = String(Date.now() + 8000));

// A horizontal swipe row of project cards with dots, plus prev/next arrows on mouse devices.
// The row itself keeps the template's style; useReelCarousel below auto-slides it.
export function SwipeRow({ style, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ i: 0, n: 0, start: true, end: true });
  const count = React.Children.count(children);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const update = () => {
      const n = row.children.length;
      const max = row.scrollWidth - row.clientWidth;
      const end = row.scrollLeft >= max - 4;
      const i = end ? n - 1 : Math.min(n - 1, Math.round(row.scrollLeft / rowStep(row)));
      setPos((p) =>
        p.i === i && p.n === n && p.start === row.scrollLeft < 4 && p.end === end ? p : { i, n, start: row.scrollLeft < 4, end },
      );
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [count]);
  const go = (to) => {
    const row = ref.current;
    pauseRow(row);
    const max = row.scrollWidth - row.clientWidth;
    row.scrollTo({ left: Math.max(0, Math.min(max, to * rowStep(row))), behavior: 'smooth' });
  };
  const arrow = (dir) => (
    <button
      type="button"
      className="wc-swipe-arrow"
      aria-label={dir < 0 ? 'Previous project' : 'Next project'}
      onClick={() => go(pos.i + dir)}
      disabled={dir < 0 ? pos.start : pos.end}
      style={{ [dir < 0 ? 'left' : 'right']: '4px' }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={dir < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </svg>
    </button>
  );
  return (
    <>
      <div style={{ position: 'relative' }}>
        <div ref={ref} data-wc-projects="1" style={style}>
          {children}
        </div>
        {pos.n > 1 && arrow(-1)}
        {pos.n > 1 && arrow(1)}
      </div>
      {pos.n > 1 && (
        <div className="wc-swipe-dots" role="tablist" aria-label="Projects">
          {pos.n <= 10 ? (
            Array.from({ length: pos.n }, (_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Project ${k + 1}`}
                aria-selected={k === pos.i}
                className={k === pos.i ? 'on' : ''}
                onClick={() => go(k)}
              />
            ))
          ) : (
            <span>{`${pos.i + 1} / ${pos.n}`}</span>
          )}
        </div>
      )}
    </>
  );
}

// Reel and project rows (marked data-wc-reels / data-wc-projects) slide one card every few
// seconds and loop; touching a row pauses it. Touch swipes natively; a mouse can drag the row.
export function useReelCarousel(root) {
  useEffect(() => {
    const pausedUntil = new WeakMap();
    const lastTarget = new WeakMap();
    const pause = (e) => pausedUntil.set(e.currentTarget, Date.now() + 8000);

    // Mouse drag-to-scroll. Snapping is off while dragging, then the row settles on the nearest card.
    let drag = null;
    let suppressClick = false;
    const onMove = (e) => {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) drag.moved = true;
      drag.row.scrollLeft = drag.left - dx;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      const { row, moved, snap } = drag;
      drag = null;
      row.style.cursor = 'grab';
      row.style.userSelect = '';
      if (moved) {
        suppressClick = true;
        setTimeout(() => (suppressClick = false), 50);
        const step = rowStep(row);
        const max = row.scrollWidth - row.clientWidth;
        row.scrollTo({ left: Math.min(max, Math.round(row.scrollLeft / step) * step), behavior: 'smooth' });
      }
      setTimeout(() => (row.style.scrollSnapType = snap), moved ? 450 : 0);
    };
    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const row = e.currentTarget;
      drag = { row, x: e.clientX, left: row.scrollLeft, moved: false, snap: row.style.scrollSnapType };
      row.style.scrollSnapType = 'none';
      row.style.cursor = 'grabbing';
      row.style.userSelect = 'none';
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    };
    // A drag shouldn't also open the card it ended on.
    const onClick = (e) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const noNativeDrag = (e) => e.preventDefault();

    let rows = [];
    const bind = () => {
      const found = [...(root.current?.querySelectorAll('[data-wc-reels], [data-wc-projects]') || [])];
      found
        .filter((r) => !rows.includes(r))
        .forEach((r) => {
          r.addEventListener('pointerdown', pause, { passive: true });
          r.addEventListener('wheel', pause, { passive: true });
          r.addEventListener('mouseenter', pause);
          r.addEventListener('pointerdown', onDown);
          r.addEventListener('click', onClick, true);
          r.addEventListener('dragstart', noNativeDrag);
          r.style.cursor = 'grab';
          r.style.overscrollBehaviorX = 'contain';
        });
      rows = found;
    };
    const tick = () => {
      bind();
      if (reelStore.index >= 0 || document.hidden) return;
      for (const row of rows) {
        if (drag || Math.max(pausedUntil.get(row) || 0, +row.dataset.wcPause || 0) > Date.now()) continue;
        const max = row.scrollWidth - row.clientWidth;
        if (max < 8) continue;
        const step = rowStep(row);
        // If the previous smooth scroll is still on its way, continue from where it was heading.
        const cur = row.scrollLeft;
        const last = lastTarget.get(row);
        const base = last != null && cur < last && cur >= last - step - 2 ? last : cur;
        const left = base >= max - 8 ? 0 : Math.min(max, base + step);
        lastTarget.set(row, left);
        row.scrollTo({ left, behavior: 'smooth' });
      }
    };
    const t = setInterval(tick, 3500);
    return () => {
      clearInterval(t);
      rows.forEach((r) => {
        r.removeEventListener('pointerdown', pause);
        r.removeEventListener('wheel', pause);
        r.removeEventListener('mouseenter', pause);
        r.removeEventListener('pointerdown', onDown);
        r.removeEventListener('click', onClick, true);
        r.removeEventListener('dragstart', noNativeDrag);
      });
      window.removeEventListener('pointermove', onMove);
    };
  }, [root]);
}

export function CardQR({ color = '#111111', bg = 'transparent', style }) {
  return (
    <div className="wc-qr" style={{ width: '100%', height: '100%', ...style }}>
      <QRCodeSVG
        value={CARD.cardUrl || window.location.href}
        size={256}
        bgColor={bg}
        fgColor={color}
        level="M"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

export function downloadQR(e) {
  if (e && e.preventDefault) e.preventDefault();
  const svg = document.querySelector('.wc-root .wc-qr svg');
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const size = 1024;
    const pad = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size + pad * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, pad, pad, size, size);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(CARD.fullName || 'card').replace(/\s+/g, '-')}-QR.png`;
    a.click();
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

// PDFs (portfolio attachments) open in the card's own viewer instead of a download.
export const isPdfUrl = (href) => /\.pdf($|[?#])/i.test(href || '') || /\/raw\/upload\//.test(href || '');

export const openLink = (href) => (e) => {
  if (e && e.preventDefault) e.preventDefault();
  if (!href) return;
  if (isPdfUrl(href)) openPdf(href);
  else if (/^(tel|mailto):/.test(href)) window.location.href = href;
  else window.open(href, '_blank', 'noopener,noreferrer');
};

// ── PDF viewer: one per page ────────────────────────────────────────────────
const pdfStore = { url: '', listeners: new Set() };
export const openPdf = (url) => {
  pdfStore.url = url || '';
  pdfStore.listeners.forEach((l) => l());
};

export function PdfViewer() {
  const [url, setUrl] = useState(pdfStore.url);
  useEffect(() => {
    const l = () => setUrl(pdfStore.url);
    pdfStore.listeners.add(l);
    return () => pdfStore.listeners.delete(l);
  }, []);
  useEffect(() => {
    if (!url) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && openPdf('');
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [url]);
  if (!url) return null;
  // Phones can't show a PDF inside a frame, so they get Google's viewer (needs a public URL).
  const isPublic = /^https:\/\//.test(url) && !/localhost|127\.0\.0\.1/.test(url);
  const touch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const src = touch && isPublic ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}` : url;
  const name = decodeURIComponent(url.split('/').pop().split('?')[0] || 'document.pdf');
  const btn = {
    height: '36px',
    padding: '0 12px',
    borderRadius: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    background: 'rgba(255,255,255,.14)',
    border: 0,
    cursor: 'pointer',
    textDecoration: 'none',
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PDF document"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,.9)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', color: '#fff' }}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '14px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" style={btn}>
          {'New tab ↗'}
        </a>
        <a href={url} download style={btn}>
          {'Download'}
        </a>
        <button
          type="button"
          aria-label="Close"
          onClick={() => openPdf('')}
          style={{ ...btn, width: '36px', padding: 0, justifyContent: 'center', fontSize: '18px' }}
        >
          ✕
        </button>
      </div>
      <iframe key={src} src={src} title={name} style={{ flex: 1, width: '100%', border: 0, background: '#fff' }} />
    </div>
  );
}

// "Enquire" on a service: open its link if it has one, else jump to the contact form.
export const enquire = (item) => (e) => {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  if (item && item.link) openLink(item.link)();
  else if (CARD.showEnquiry) scrollToSection('Contact');
  else if (CARD.href.WhatsApp) openLink(CARD.href.WhatsApp)();
  else if (CARD.href.Call) openLink(CARD.href.Call)();
};

// Real enquiry form, styled by the template that renders it.
// fieldStyle/placeholderColor/buttonStyle copy the look of the design's placeholder fields.
export function EnquiryForm({
  fieldStyle,
  placeholderColor,
  buttonStyle,
  buttonClass,
  buttonLabel = 'Send message',
  gap = '10px',
  messageHeight = '100px',
}) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' });
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim() || !CARD.slug || !agree) return;
    setStatus('sending');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/public/${CARD.slug}/enquiry`, {
        ...form,
        consent: true,
        cohort: visitorCohort(),
      });
      setStatus('sent');
      setForm({ name: '', mobile: '', email: '', message: '' });
    } catch (err) {
      setErrMsg(err.response?.data?.msg || '');
      setStatus('error');
    }
  };
  const input = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0 14px',
    font: 'inherit',
    fontSize: '16px',
    outline: 'none',
    color: 'inherit',
    border: 'none',
    borderRadius: 0,
    background: 'transparent',
    ...fieldStyle,
  };
  if (status === 'sent') {
    return (
      <div style={{ ...input, height: 'auto', padding: '18px 14px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700 }}>Thanks! Your message was sent.</div>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          style={{
            marginTop: '6px',
            background: 'none',
            border: 'none',
            color: 'inherit',
            textDecoration: 'underline',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '14px',
          }}
        >
          Send another
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="wc-form" style={{ display: 'flex', flexDirection: 'column', gap, '--wc-ph': placeholderColor }}>
      <input required placeholder="Name" value={form.name} onChange={set('name')} style={input} />
      <input type="tel" placeholder="Phone" value={form.mobile} onChange={set('mobile')} style={input} />
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} style={input} />
      <textarea
        required
        placeholder="Message"
        value={form.message}
        onChange={set('message')}
        style={{ ...input, height: messageHeight, padding: '14px', resize: 'none' }}
      />
      <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', lineHeight: 1.45, opacity: 0.85, cursor: 'pointer' }}>
        <input
          type="checkbox"
          required
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          style={{ width: '16px', height: '16px', marginTop: '1px', flexShrink: 0, accentColor: 'currentColor' }}
        />
        <span>
          I agree to share these details with {CARD.fullName || 'the card owner'} so they can reply to me.{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
            Privacy Policy
          </a>
        </span>
      </label>
      {status === 'error' && <div style={{ fontSize: '13px', color: '#DC2626' }}>{errMsg || 'Could not send. Please try again.'}</div>}
      <button type="submit" disabled={status === 'sending'} className={buttonClass} style={{ cursor: 'pointer', ...buttonStyle }}>
        {status === 'sending' ? 'Sending…' : buttonLabel}
      </button>
    </form>
  );
}

// Owner's custom HTML sections, rendered in a shadow root so their CSS can't leak.
function SafeHtml({ html }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const shadow = ref.current.shadowRoot || ref.current.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>:host{display:block;color:inherit;font:inherit;overflow-wrap:anywhere}img,video,iframe{max-width:100%;height:auto;border-radius:8px}.w{width:100%;overflow-x:auto}</style><div class="w">${html || ''}</div>`;
  }, [html]);
  return <div ref={ref} />;
}

export function CustomSections({ headStyle, boxStyle, pad = '28px 16px 0' }) {
  const list = CARD.customSections || [];
  if (!list.length) return null;
  return list.map((s) => (
    <div key={s._id || s.title} style={{ padding: pad }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: 700, ...headStyle }}>{s.title}</h3>
      <div style={{ fontSize: '15px', lineHeight: 1.6, ...boxStyle }}>
        <SafeHtml html={s.content} />
      </div>
    </div>
  ));
}
