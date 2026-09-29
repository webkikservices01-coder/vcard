import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import WebCard from '../webcard/WebCard';
import { getVideoRoomUrl } from '../utils/videoRoom';
import { markNotFound } from '../components/Seo';

const API = import.meta.env.VITE_API_URL;
const _viewedSlugs = new Set();

const PublicVcard = () => {
  // Usernames are lowercase; /Shubham-Khurana opens the same card as /shubham-khurana.
  const slug = (useParams().slug || '').toLowerCase();
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [aiPersona, setAiPersona] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/vcard/public/${slug}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
          markNotFound();
        }
      } finally {
        setLoading(false);
      }
    };
    load();

    // Keeps the card in sync while the owner edits it from the dashboard.
    const interval = setInterval(load, 5000);

    axios
      .get(`${API}/api/ai/public/${slug}`)
      .then((res) => setAiPersona(res.data))
      .catch(() => setAiPersona(null));

    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    if (!slug || _viewedSlugs.has(slug)) return;
    _viewedSlugs.add(slug);
    axios.post(`${API}/api/vcard/public/${slug}/view`).catch(() => {});
  }, [slug]);

  const name = data?.card?.personalInfo?.name;
  useEffect(() => {
    if (name) document.title = `${name} · Aicardly`;
  }, [name]);

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

  // ?template=<id> lets the owner preview another template before saving it.
  const template = params.get('template') || data.card.theme;

  // Every AI button opens the template's own chat sheet, wired to the card's AI persona.
  return (
    <div className="min-h-dvh bg-[#E7E7EA]">
      <WebCard template={template} data={data} aiPersona={aiPersona} videoRoomUrl={getVideoRoomUrl(data.card._id)} />
    </div>
  );
};

export default PublicVcard;
