import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bot, Plus, Trash2, Save, Lock, Sparkles, Check } from 'lucide-react';
import { hasChatFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
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

  const [form, setForm] = useState({
    enabled: true,
    aiName: 'AI Assistant',
    tone: 'friendly',
    greeting: 'Hi! How can I help you today?',
    aboutText: '',
    faqs: [],
  });

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

      const [statsRes, personaRes] = await Promise.all([fetchStats, fetchPersona]);

      // 1. Set Plan (agar statsRes success hua)
      if (statsRes && statsRes.data) {
        // Ek bar console log karke check kar lein ki data ka structure kya hai
        console.log('Stats Data:', statsRes.data); 
        setPlan(statsRes.data?.user?.plan || statsRes.data?.plan || ''); 
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
          });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/ai/persona`, form, { headers: headers() });
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
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--surface-text)' }}>
              <Bot className="w-5 h-5" />
              <span>AI Persona Setup</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Configure your AI assistant that talks to visitors on your card</p>
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
          <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>Show chat bubble to visitors on your public card</p>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
          className={`relative w-12 h-6 rounded-full fast-transition ${form.enabled ? 'bg-brand-600' : ''}`}
          style={!form.enabled ? { background: 'var(--surface-2)' } : undefined}
        >
          <motion.span
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
            animate={{ x: form.enabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
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
