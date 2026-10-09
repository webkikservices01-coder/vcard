import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import WebCard, { nativeModeOf } from '../webcard/WebCard';
import { getVideoRoomUrl } from '../utils/videoRoom';
import { markNotFound, setCardIndexing, setCardMeta } from '../components/Seo';
import { faviconHref, setPageFavicon } from '../utils/favicon';
import { getImageUrl } from '../utils/media';
import AiCallHost from '../webcard/AiCallHost';

const API = import.meta.env.VITE_API_URL;
// Branded 404 (site header + footer), loaded only when a card link is wrong.
const NotFound = lazy(() => import('./NotFound'));

// The owner's WhatsApp link (for "WhatsApp them" after an AI call).
const whatsappOf = (card) => {
  const l = (card?.dynamicLinks || []).find((x) => /whatsapp/i.test(x.fieldType || ''));
  if (!l?.url) return '';
  if (/^https?:\/\//i.test(l.url)) return l.url;
  const n = String(l.url).replace(/\D/g, '');
  return n ? `https://wa.me/${n.length === 10 ? '91' + n : n}` : '';
};
const _viewedSlugs = new Set();

// First load of a card uses the request index.html already started (window.__cardPrefetch),
// so the data arrives while the app code is still loading. Later loads go to the API as usual.
const takePrefetch = (slug, key) => {
  const pre = window.__cardPrefetch;
  if (!pre || pre.slug !== slug || pre['used_' + key]) return null;
  pre['used_' + key] = true;
  return pre[key].then(
    (d) => ({ data: d }),
    (status) => Promise.reject({ response: typeof status === 'number' ? { status } : undefined })
  );
};

const PublicVcard = () => {
  // Usernames are lowercase; /Shubham-Khurana opens the same card as /shubham-khurana.
  const slug = (useParams().slug || '').toLowerCase();
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // The owner's free trial is over and not paid: the card is paused (402 from the API).
  const [paused, setPaused] = useState(null);
  const [aiPersona, setAiPersona] = useState(null);
  // Owner viewing their own card: it refreshes so dashboard edits show up here.
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios
      .get(`${API}/api/vcard/me`, { headers: { 'x-auth-token': token } })
      .then((r) => setIsOwner((r.data?.username || '').toLowerCase() === slug))
      .catch(() => {});
  }, [slug]);

  // Card data. Re-renders only when something actually changed.
  const lastJson = useRef('');
  const load = useCallback(async () => {
    try {
      const res = await (takePrefetch(slug, 'data') || axios.get(`${API}/api/vcard/public/${slug}`));
      const json = JSON.stringify(res.data);
      if (json !== lastJson.current) {
        lastJson.current = json;
        setData(res.data);
        setCardIndexing(res.data?.settings?.seoIndexing !== false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
        markNotFound();
      } else if (err.response?.status === 402) {
        setPaused(err.response.data || {});
        setCardIndexing(false);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // load() is async: its setState calls run after the request, not during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    (takePrefetch(slug, 'ai') || axios.get(`${API}/api/ai/public/${slug}`))
      .then((res) => setAiPersona(res.data))
      .catch(() => setAiPersona(null));
  }, [slug, load]);

  // Only the owner's own view refreshes, so edits made in the dashboard show up here.
  // Visitors load the card once (polling every visitor made cards slow and loaded the server).
  useEffect(() => {
    if (!isOwner) return;
    const tick = () => !document.hidden && load();
    const t = setInterval(tick, 10000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', tick);
    };
  }, [isOwner, load]);

  useEffect(() => {
    if (!slug || _viewedSlugs.has(slug)) return;
    _viewedSlugs.add(slug);
    axios.post(`${API}/api/vcard/public/${slug}/view`).catch(() => {});
  }, [slug]);

  const name = data?.card?.personalInfo?.name;
  const role = [data?.card?.personalInfo?.designation, data?.card?.personalInfo?.company].filter(Boolean).join(' · ');
  useEffect(() => {
    setCardMeta(name, role);
  }, [name, role]);

  // Browser-tab icon chosen by the owner (Advanced Settings → Card favicon).
  const favicon = data ? faviconHref(data.settings?.favicon, data.card) : null;
  useEffect(() => {
    if (!favicon) return;
    setPageFavicon(favicon);
    return () => setPageFavicon(null);
  }, [favicon]);

  if (loading)
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#faf8f9] font-['Inter']">
        <div className="text-center">
          <div className="w-7 h-7 border-2 border-[#E70C65] border-t-transparent rounded-full mx-auto mb-2 animate-spin" />
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Loading Profile...</p>
        </div>
      </div>
    );

  if (paused)
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#faf8f9] font-['Inter'] p-6">
        <div className="max-w-sm text-center text-slate-900">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#E70C65]/10 text-2xl">⏸</div>
          <h1 className="text-xl font-black">Please upgrade your card</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isOwner
              ? 'Your free trial is over, so your card is paused. Choose a plan and it is live again instantly.'
              : `${paused.name ? `${paused.name}'s` : 'This'} card is paused until it is upgraded. Please check back soon.`}
          </p>
          <a
            href={isOwner ? '/dashboard/plans' : '/'}
            className="mt-5 inline-block rounded-full bg-[#E70C65] px-5 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            {isOwner ? 'Upgrade & reactivate' : 'Make your own AI card'}
          </a>
          <p className="mt-6 text-[11px] text-slate-400">Powered by Aicardly</p>
        </div>
      </div>
    );

  if (notFound || !data)
    return (
      <Suspense fallback={null}>
        <NotFound message="This card does not exist. Check the link, or make your own Aicardly card." />
      </Suspense>
    );

  // ?template=<id>&palette=<1-5>&mode=light|dark lets the owner preview a look before saving it.
  const template = params.get('template') || data.card.theme;
  const palette = params.has('palette') ? Math.max(0, Math.min(4, (parseInt(params.get('palette'), 10) || 1) - 1)) : undefined;
  const mode = ['light', 'dark'].includes(params.get('mode')) ? params.get('mode') : undefined;

  const saved = data.card.themeOptions || {};
  const savedLook = { template: data.card.theme, palette: saved.palette || 0, mode: saved.mode || '', counter: saved.counter !== false };
  const look = { template, palette: palette ?? savedLook.palette, mode: mode ?? savedLook.mode, counter: savedLook.counter };


  // Every AI button opens the template's own chat sheet, wired to the card's AI persona.
  return (
    // Page behind the card follows the card's light/dark look.
    <div className="min-h-dvh" style={{ background: (look.mode || nativeModeOf(look.template)) === 'dark' ? '#050507' : '#E7E7EA' }}>
      <WebCard
        template={look.template}
        palette={look.palette}
        mode={look.mode || undefined}
        counter={look.counter}
        data={data}
        aiPersona={aiPersona}
        videoRoomUrl={getVideoRoomUrl(data.card._id)}
        share
      />
      {aiPersona?.enabled && (aiPersona.calls?.voice || aiPersona.calls?.video) && (
        <>
          <AiCallHost
            slug={slug}
            ownerName={name || 'the owner'}
            aiName={aiPersona.aiName}
            avatar={getImageUrl(data.card.personalInfo?.profilePic) || ''}
            initials={(name || 'A').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            calls={aiPersona.calls}
            whatsapp={whatsappOf(data.card)}
          />
        </>
      )}
    </div>
  );
};

export default PublicVcard;
