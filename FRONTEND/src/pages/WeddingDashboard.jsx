import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, ExternalLink, Copy, Users, Eye, ArrowLeft, Save, Loader2, ImagePlus, Music, X, Check, Download, EyeOff, Smartphone, Wand2,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { TEMPLATES, getTemplate } from '../wedding/data/templates';
import { OCCASIONS, OCCASION_ORDER, occasionOf } from '../wedding/data/occasions';
import { DesignThumb } from '../wedding/DesignThumb';

// Dashboard → Digital Invite: invites for weddings, engagements, birthdays, Diwali, Griha Pravesh,
// baby showers and festival wishes (the design decides the occasion); see guests' RSVPs.
const API = `${import.meta.env.VITE_API_URL}/api/wedding`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });
const mediaUrl = (u) => (u && u.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${u}` : u);
const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://aicardly.com';
const inputCls = 'w-full min-w-0 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400';
const inputStyle = { background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' };

// Designs in the picker, newest first.
const DESIGNS = [...TEMPLATES].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));

// Opening + animated couple options (the three designer templates have their own, fixed).
const SPECIAL_DESIGNS = ['india-shiv-parwati-divine', 'luxury-silver-gold', 'vogue-silver-gold'];
const OPENING_LABEL = { classic: 'Open Invitation cover', shutter: 'Shutter pulls up', scratch: 'Scratch card reveals the date' };
const COUPLE_LABEL = { hindu: 'Dulha–Dulhan (safa & lehenga)', south: 'South Indian (veshti & saree)', nikkah: 'Nikkah (sherwani & dupatta)', modern: 'Modern (suit & gown)' };

const ICONS = ['🌼', '🌿', '🎶', '🔥', '💍', '🥂', '🙏', '🐎', '🪔', '🌸', '🎉', '💃', '🎂', '🎈', '🎩', '🍕', '🎧', '🍽️', '🃏', '🎀'];
const namesOf = (inv) => (occasionOf(getTemplate(inv.template)).couple ? `${inv.coupleOne} ${inv.amp || '&'} ${inv.coupleTwo}` : inv.coupleOne);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const toLocalInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x)) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
};
const longDate = (v) => {
  const d = new Date(v);
  return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const emptyInvite = (slug) => {
  const t = getTemplate(slug) || TEMPLATES[0];
  return {
    template: t.slug, link: '', coupleOne: '', coupleTwo: '', amp: occasionOf(t).couple ? '&' : '', script: t.script, tagline: '', date: '', eventDate: '',
    venueName: '', venueAddress: '', mapUrl: '', story: '', hashtag: '', ceremonies: [], timeline: [], image: '', photos: [], music: '', video: '',
    hostPhone: '', published: true, rsvpOpen: true, showWishes: true, aiChat: true, opening: '', coupleArt: '',
  };
};

// Pictures are made smaller in the browser first (max 1800 px), so invites open fast.
async function shrinkImage(file) {
  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type) || file.size < 400 * 1024) return file;
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, 1800 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file;
}

async function uploadFile(raw) {
  const file = await shrinkImage(raw);
  if (file.size > 25 * 1024 * 1024) throw new Error('That file is too large (max 25 MB).');
  const { data: sig } = await axios.get(`${API}/upload-signature`, { headers: headers() });
  if (sig.mode === 'cloudinary') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp);
    fd.append('folder', sig.folder);
    fd.append('signature', sig.signature);
    const { data } = await axios.post(sig.uploadUrl, fd);
    return data.secure_url;
  }
  const fd = new FormData();
  fd.append('media', file);
  const { data } = await axios.post(`${API}/upload`, fd, { headers: headers() });
  return data.url;
}

export default function WeddingDashboard() {
  const [params, setParams] = useSearchParams();
  const [invites, setInvites] = useState(null);
  // invite being edited (new: no _id). "Use this design" on /wedding opens one with that template.
  const [editing, setEditing] = useState(() => {
    const t = params.get('template');
    return t && getTemplate(t) ? emptyInvite(t) : null;
  });
  const [guestsOf, setGuestsOf] = useState(null);

  const load = () =>
    axios
      .get(`${API}/mine`, { headers: headers() })
      .then(({ data }) => setInvites(data))
      .catch(() => setInvites([]));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (params.get('template')) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (editing)
    return (
      <Editor
        initial={editing}
        onClose={() => setEditing(null)}
        onSaved={(inv) => {
          setEditing(null);
          load();
          toast.success('Invite saved!');
          if (inv?.link) setTimeout(() => window.open(`/invite/${inv.link}`, '_blank', 'noopener'), 300);
        }}
      />
    );
  if (guestsOf) return <Guests invite={guestsOf} onBack={() => setGuestsOf(null)} />;

  return (
    <div className="space-y-5 pb-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9F1C44] via-[#E70C65] to-[#f59e0b] px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-wider text-white/70">New · Free</p>
        <h2 className="mt-1 text-2xl font-black">Digital Invite</h2>
        <p className="mt-1 max-w-xl text-sm text-white/85">
          Wedding, engagement, birthday, Diwali, Griha Pravesh, baby shower invites and festival wishes — with your names, programme, venue, photos and music. Guests RSVP, send wishes and chat with your AI host; you see everyone here.
        </p>
        <a href="/invites" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 underline">
          See all {TEMPLATES.length} designs <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {invites === null ? (
        <div className="h-40 animate-pulse rounded-2xl" style={{ background: 'var(--surface-2)' }} />
      ) : invites.length === 0 ? (
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>Choose a design to start</h3>
          <TemplateGrid value="" onPick={(slug) => setEditing(emptyInvite(slug))} />
        </GlassCard>
      ) : (
        <>
          <div className="flex justify-end">
            <GradientButton onClick={() => setEditing(emptyInvite(TEMPLATES[0].slug))} className="!w-auto px-5">
              <Plus className="h-4 w-4" />
              <span>New invite</span>
            </GradientButton>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {invites.map((inv) => (
              <InviteCard key={inv._id} inv={inv} onEdit={() => setEditing(inv)} onGuests={() => setGuestsOf(inv)} onDeleted={load} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InviteCard({ inv, onEdit, onGuests, onDeleted }) {
  const t = getTemplate(inv.template);
  const o = occasionOf(t);
  const url = `${SITE}/invite/${inv.link}`;
  const share = `${o.share}\n${namesOf(inv)}${inv.date ? ` · ${inv.date}` : ''}\n${url}`;
  const remove = async () => {
    if (!window.confirm(`Delete the invite of ${namesOf(inv)}? Its link and all replies are removed.`)) return;
    await axios.delete(`${API}/${inv._id}`, { headers: headers() });
    toast.success('Deleted');
    onDeleted();
  };
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex gap-4 p-4">
        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl">
          {inv.image || !t ? <img src={mediaUrl(inv.image) || t?.hero} alt="" className="h-full w-full object-cover" /> : <DesignThumb template={t} animate={false} labels={false} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold" style={{ color: 'var(--surface-text)' }}>
            {namesOf(inv)}
          </p>
          <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
            {o.emoji} {o.label} · {t?.name}
            {inv.date ? ` · ${inv.date}` : ''}
            {!inv.published && <span className="ml-1 rounded bg-amber-500/15 px-1.5 text-amber-600">hidden</span>}
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs font-semibold text-brand-600 hover:underline">
            aicardly.com/invite/{inv.link}
          </a>
          <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {inv.views || 0} views</span>
            {o.rsvp && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {inv.stats?.yes || 0} coming · {inv.stats?.guests || 0} guests</span>}
            {o.rsvp && <span>{inv.stats?.replies || 0} replies</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t p-3" style={{ borderColor: 'var(--surface-border)' }}>
        <SmallBtn onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</SmallBtn>
        {o.rsvp && <SmallBtn onClick={onGuests}><Users className="h-3.5 w-3.5" /> Guests & wishes</SmallBtn>}
        <SmallBtn onClick={() => navigator.clipboard.writeText(url).then(() => toast.success('Link copied'))}><Copy className="h-3.5 w-3.5" /> Copy link</SmallBtn>
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
          Share on WhatsApp
        </a>
        <SmallBtn onClick={remove} danger><Trash2 className="h-3.5 w-3.5" /></SmallBtn>
      </div>
    </GlassCard>
  );
}

const SmallBtn = ({ children, danger, ...p }) => (
  <button
    type="button"
    {...p}
    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${danger ? 'text-red-500 hover:bg-red-500/10' : 'hover:border-brand-500'}`}
    style={{ border: '1px solid var(--surface-border)', color: danger ? undefined : 'var(--surface-text)' }}
  >
    {children}
  </button>
);

function TemplateGrid({ value, onPick }) {
  const [filter, setFilter] = useState(() => (value ? getTemplate(value)?.occasion || 'wedding' : 'all'));
  const occ = (t) => t.occasion || 'wedding';
  const shown = filter === 'all' ? DESIGNS : DESIGNS.filter((t) => occ(t) === filter);
  const chips = [['all', 'All'], ...OCCASION_ORDER.filter((id) => DESIGNS.some((t) => occ(t) === id)).map((id) => [id, `${OCCASIONS[id].emoji} ${OCCASIONS[id].label}`])];
  return (
    <>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="Filter designs by occasion">
      {chips.map(([id, label]) => (
        <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${filter === id ? 'bg-[#E70C65] text-white' : ''}`} style={filter === id ? undefined : { border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
          {label}
        </button>
      ))}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {shown.map((t) => (
        <button
          key={t.slug}
          type="button"
          onClick={() => onPick(t.slug)}
          aria-pressed={value === t.slug}
          className="group overflow-hidden rounded-xl text-left transition"
          style={{ outline: value === t.slug ? '3px solid #E70C65' : '1px solid var(--surface-border)', outlineOffset: value === t.slug ? 2 : 0 }}
        >
          <div className="relative aspect-[3/4]">
            <DesignThumb template={t} animate={false} labels={false} className="transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {t.isNew && <span className="absolute left-2 top-2 rounded-full bg-[#E70C65] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">New</span>}
            <span className="absolute inset-x-0 bottom-0 p-2 text-xs font-semibold text-white">{t.name}</span>
            {value === t.slug && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#E70C65] text-white"><Check className="h-4 w-4" /></span>}
          </div>
        </button>
      ))}
    </div>
    </>
  );
}

const Section = ({ title, hint, children }) => (
  <GlassCard className="p-5">
    <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{title}</h3>
    {hint && <p className="mt-0.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>{hint}</p>}
    <div className="mt-4 space-y-3">{children}</div>
  </GlassCard>
);
const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--surface-text-2)' }}>{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px]" style={{ color: 'var(--surface-text-2)' }}>{hint}</span>}
  </label>
);

function Editor({ initial, onClose, onSaved }) {
  const [f, setF] = useState(() => ({ ...emptyInvite(initial.template), ...initial, eventDate: toLocalInput(initial.eventDate) }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [linkMsg, setLinkMsg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const linkTouched = useRef(!!initial._id);
  const frame = useRef(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  // The names also make the link (rohan-weds-priya) until the couple types their own.
  const setName = (k) => (e) => {
    const v = e.target.value;
    setF((x) => {
      const n = { ...x, [k]: v };
      if (!linkTouched.current) {
        const oc = occasionOf(getTemplate(n.template));
        n.link = slugify(
          oc.id === 'wedding' ? [n.coupleOne, n.coupleTwo].filter(Boolean).join(' weds ') : oc.couple ? [n.coupleOne, n.coupleTwo, oc.linkJoin].filter(Boolean).join(' ') : [n.coupleOne, oc.linkJoin].filter(Boolean).join(' ')
        ).slice(0, 50);
      }
      return n;
    });
  };
  // Is the link free? (shown only for the link it was checked for)
  useEffect(() => {
    if (!f.link) return;
    const link = f.link;
    const t = setTimeout(() => {
      axios
        .get(`${API}/check-link/${encodeURIComponent(link)}`, { headers: headers(), params: { id: initial._id || '' } })
        .then(({ data }) => setLinkMsg({ ...data, link }))
        .catch(() => setLinkMsg(null));
    }, 400);
    return () => clearTimeout(t);
  }, [f.link, initial._id]);
  const linkState = linkMsg && linkMsg.link === f.link ? linkMsg : null;

  // Live preview: the form goes to the preview frame as it changes.
  const doc = useMemo(() => ({ ...f, eventDate: f.eventDate ? new Date(f.eventDate).toISOString() : '', date: f.date || longDate(f.eventDate) }), [f]);
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
    frame.current?.contentWindow?.postMessage({ type: 'wedding-draft', doc }, window.location.origin);
  }, [doc]);
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin === window.location.origin && e.data?.type === 'wedding-preview-ready') frame.current?.contentWindow?.postMessage({ type: 'wedding-draft', doc: docRef.current }, window.location.origin);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const upload = async (key, files, many = false) => {
    if (!files?.length) return;
    setUploading(key);
    try {
      const urls = [];
      for (const file of [...files].slice(0, many ? 12 : 1)) urls.push(await uploadFile(file));
      setF((x) => ({ ...x, [key]: many ? [...(x[key] || []), ...urls].slice(0, 12) : urls[0] }));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.msg || err.message || 'Upload failed');
    } finally {
      setUploading('');
    }
  };

  const setCeremony = (i, k, v) => setF((x) => ({ ...x, ceremonies: x.ceremonies.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));
  const setStep = (i, k, v) => setF((x) => ({ ...x, timeline: x.timeline.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));

  const save = async () => {
    const o = occasionOf(getTemplate(f.template));
    if (!f.coupleOne.trim() || (o.couple && !f.coupleTwo.trim())) return toast.error(o.couple ? 'Please add both names.' : 'Please add the name.');
    if (o.rsvp && !f.eventDate) return toast.error('Please choose the date and time.');
    if (!f.link || linkState?.available === false) return toast.error(linkState?.msg || 'Please choose a link for your invite.');
    setSaving(true);
    try {
      const body = { ...doc, ceremonies: f.ceremonies.filter((c) => c.name.trim()), timeline: f.timeline.filter((t) => t.h.trim()) };
      delete body._id;
      ['userId', 'views', 'createdAt', 'updatedAt', '__v', 'stats'].forEach((k) => delete body[k]);
      const { data } = initial._id ? await axios.put(`${API}/${initial._id}`, body, { headers: headers() }) : await axios.post(API, body, { headers: headers() });
      onSaved(data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tpl = getTemplate(f.template);
  const o = occasionOf(tpl);
  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex flex-wrap items-center gap-2 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6" style={{ background: 'color-mix(in srgb, var(--surface-bg) 85%, transparent)', borderBottom: '1px solid var(--surface-border)' }}>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="truncate text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{initial._id ? 'Edit' : 'New'} {o.label.toLowerCase()} {o.rsvp ? 'invite' : 'greeting'} · {tpl?.name}</span>
        <button type="button" onClick={() => setShowPreview((v) => !v)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold lg:hidden" style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
          <Smartphone className="h-4 w-4" /> {showPreview ? 'Edit' : 'Preview'}
        </button>
        <GradientButton onClick={save} disabled={saving || !!uploading} className="!w-auto px-5 lg:ml-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving…' : 'Save & publish'}</span>
        </GradientButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className={`space-y-4 ${showPreview ? 'hidden lg:block' : ''}`}>
          <Section title="1. Design" hint="You can switch any time; your details stay.">
            <TemplateGrid
              value={f.template}
              onPick={(slug) =>
                setF((x) => {
                  const was = getTemplate(x.template);
                  const next = getTemplate(slug);
                  const sameKind = (was?.occasion || 'wedding') === (next.occasion || 'wedding');
                  return {
                    ...x,
                    template: slug,
                    script: !x.script || x.script === was?.script ? next.script : x.script,
                    amp: occasionOf(next).couple ? x.amp || '&' : x.amp,
                    // A different occasion's programme doesn't fit (Haldi on a birthday); empty it if untouched.
                    ceremonies: sameKind || x.ceremonies.some((c) => c.date || c.time || c.venue) ? x.ceremonies : [],
                  };
                })
              }
            />
            {!SPECIAL_DESIGNS.includes(f.template) && (
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <Field label="How the invite opens" hint="Guests see this first on your link. Tap “Play opening” in the preview to try it.">
                  <select value={f.opening || ''} onChange={set('opening')} className={inputCls} style={inputStyle}>
                    <option value="">Design default ({OPENING_LABEL[getTemplate(f.template)?.opening || 'classic']})</option>
                    {Object.entries(OPENING_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                {!tpl?.art && <Field label="Animated couple" hint="A cute bride & groom drawn on the invite; your couple photo shows with it.">
                  <select value={f.coupleArt || ''} onChange={set('coupleArt')} className={inputCls} style={inputStyle}>
                    <option value="">Design default ({COUPLE_LABEL[getTemplate(f.template)?.coupleArt] || 'none'})</option>
                    <option value="none">None (show our photo)</option>
                    {Object.entries(COUPLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>}
              </div>
            )}
          </Section>

          <Section title={o.couple ? '2. The couple' : o.rsvp ? '2. Who is celebrating' : '2. Your greeting'}>
            {o.couple ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_70px_1fr]">
                <Field label={`${o.nameOne} *`}><input value={f.coupleOne} onChange={setName('coupleOne')} maxLength={40} placeholder={tpl?.couple.one ? `e.g. ${tpl.couple.one}` : ''} className={inputCls} style={inputStyle} /></Field>
                <Field label="Join with"><input value={f.amp} onChange={set('amp')} maxLength={10} className={inputCls} style={inputStyle} /></Field>
                <Field label={`${o.nameTwo} *`}><input value={f.coupleTwo} onChange={setName('coupleTwo')} maxLength={40} placeholder={tpl?.couple.two ? `e.g. ${tpl.couple.two}` : ''} className={inputCls} style={inputStyle} /></Field>
              </div>
            ) : (
              <div className={`grid gap-3 ${o.id === 'birthday' ? 'sm:grid-cols-[1.4fr_1fr]' : ''}`}>
                <Field label={`${o.nameOne} *`}><input value={f.coupleOne} onChange={setName('coupleOne')} maxLength={40} placeholder={tpl?.couple.one ? `e.g. ${tpl.couple.one}` : ''} className={inputCls} style={inputStyle} /></Field>
                {o.id === 'birthday' && (
                  <Field label={o.nameTwo} hint="Shown under the name; the number becomes gold balloons on milestone designs"><input value={f.coupleTwo} onChange={set('coupleTwo')} maxLength={40} placeholder={tpl?.couple.two ? `e.g. ${tpl.couple.two}` : 'turns 30'} className={inputCls} style={inputStyle} /></Field>
                )}
              </div>
            )}
            <Field label={o.rsvp ? 'Greeting line (top of the invite)' : 'Greeting (the big headline) *'} hint={o.rsvp ? (o.id === 'wedding' ? 'e.g. शुभ विवाह, ॐ श्री गणेशाय नमः, Bismillah…' : `e.g. ${tpl?.script}`) : 'e.g. Happy Diwali, Eid Mubarak, Happy New Year 2027'}><input value={f.script} onChange={set('script')} maxLength={60} className={inputCls} style={inputStyle} /></Field>
            <Field label={o.rsvp ? (o.couple ? 'Line under your names' : 'Line under the name') : 'Short wish line'}><input value={f.tagline} onChange={set('tagline')} maxLength={160} placeholder={o.id === 'wedding' ? 'Together with our families, we invite you to celebrate with us' : tpl?.tagline} className={inputCls} style={inputStyle} /></Field>
          </Section>

          <Section title={o.rsvp ? '3. Date & venue' : '3. Festival date & your number'}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={o.dateLabel} hint="Used for the countdown"><input type="datetime-local" value={f.eventDate} onChange={set('eventDate')} className={inputCls} style={inputStyle} /></Field>
              <Field label="Date as shown on the invite" hint="Leave empty to use the date above"><input value={f.date} onChange={set('date')} maxLength={60} placeholder={longDate(f.eventDate) || '18 February 2027'} className={inputCls} style={inputStyle} /></Field>
            </div>
            {o.rsvp && <Field label="Venue name"><input value={f.venueName} onChange={set('venueName')} maxLength={120} placeholder={tpl?.venue.name ? `e.g. ${tpl.venue.name}` : ''} className={inputCls} style={inputStyle} /></Field>}
            {o.rsvp && <Field label="Venue address"><input value={f.venueAddress} onChange={set('venueAddress')} maxLength={300} placeholder="Area, City" className={inputCls} style={inputStyle} /></Field>}
            <div className="grid gap-3 sm:grid-cols-2">
              {o.rsvp && <Field label="Google Maps link (optional)" hint="Paste the venue's share link for exact directions"><input value={f.mapUrl} onChange={set('mapUrl')} maxLength={1000} placeholder="https://maps.app.goo.gl/…" className={inputCls} style={inputStyle} /></Field>}
              <Field label={o.rsvp ? (o.couple ? 'Family phone (optional)' : 'Host phone (optional)') : 'Your WhatsApp number (optional)'} hint={o.rsvp ? `Shows a "${o.couple ? 'Call the family' : 'Call the host'}" button` : 'Friends can send their wishes back to you on WhatsApp'}><input type="tel" value={f.hostPhone} onChange={set('hostPhone')} maxLength={30} placeholder="+91 98…" className={inputCls} style={inputStyle} /></Field>
            </div>
          </Section>

          {o.rsvp && <Section title={`4. ${o.id === 'wedding' ? 'Functions' : 'Programme'}`} hint={`${o.functions.map((c) => c.name).join(', ')}… each with its own date, time and place.`}>
            {f.ceremonies.map((c, i) => (
              <div key={i} className="grid gap-2 rounded-xl p-3 sm:grid-cols-[64px_1fr_1fr]" style={{ border: '1px solid var(--surface-border)' }}>
                <select value={c.icon} onChange={(e) => setCeremony(i, 'icon', e.target.value)} className={inputCls} style={inputStyle} aria-label="Icon">
                  {ICONS.map((ic) => <option key={ic}>{ic}</option>)}
                </select>
                <input value={c.name} onChange={(e) => setCeremony(i, 'name', e.target.value)} maxLength={60} placeholder={o.id === 'wedding' ? 'Function name' : 'e.g. ' + (o.functions[i % Math.max(1, o.functions.length)]?.name || 'Dinner')} className={inputCls} style={inputStyle} />
                <input value={c.hi} onChange={(e) => setCeremony(i, 'hi', e.target.value)} maxLength={40} placeholder="Name in Hindi (optional)" className={inputCls} style={inputStyle} />
                <input value={c.date} onChange={(e) => setCeremony(i, 'date', e.target.value)} maxLength={60} placeholder="Date, e.g. 16 Feb 2027" className={`${inputCls} sm:col-span-1`} style={inputStyle} />
                <input value={c.time} onChange={(e) => setCeremony(i, 'time', e.target.value)} maxLength={40} placeholder="Time, e.g. 7 PM onwards" className={inputCls} style={inputStyle} />
                <div className="flex gap-2">
                  <input value={c.venue} onChange={(e) => setCeremony(i, 'venue', e.target.value)} maxLength={160} placeholder="Place" className={inputCls} style={inputStyle} />
                  <button type="button" onClick={() => setF((x) => ({ ...x, ceremonies: x.ceremonies.filter((_, j) => j !== i) }))} className="shrink-0 rounded-lg px-2 text-red-500 hover:bg-red-500/10" aria-label="Remove function"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <SmallBtn onClick={() => setF((x) => ({ ...x, ceremonies: [...x.ceremonies, { icon: o.functions[0]?.icon || '🌸', hi: '', name: '', date: '', time: '', venue: '' }].slice(0, 12) }))}><Plus className="h-3.5 w-3.5" /> Add {o.id === 'wedding' ? 'function' : 'item'}</SmallBtn>
              {f.ceremonies.length === 0 && o.functions.length > 0 && (
                <SmallBtn onClick={() => setF((x) => ({ ...x, ceremonies: o.functions.map((c) => ({ ...c, date: '', time: '', venue: '' })) }))}><Wand2 className="h-3.5 w-3.5" /> Add {o.functions.map((c) => c.name).join(', ')}</SmallBtn>
              )}
            </div>
          </Section>}

          <Section title="5. Photos, video & music">
            <div className="flex flex-wrap items-center gap-4">
              {f.image ? <img src={mediaUrl(f.image)} alt="" className="h-24 w-20 rounded-xl object-cover" /> : <div className="grid h-24 w-20 place-items-center rounded-xl text-xs" style={{ background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}>Design photo</div>}
              <div className="space-y-1">
                <UploadBtn busy={uploading === 'image'} accept="image/*" onFiles={(fl) => upload('image', fl)} label={f.image ? `Change ${o.couple ? 'couple ' : ''}photo` : `Add ${o.couple ? 'couple ' : 'your '}photo`} />
                {f.image && <button type="button" className="block text-xs text-red-500" onClick={() => setF((x) => ({ ...x, image: '' }))}>Use the design's photo</button>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--surface-text-2)' }}>Our Moments gallery (up to 12; without photos the design's pictures show)</p>
              <div className="flex flex-wrap gap-2">
                {f.photos.map((p, i) => (
                  <div key={p + i} className="relative">
                    <img src={mediaUrl(p)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button type="button" onClick={() => setF((x) => ({ ...x, photos: x.photos.filter((_, j) => j !== i) }))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white" aria-label="Remove photo"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {f.photos.length < 12 && <UploadBtn square busy={uploading === 'photos'} accept="image/*" multiple onFiles={(fl) => upload('photos', fl, true)} label="Add" />}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold" style={{ color: 'var(--surface-text-2)' }}>Background music (mp3)</p>
                <UploadBtn busy={uploading === 'music'} accept="audio/*" onFiles={(fl) => upload('music', fl)} label={f.music ? 'Change song' : 'Add a song'} icon={Music} />
                {f.music && (
                  <div className="mt-2 flex items-center gap-2">
                    <audio src={mediaUrl(f.music)} controls className="h-8 w-full" />
                    <button type="button" onClick={() => setF((x) => ({ ...x, music: '' }))} className="text-red-500" aria-label="Remove song"><X className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold" style={{ color: 'var(--surface-text-2)' }}>Video (mp4, optional)</p>
                <UploadBtn busy={uploading === 'video'} accept="video/mp4,video/*" onFiles={(fl) => upload('video', fl)} label={f.video ? 'Change video' : 'Add a video'} />
                {f.video && <button type="button" className="mt-1 block text-xs text-red-500" onClick={() => setF((x) => ({ ...x, video: '' }))}>Remove video</button>}
              </div>
            </div>
          </Section>

          <Section title={o.rsvp ? `6. ${o.storyTitle} (optional)` : '6. Your message'}>
            <Field label={o.storyHint}><textarea rows={4} value={f.story} onChange={set('story')} maxLength={2000} placeholder={tpl?.story} className={inputCls} style={inputStyle} /></Field>
            {f.timeline.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[90px_1fr_1.5fr_auto]">
                <input value={s.y} onChange={(e) => setStep(i, 'y', e.target.value)} maxLength={20} placeholder="2022" className={inputCls} style={inputStyle} />
                <input value={s.h} onChange={(e) => setStep(i, 'h', e.target.value)} maxLength={60} placeholder="First meeting" className={inputCls} style={inputStyle} />
                <input value={s.t} onChange={(e) => setStep(i, 't', e.target.value)} maxLength={200} placeholder="One line about it" className={inputCls} style={inputStyle} />
                <button type="button" onClick={() => setF((x) => ({ ...x, timeline: x.timeline.filter((_, j) => j !== i) }))} className="rounded-lg px-2 text-red-500 hover:bg-red-500/10" aria-label="Remove"><X className="h-4 w-4" /></button>
              </div>
            ))}
            {o.couple && f.timeline.length < 6 && <SmallBtn onClick={() => setF((x) => ({ ...x, timeline: [...x.timeline, { y: '', h: '', t: '' }] }))}><Plus className="h-3.5 w-3.5" /> Add a moment (first meeting, proposal…)</SmallBtn>}
            {o.rsvp && <Field label={`${o.id === 'wedding' ? 'Wedding hashtag' : 'Hashtag'} (optional)`}><input value={f.hashtag} onChange={set('hashtag')} maxLength={60} placeholder={tpl?.hashtag || '#AaravWedsMeera'} className={inputCls} style={inputStyle} /></Field>}
          </Section>

          <Section title="7. Link & settings">
            <Field label="Your invite link" hint={linkState ? (linkState.available ? '✓ Available' : linkState.msg) : ''}>
              <div className="flex items-center overflow-hidden rounded-lg" style={inputStyle}>
                <span className="shrink-0 px-3 text-sm" style={{ color: 'var(--surface-text-2)' }}>aicardly.com/invite/</span>
                <input
                  value={f.link}
                  onChange={(e) => {
                    linkTouched.current = true;
                    setF((x) => ({ ...x, link: slugify(e.target.value).slice(0, 50) }));
                  }}
                  maxLength={50}
                  className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm outline-none"
                  style={{ color: 'var(--surface-text)' }}
                />
              </div>
            </Field>
            {[
              ['published', `${o.rsvp ? 'Invite' : 'Greeting'} is live (anyone with the link can open it)`],
              ...(o.rsvp ? [['rsvpOpen', 'Guests can RSVP'], ['showWishes', 'Show guests’ wishes on the invite']] : []),
              ['aiChat', o.rsvp ? `${o.manager} (AI chat): guests ask about the date, programme, venue & RSVP` : `${o.manager} (AI chat) on the greeting`],
            ].map(([k, t]) => (
              <label key={k} className="flex items-center gap-2 text-sm" style={{ color: 'var(--surface-text)' }}>
                <input type="checkbox" checked={!!f[k]} onChange={set(k)} className="h-4 w-4 accent-pink-600" /> {t}
              </label>
            ))}
          </Section>
        </div>

        {/* Live preview (phone size) */}
        <div className={`${showPreview ? '' : 'hidden'} lg:block`}>
          <div className="lg:sticky lg:top-20">
            <div className="mx-auto overflow-hidden rounded-[2.2rem] border-[10px] border-black shadow-2xl" style={{ width: 360, maxWidth: '100%', height: 'min(740px, calc(100vh - 140px))' }}>
              <iframe ref={frame} title="Invite preview" src="/wedding-preview" className="h-full w-full" style={{ border: 0 }} />
            </div>
            <p className="mt-2 text-center text-xs" style={{ color: 'var(--surface-text-2)' }}>Live preview · updates as you type</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadBtn({ label, onFiles, busy, accept, multiple, square, icon: Icon = ImagePlus }) {
  return (
    <label className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-semibold ${square ? 'h-20 w-20 flex-col' : 'px-3 py-2'}`} style={{ border: '1px dashed var(--surface-border)', color: 'var(--surface-text)' }}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {busy ? 'Uploading…' : label}
      <input type="file" accept={accept} multiple={multiple} className="hidden" disabled={busy} onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
    </label>
  );
}

function Guests({ invite, onBack }) {
  const [rows, setRows] = useState(null);
  const load = () =>
    axios
      .get(`${API}/${invite._id}/rsvps`, { headers: headers() })
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const coming = (rows || []).filter((r) => r.attending === 'yes');
  const toggle = async (r) => {
    await axios.patch(`${API}/${invite._id}/rsvps/${r._id}`, { hidden: !r.hidden }, { headers: headers() });
    load();
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.name}'s reply?`)) return;
    await axios.delete(`${API}/${invite._id}/rsvps/${r._id}`, { headers: headers() });
    load();
  };
  const exportCsv = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [['Name', 'Phone', 'Email', 'Attending', 'Guests', 'Message', 'Date'], ...(rows || []).map((r) => [r.name, r.phone, r.email, r.attending, r.guests, r.message, new Date(r.createdAt).toLocaleString('en-IN')])]
      .map((r) => r.map(q).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = `rsvp-${invite.link}.csv`;
    a.click();
  };
  const label = { yes: 'Coming', no: "Can't come", maybe: 'Maybe' };
  return (
    <div className="space-y-4 pb-16">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Guests · {namesOf(invite)}</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>
            {rows ? `${coming.length} coming · ${coming.reduce((a, r) => a + (r.guests || 1), 0)} guests in all · ${rows.length} replies` : 'Loading…'}
          </p>
        </div>
        {rows?.length > 0 && <SmallBtn onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Download CSV</SmallBtn>}
      </div>
      {rows?.length === 0 && (
        <GlassCard className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>
          No replies yet. Share your link — replies and blessings will appear here, and you get an email for each one.
        </GlassCard>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {(rows || []).map((r) => (
          <GlassCard key={r._id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold" style={{ color: 'var(--surface-text)' }}>{r.name}</p>
                <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
                  <span className={r.attending === 'yes' ? 'text-emerald-500' : r.attending === 'no' ? 'text-red-500' : 'text-amber-500'}>{label[r.attending]}</span>
                  {` · ${r.guests} guest${r.guests > 1 ? 's' : ''}`}
                  {r.phone && <> · <a href={`tel:${r.phone}`} className="underline">{r.phone}</a></>}
                  {r.email && <> · {r.email}</>}
                </p>
              </div>
              <span className="shrink-0 text-[11px]" style={{ color: 'var(--surface-text-2)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            {r.message && <p className={`mt-2 text-sm italic ${r.hidden ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--surface-text)' }}>“{r.message}”</p>}
            <div className="mt-3 flex gap-2">
              {r.message && <SmallBtn onClick={() => toggle(r)}>{r.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{r.hidden ? 'Show on invite' : 'Hide from invite'}</SmallBtn>}
              <SmallBtn danger onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5" /></SmallBtn>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

