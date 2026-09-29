import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Plus, X, Clapperboard, Users, BarChart3, Sparkles, Briefcase, Clock, Languages, Award, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';
import { reelInfo } from '../../webcard/cardData';
import { ReelMedia } from '../../webcard/dc-runtime';

const API = import.meta.env.VITE_API_URL;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const EMPTY = { followers: [], stats: [], skills: [], languages: [], brands: [], experience: [], timings: [], reels: [] };

const inputCls = 'w-full min-w-0 px-3 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400';
const inputStyle = { background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' };

const Section = ({ icon: Icon, title, hint, delay = 0, children }) => (
  <GlassCard {...fadeUp(delay)} className="p-5 sm:p-6">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>
          {hint}
        </p>
      </div>
    </div>
    {children}
  </GlassCard>
);

// Editable list of small records (one row of inputs per record).
const RowList = ({ rows, fields, onChange, addLabel, max = 10 }) => {
  const set = (i, key, value) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2 items-center">
          {fields.map((f) => (
            <input
              key={f.key}
              value={r[f.key] || ''}
              onChange={(e) => set(i, f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputCls}
              style={{ ...inputStyle, flex: f.flex || 1 }}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            title="Remove"
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer hover:text-red-500"
            style={{ color: 'var(--surface-text-2)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, Object.fromEntries(fields.map((f) => [f.key, '']))])}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      )}
    </div>
  );
};

// Chips for simple word lists (skills, languages, brands).
const TagList = ({ values, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (parts.length) onChange([...values, ...parts.filter((p) => !values.includes(p))]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--surface-text)', border: '1px solid var(--surface-border)' }}
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="cursor-pointer opacity-60 hover:opacity-100"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={inputCls}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 px-3 rounded-lg text-xs font-semibold text-white bg-brand-600 cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const Highlights = () => {
  const [extras, setExtras] = useState(EMPTY);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/api/vcard/me`, { headers: headers() })
      .then(({ data }) => {
        setSlug(data.username || '');
        setExtras({ ...EMPTY, ...(data.extras || {}) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (value) => setExtras((x) => ({ ...x, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(`${API}/api/vcard`, { extras }, { headers: headers() });
      // An outdated backend silently drops unknown fields; don't claim success then.
      if (!data.card?.extras) {
        toast.error('Server did not save these fields. Please restart / redeploy the backend and try again.');
        return;
      }
      setExtras({ ...EMPTY, ...data.card.extras });
      window.dispatchEvent(new Event('vcard:data-changed'));
      toast.success('Highlights saved!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-3xl space-y-5">
        <div className="h-14 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
        <div className="h-56 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-5 pb-16">
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl">
        <MeshBackground className="opacity-40" />
        <div className="relative py-1 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>
              Highlights & Reels
            </h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>
              Reels, follower counts, stats and more. Each template shows the parts it was designed for.
            </p>
          </div>
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
            >
              View card <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </motion.div>

      <Section
        icon={Clapperboard}
        title="Reels"
        hint="Paste Instagram, Facebook or YouTube reel links (or a direct .mp4). They play right on your card."
        delay={0.04}
      >
        <RowList
          rows={extras.reels}
          onChange={set('reels')}
          max={20}
          addLabel="Add reel"
          fields={[
            { key: 'url', placeholder: 'https://www.instagram.com/reel/…', flex: 3 },
            { key: 'title', placeholder: 'Title (optional)', flex: 2 },
          ]}
        />
        {extras.reels.some((r) => r.url) && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {extras.reels
              .filter((r) => /^https?:\/\//i.test(r.url || ''))
              .map((r, i) => {
                const info = reelInfo(r.url, r.title);
                return (
                  <div key={`${r.url}-${i}`} className="shrink-0 w-36">
                    <div className="relative w-36 aspect-[9/16] rounded-xl overflow-hidden bg-slate-900">
                      <ReelMedia reel={info} openable={false} />
                      {info.kind === 'external' && (
                        <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-[11px] text-white/80">
                          This link can’t play inline; visitors will open it in a new tab.
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold truncate" style={{ color: 'var(--surface-text)' }}>
                      {info.platform}
                      {r.title ? ` · ${r.title}` : ''}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </Section>

      <Section icon={Users} title="Followers" hint="Shown as badges on templates like Creator Reel (e.g. Instagram · 248K)." delay={0.06}>
        <RowList
          rows={extras.followers}
          onChange={set('followers')}
          max={10}
          addLabel="Add platform"
          fields={[
            { key: 'platform', placeholder: 'Instagram', flex: 2 },
            { key: 'count', placeholder: '248K', flex: 1 },
            { key: 'url', placeholder: 'Profile link (optional)', flex: 3 },
          ]}
        />
      </Section>

      <Section icon={BarChart3} title="Stats" hint="Up to 3 look best, e.g. 10+ Years · 250+ Projects · 120+ Clients." delay={0.08}>
        <RowList
          rows={extras.stats}
          onChange={set('stats')}
          max={6}
          addLabel="Add stat"
          fields={[
            { key: 'value', placeholder: '10+', flex: 1 },
            { key: 'label', placeholder: 'Years', flex: 2 },
          ]}
        />
      </Section>

      <Section icon={Sparkles} title="Skills" hint="Type and press Enter (or separate with commas)." delay={0.1}>
        <TagList values={extras.skills} onChange={set('skills')} placeholder="React, Interior design, SEO…" />
      </Section>

      <Section icon={Languages} title="Languages" hint="Languages you speak." delay={0.12}>
        <TagList values={extras.languages} onChange={set('languages')} placeholder="English, Hindi…" />
      </Section>

      <Section icon={Award} title="Brands you've worked with" hint="Shown as a logo wall on Creator Reel." delay={0.14}>
        <TagList values={extras.brands} onChange={set('brands')} placeholder="Brand name…" />
      </Section>

      <Section icon={Briefcase} title="Experience" hint="Shown as a timeline on Split Hero Corporate." delay={0.16}>
        <RowList
          rows={extras.experience}
          onChange={set('experience')}
          max={15}
          addLabel="Add role"
          fields={[
            { key: 'years', placeholder: '2019 – Present', flex: 2 },
            { key: 'role', placeholder: 'Senior Designer', flex: 2 },
            { key: 'org', placeholder: 'Company · City', flex: 2 },
          ]}
        />
      </Section>

      <Section icon={Clock} title="Timings" hint="Business hours, shown on Soft Bento Wellness." delay={0.18}>
        <RowList
          rows={extras.timings}
          onChange={set('timings')}
          max={10}
          addLabel="Add timing"
          fields={[
            { key: 'day', placeholder: 'Mon – Fri', flex: 1 },
            { key: 'hours', placeholder: '10 AM – 7 PM', flex: 1 },
          ]}
        />
      </Section>

      <div className="flex justify-end">
        <div className="w-full sm:w-56">
          <GradientButton onClick={handleSave} disabled={saving} loading={saving}>
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving…' : 'Save Highlights'}</span>
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default Highlights;
