import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bot, Plus, Trash2, Save, Lock, Sparkles, Check, Video, Copy, ExternalLink, ShieldCheck, BookOpen, Briefcase, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hasChatFill } from '../../utils/plan';
import { getVideoRoomUrl } from '../../utils/videoRoom';
import GlassCard from '../../components/ui/GlassCard';
import Toggle from '../../components/ui/Toggle';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';
import { plans as pricingPlans, featureSections } from '../../data/plans.jsx';

// The two AI-capable plans' unique features, for the "what do I get" breakdown shown to locked-plan users.
const aiPlans = pricingPlans.filter(p => p.id !== 'digital-id');
const aiFeatureKeys = featureSections.filter(s => s.highlight).flatMap(s => s.features);

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const AiPersona = () => {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [form, setForm] = useState({
    enabled: true,
    aiName: 'AI Assistant',
    tone: 'friendly',
    greeting: 'Hi! How can I help you today?',
    aboutText: '',
    faqs: [],
    knowledge: [],
    niche: 'general',
    consultingMode: false,
    blockedTopics: [],
    offer: { title: '', cta: '', url: '' },
    npsEnabled: true,
  });
  const [niches, setNiches] = useState([]);
  const [dpaAcceptedAt, setDpaAcceptedAt] = useState(null);
  const [acceptDpa, setAcceptDpa] = useState(false);
  const [topicDraft, setTopicDraft] = useState('');

  useEffect(() => {
  const load = async () => {
    try {
      // Dono APIs ko alag-alag call karein aur unke individual errors yahi catch kar lein
      const fetchStats = axios.get(`${API}/stats`, { headers: headers() }).catch(err => {
        console.error('Stats API Error:', err);
        return null;
      });
      
      const fetchPersona = axios.get(`${API}/ai/persona`, { headers: headers() }).catch(err => {
        console.error('Persona API Error:', err);
        return null; // Agar persona nahi hai, toh fail hone dein bina poora function roke
      });

      const fetchNiches = axios.get(`${API}/ai/niches`).catch(() => null);
      const [statsRes, personaRes, nichesRes] = await Promise.all([fetchStats, fetchPersona, fetchNiches]);
      if (nichesRes?.data) setNiches(nichesRes.data);

      // 1. Set Plan (agar statsRes success hua)
      if (statsRes && statsRes.data) {
        // Ek bar console log karke check kar lein ki data ka structure kya hai
        console.log('Stats Data:', statsRes.data); 
        setPlan(statsRes.data?.user?.plan || statsRes.data?.plan || '');
        setCardId(statsRes.data?.cardId || null);
      }

      // 2. Set Persona Form (agar personaRes success hua)
      if (personaRes && personaRes.data) {
        console.log('Loaded AI Persona:', personaRes.data);
        if (personaRes.data?._id) {
          setForm({
            enabled:   personaRes.data.enabled ?? true,
            aiName:    personaRes.data.aiName   || 'AI Assistant',
            tone:      personaRes.data.tone     || 'friendly',
            greeting:  personaRes.data.greeting || 'Hi! How can I help you today?',
            aboutText: personaRes.data.aboutText || '',
            faqs:      personaRes.data.faqs     || [],
            knowledge: personaRes.data.knowledge || [],
            niche:     personaRes.data.niche || 'general',
            consultingMode: !!personaRes.data.consultingMode,
            blockedTopics:  personaRes.data.blockedTopics || [],
            offer:     { title: '', cta: '', url: '', ...(personaRes.data.offer || {}) },
            npsEnabled: personaRes.data.npsEnabled !== false,
          });
          setDpaAcceptedAt(personaRes.data.dpaAcceptedAt || null);
        }
      }

    } catch (error) {
      console.error('Unexpected Load Error:', error);
    } finally { 
      setLoading(false); 
    }
  };
  
  load();
}, []);

  const addFaq = () => setForm(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }));
  const removeFaq = (i) => setForm(f => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));
  const updateFaq = (i, field, val) => setForm(f => {
    const faqs = [...f.faqs];
    faqs[i] = { ...faqs[i], [field]: val };
    return { ...f, faqs };
  });

  const addKnowledge = () => setForm(f => ({ ...f, knowledge: [...f.knowledge, { title: '', content: '' }] }));
  const removeKnowledge = (i) => setForm(f => ({ ...f, knowledge: f.knowledge.filter((_, idx) => idx !== i) }));
  const updateKnowledge = (i, field, val) => setForm(f => {
    const knowledge = [...f.knowledge];
    knowledge[i] = { ...knowledge[i], [field]: val };
    return { ...f, knowledge };
  });
  const addTopics = () => {
    const words = topicDraft.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length >= 3);
    if (!words.length) return;
    setForm(f => ({ ...f, blockedTopics: [...new Set([...f.blockedTopics, ...words])].slice(0, 30) }));
    setTopicDraft('');
  };
  const setOffer = (k, v) => setForm(f => ({ ...f, offer: { ...f.offer, [k]: v } }));
  const niche = niches.find(n => n.id === form.niche) || niches[0];

  const videoRoomUrl = cardId ? getVideoRoomUrl(cardId) : null;
  const handleCopyRoomLink = () => {
    if (!videoRoomUrl) return;
    navigator.clipboard.writeText(videoRoomUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API}/ai/persona`, { ...form, acceptDpa }, { headers: headers() });
      if (res.data?.persona?.dpaAcceptedAt) setDpaAcceptedAt(res.data.persona.dpaAcceptedAt);
      toast.success('AI Persona saved!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>;

  if (!hasChatFill(plan)) {
    return (
      <div className="max-w-lg space-y-5">
        <motion.div {...fadeUp(0)} className="relative rounded-2xl overflow-hidden p-8 text-center">
          <MeshBackground className="opacity-40" />
          <div className="relative space-y-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--surface-2)' }}>
              <Lock className="w-6 h-6" style={{ color: 'var(--surface-text-2)' }} />
            </div>
            <h2 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>AI Features Locked</h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Here's exactly what you unlock by upgrading:</p>
          </div>
        </motion.div>

        <GlassCard {...fadeUp(0.1)} className="p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {aiPlans.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface-2)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center shrink-0">
                    {p.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate" style={{ color: 'var(--surface-text)' }}>{p.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--surface-text-2)' }}>₹{p.price.monthly}/mo</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {aiFeatureKeys.filter(f => p.features[f.key] === true).map(f => (
                    <li key={f.key} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-5">
            <div className="w-full sm:w-56 mx-auto">
              <GradientButton onClick={() => window.location.assign('/dashboard/plans')}>
                <Sparkles className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </GradientButton>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative rounded-2xl overflow-hidden">
        <MeshBackground className="opacity-30" />
        <motion.div {...fadeUp(0)} className="relative flex items-center justify-between p-1">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--surface-text)' }}>
              <Bot className="w-5 h-5" />
              <span>AI Agent</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Your live, plan-enabled assistant for visitors on your public card</p>
          </div>
          <motion.div
            key={form.enabled}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${form.enabled ? 'bg-green-500/15 text-green-500' : ''}`}
            style={!form.enabled ? { background: 'var(--surface-2)', color: 'var(--surface-text-2)' } : undefined}
          >
            {form.enabled ? 'AI ON' : 'AI OFF'}
          </motion.div>
        </motion.div>
      </div>

      {/* Enable toggle */}
      <GlassCard {...fadeUp(0.05)} className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>Enable AI Chat on vCard</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>Show chat bubble to visitors on your public card. Save changes to apply.</p>
        </div>
        <Toggle
          checked={form.enabled}
          onChange={(val) => setForm(f => ({ ...f, enabled: val }))}
          aria-label="Enable AI Agent on vCard"
        />
      </GlassCard>

      {/* Instant video call room */}
      <GlassCard {...fadeUp(0.06)} className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
            <Video className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>Instant Video Call Room</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>
              Visitors get a "Video Call" button next to the chat bubble on your card. It opens this same free room — join it whenever you want to take a call. Shown/hidden together with the toggle above.
            </p>
            {videoRoomUrl ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(videoRoomUrl, '_blank', 'noopener,noreferrer')}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Join My Room
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyRoomLink}
                  leftIcon={linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            ) : (
              <p className="text-xs mt-2 italic" style={{ color: 'var(--surface-text-2)' }}>Create your vCard profile first to get a room link.</p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard {...fadeUp(0.08)} className="p-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><Sparkles className="w-4 h-4 text-brand-600" />AI can answer</p>
        <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>It uses your published card information and the knowledge you provide below.</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--surface-text-2)' }}>
          {['Your profile, bio, and contact links', 'Products, services, and portfolio', 'Your configured FAQs and about text', 'Questions supported by your public vCard'].map(item => <div key={item} className="flex gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />{item}</div>)}
        </div>
      </GlassCard>

      {/* Profession preset (constants/niches.json on the server) */}
      <GlassCard {...fadeUp(0.09)} className="p-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><Briefcase className="w-4 h-4 text-brand-600" />Your profession</p>
        <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Tunes how the AI talks, what it must never do, the suggested questions and the default final offer.</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {niches.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, niche: n.id }))}
              className={`rounded-xl border-2 px-3 py-2 text-left text-xs font-semibold fast-transition ${form.niche === n.id ? 'border-brand-600 bg-brand-600 text-white' : 'hover:border-brand-400'}`}
              style={form.niche !== n.id ? { borderColor: 'var(--surface-border)', color: 'var(--surface-text)' } : undefined}
            >
              {n.label}
            </button>
          ))}
        </div>
        {niche && (niche.disclaimer || niche.blocked.length > 0) && (
          <div className="mt-3 rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}>
            {niche.disclaimer && <p><strong style={{ color: 'var(--surface-text)' }}>Shown to visitors:</strong> {niche.disclaimer}</p>}
            {niche.blocked.length > 0 && <p><strong style={{ color: 'var(--surface-text)' }}>AI will refuse:</strong> {niche.blocked.join(' · ')}</p>}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl px-3 py-3" style={{ background: 'var(--surface-2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>Consulting mode</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>The AI asks 1–2 questions to understand the visitor's need, recommends your best-fit service, then invites them to your final offer.</p>
          </div>
          <Toggle checked={form.consultingMode} onChange={(val) => setForm(f => ({ ...f, consultingMode: val }))} aria-label="Consulting mode" />
        </div>
      </GlassCard>

      <GlassCard {...fadeUp(0.1)}>
        {/* AI Name */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>AI Assistant Name</label>
          <input
            value={form.aiName}
            onChange={e => setForm(f => ({ ...f, aiName: e.target.value }))}
            placeholder="e.g. Alex - John's Assistant"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--surface-text-2)' }}>This name appears in the chat header on your card</p>
        </div>

        {/* Tone */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>Conversation Tone</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'formal',   label: 'Formal',   desc: 'Professional & precise' },
              { id: 'friendly', label: 'Friendly',  desc: 'Warm & approachable' },
              { id: 'casual',   label: 'Casual',    desc: 'Relaxed & conversational' },
            ].map(t => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setForm(f => ({ ...f, tone: t.id }))}
                className={`p-3 rounded-xl border-2 text-left fast-transition ${form.tone === t.id ? 'border-brand-600 bg-brand-600 text-white' : 'hover:border-brand-400'}`}
                style={form.tone !== t.id ? { borderColor: 'var(--surface-border)' } : undefined}
              >
                <p className="text-xs font-bold" style={form.tone !== t.id ? { color: 'var(--surface-text)' } : undefined}>{t.label}</p>
                <p className={`text-[10px] mt-0.5 ${form.tone === t.id ? 'text-white/70' : ''}`} style={form.tone !== t.id ? { color: 'var(--surface-text-2)' } : undefined}>{t.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Greeting */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>Welcome Greeting</label>
          <input
            value={form.greeting}
            onChange={e => setForm(f => ({ ...f, greeting: e.target.value }))}
            placeholder="Hi! How can I help you today?"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--surface-text-2)' }}>First message visitors see when they open the chat</p>
        </div>

        {/* About Text */}
        <div className="p-5">
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>About You (AI Knowledge Base)</label>
          <textarea
            value={form.aboutText}
            onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))}
            rows={5}
            placeholder={`Tell the AI about yourself:\n- What services do you offer?\n- What are your working hours?\n- What areas do you serve?\n- What is your pricing range?\n- Any other info visitors commonly ask about`}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--surface-text-2)' }}>The AI will use this to answer visitor questions. More detail = better answers.</p>
        </div>
      </GlassCard>

      {/* FAQs */}
      <GlassCard {...fadeUp(0.15)} className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>FAQs</p>
            <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Pre-set Q&A pairs for accurate instant answers</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={addFaq}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add FAQ
          </Button>
        </div>

        <div>
          {form.faqs.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: 'var(--surface-text-2)' }}>No FAQs added yet. Click "Add FAQ" to create one.</p>
          )}
          <AnimatePresence>
            {form.faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--surface-border)' }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>FAQ #{i + 1}</span>
                    <IconButton variant="danger" title="Remove FAQ" onClick={() => removeFaq(i)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                  <input
                    value={faq.question}
                    onChange={e => updateFaq(i, 'question', e.target.value)}
                    placeholder="Question (e.g. What are your working hours?)"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  />
                  <textarea
                    value={faq.answer}
                    onChange={e => updateFaq(i, 'answer', e.target.value)}
                    placeholder="Answer (e.g. We are open Mon-Sat, 9 AM to 6 PM)"
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-brand-400 fast-transition"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Knowledge base */}
      <GlassCard {...fadeUp(0.16)} className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-2)' }}>
          <div>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><BookOpen className="w-4 h-4 text-brand-600" />Knowledge base</p>
            <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Longer notes the AI answers from: packages, process, policies, fees, areas served.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={addKnowledge} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add note</Button>
        </div>
        {form.knowledge.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--surface-text-2)' }}>No notes yet. Add up to 20.</p>
        )}
        {form.knowledge.map((k, i) => (
          <div key={i} className="p-5 space-y-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--surface-border)' }}>
            <div className="flex items-center gap-2">
              <input
                value={k.title}
                onChange={e => updateKnowledge(i, 'title', e.target.value)}
                maxLength={120}
                placeholder="Title (e.g. Consultation process)"
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              />
              <IconButton variant="danger" title="Remove note" onClick={() => removeKnowledge(i)}><Trash2 className="w-4 h-4" /></IconButton>
            </div>
            <textarea
              value={k.content}
              onChange={e => updateKnowledge(i, 'content', e.target.value)}
              maxLength={4000}
              rows={4}
              placeholder="Write what the AI should know. Plain sentences work best."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y focus:ring-2 focus:ring-brand-400 fast-transition"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
            />
          </div>
        ))}
      </GlassCard>

      {/* Guardrails */}
      <GlassCard {...fadeUp(0.17)} className="p-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><ShieldCheck className="w-4 h-4 text-brand-600" />Guardrails</p>
        <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Always on, for every card:</p>
        <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--surface-text-2)' }}>
          {[
            'Answers only about you and your card',
            'Ignores "ignore your instructions" tricks',
            'Never reveals its hidden instructions',
            'Stops visitors sharing Aadhaar, PAN or card numbers',
            'Self-harm messages get helpline numbers (Tele-MANAS 14416)',
            'No medical, legal or money advice for a visitor\'s own case',
            'Visitors must accept a notice before chatting',
            'Message limits per visitor to stop abuse',
          ].map(item => <div key={item} className="flex gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)' }}><Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />{item}</div>)}
        </div>
        <label className="block text-xs font-semibold mt-4 mb-2 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>Your blocked topics</label>
        <div className="flex gap-2">
          <input
            value={topicDraft}
            onChange={e => setTopicDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopics(); } }}
            placeholder="e.g. discount, competitor name, politics"
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <Button variant="secondary" size="sm" onClick={addTopics} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add</Button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--surface-text-2)' }}>If a visitor's message (or the AI's reply) contains one of these words, the AI politely refuses. Separate with commas.</p>
        {form.blockedTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.blockedTopics.map(w => (
              <span key={w} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--surface-text)' }}>
                {w}
                <button type="button" aria-label={`Remove ${w}`} onClick={() => setForm(f => ({ ...f, blockedTopics: f.blockedTopics.filter(x => x !== w) }))} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Funnel end: final offer + NPS */}
      <GlassCard {...fadeUp(0.18)} className="p-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><Target className="w-4 h-4 text-brand-600" />Final offer & feedback</p>
        <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>After a couple of questions, the chat shows your offer as a button. Then it asks the visitor for a 0–10 rating (NPS). Results are on the AI Insights page.</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <input
            value={form.offer.title}
            onChange={e => setOffer('title', e.target.value)}
            maxLength={80}
            placeholder={niche?.offer?.title ? `Offer (default: ${niche.offer.title})` : 'Offer, e.g. Free 15-min consultation'}
            className="rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <input
            value={form.offer.cta}
            onChange={e => setOffer('cta', e.target.value)}
            maxLength={40}
            placeholder="Button text, e.g. Book now"
            className="rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
          <input
            value={form.offer.url}
            onChange={e => setOffer('url', e.target.value)}
            maxLength={500}
            placeholder="Link (booking page, Calendly, payment link). Empty = your WhatsApp"
            className="sm:col-span-2 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl px-3 py-3" style={{ background: 'var(--surface-2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>Ask for a rating (NPS)</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>"How likely are you to recommend me?" 0–10, with an optional comment.</p>
          </div>
          <Toggle checked={form.npsEnabled} onChange={(val) => setForm(f => ({ ...f, npsEnabled: val }))} aria-label="Ask for NPS rating" />
        </div>
      </GlassCard>

      {/* Data privacy + Data Processing Addendum */}
      <GlassCard {...fadeUp(0.19)} className="p-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}><Lock className="w-4 h-4 text-brand-600" />Data privacy (DPDP Act)</p>
        <ul className="mt-2 space-y-1.5 text-xs list-disc pl-4" style={{ color: 'var(--surface-text-2)' }}>
          <li>Replies come from Anthropic's Claude model through its business API. Under Anthropic's commercial terms, API conversations are not used to train its models.</li>
          <li>The AI only sees your published card, the notes above and the current chat. It has no access to your dashboard, enquiries or other visitors.</li>
          <li>We don't store chat text. We keep only counts, the offer click and the rating, for your insights.</li>
          <li>Visitors accept a notice before their first message, and a consent tick before sending an enquiry.</li>
        </ul>
        <p className="text-xs mt-2" style={{ color: 'var(--surface-text-2)' }}>
          Details: <Link to="/ai-data-privacy" target="_blank" className="underline">How the AI uses data</Link> · <Link to="/privacy-policy" target="_blank" className="underline">Privacy Policy</Link>
        </p>
        {dpaAcceptedAt ? (
          <p className="mt-3 text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Data Processing Addendum accepted on {new Date(dpaAcceptedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        ) : (
          <label className="mt-3 flex items-start gap-2.5 text-xs cursor-pointer rounded-xl px-3 py-3" style={{ background: 'var(--surface-2)', color: 'var(--surface-text)' }}>
            <input type="checkbox" checked={acceptDpa} onChange={e => setAcceptDpa(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#E70C65] cursor-pointer" />
            <span>
              I accept the <Link to="/data-processing-addendum" target="_blank" className="font-semibold underline">Data Processing Addendum</Link>. I am responsible for the visitor data my card collects, and Aicardly processes it on my behalf. Required to turn the AI on.
            </span>
          </label>
        )}
      </GlassCard>

      {/* How it works */}
      <GlassCard {...fadeUp(0.2)} className="p-5">
        <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--surface-text)' }}>How It Works</p>
        <div className="space-y-2">
          {[
            ['1', 'Visitor opens your public vCard and clicks the chat bubble'],
            ['2', 'They type a question — it goes to our AI'],
            ['3', 'AI reads your persona, about text & FAQs to craft an accurate reply'],
            ['4', 'Visitor gets an instant answer as if they\'re talking to your assistant'],
          ].map(([n, t]) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
              <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <div className="w-full sm:w-56">
          <GradientButton onClick={handleSave} disabled={saving}>
            {saving ? (
              <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save AI Persona'}</span>
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default AiPersona;
