import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import WebCard, { nativeModeOf } from '../webcard/WebCard';
import { getVideoRoomUrl } from '../utils/videoRoom';
import { markNotFound, setCardIndexing } from '../components/Seo';
import { faviconHref, setPageFavicon } from '../utils/favicon';

const API = import.meta.env.VITE_API_URL;
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
  useEffect(() => {
    if (name) document.title = `${name} · Aicardly`;
  }, [name]);

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

  if (notFound || !data)
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#faf8f9] font-['Inter'] p-4">
        <div className="text-center text-slate-900">
          <h1 className="text-3xl font-black text-[#E70C65] mb-2">404</h1>
          <p className="text-slate-600 text-xs mb-3">This profile does not exist.</p>
          <a href="/" className="px-4 py-2 rounded-full bg-[#E70C65] text-white text-xs font-bold shadow-sm">
            Go to Home
          </a>
        </div>
      </div>
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
    </div>
  );
};

export default PublicVcard;
