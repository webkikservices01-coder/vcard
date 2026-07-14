import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bot, Plus, Trash2, Save, Lock } from 'lucide-react';
import { hasChatFill } from '../../utils/plan';

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

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>;

  if (!hasChatFill(plan)) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-lg">
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14, delay: 0.1 }}
            className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto"
          >
            <Lock className="w-8 h-8" />
          </motion.div>
          <h2 className="text-xl font-black">AI Features Locked</h2>
          <p className="text-gray-400 text-sm">
            AI Chat Widget, Persona Config and AI Avatar are available on
            <strong className="text-white"> Smart AI Card</strong> and
            <strong className="text-white"> AI Agent Pro</strong> plans.
          </p>
          <motion.a
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            href="/dashboard/plans"
            className="inline-block bg-white text-pink-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition"
          >
            Upgrade Plan →
          </motion.a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>AI Persona Setup</span>
          </h2>
          <p className="text-sm text-gray-500">Configure your AI assistant that talks to visitors on your card</p>
        </div>
        <motion.div
          key={form.enabled}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
          className={`px-3 py-1 rounded-full text-xs font-bold ${form.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {form.enabled ? 'AI ON' : 'AI OFF'}
        </motion.div>
      </motion.div>

      {/* Enable toggle */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Enable AI Chat on vCard</p>
          <p className="text-xs text-gray-500 mt-0.5">Show chat bubble to visitors on your public card</p>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.enabled ? 'bg-pink-600' : 'bg-gray-200'}`}
        >
          <motion.span
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
            animate={{ x: form.enabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {/* AI Name */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">AI Assistant Name</label>
          <input
            value={form.aiName}
            onChange={e => setForm(f => ({ ...f, aiName: e.target.value }))}
            placeholder="e.g. Alex - John's Assistant"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">This name appears in the chat header on your card</p>
        </div>

        {/* Tone */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Conversation Tone</label>
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
                className={`p-3 rounded-xl border-2 text-left transition-colors ${form.tone === t.id ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <p className="text-xs font-bold">{t.label}</p>
                <p className={`text-[10px] mt-0.5 ${form.tone === t.id ? 'text-gray-300' : 'text-gray-500'}`}>{t.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Greeting */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Welcome Greeting</label>
          <input
            value={form.greeting}
            onChange={e => setForm(f => ({ ...f, greeting: e.target.value }))}
            placeholder="Hi! How can I help you today?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">First message visitors see when they open the chat</p>
        </div>

        {/* About Text */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">About You (AI Knowledge Base)</label>
          <textarea
            value={form.aboutText}
            onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))}
            rows={5}
            placeholder={`Tell the AI about yourself:\n- What services do you offer?\n- What are your working hours?\n- What areas do you serve?\n- What is your pricing range?\n- Any other info visitors commonly ask about`}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">The AI will use this to answer visitor questions. More detail = better answers.</p>
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">FAQs</p>
            <p className="text-xs text-gray-500">Pre-set Q&A pairs for accurate instant answers</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={addFaq}
            className="flex items-center space-x-1.5 bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-pink-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </motion.button>
        </div>

        <div className="divide-y divide-gray-100">
          {form.faqs.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">No FAQs added yet. Click "Add FAQ" to create one.</p>
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
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">FAQ #{i + 1}</span>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => removeFaq(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <input
                    value={faq.question}
                    onChange={e => updateFaq(i, 'question', e.target.value)}
                    placeholder="Question (e.g. What are your working hours?)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={e => updateFaq(i, 'answer', e.target.value)}
                    placeholder="Answer (e.g. We are open Mon-Sat, 9 AM to 6 PM)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">How It Works</p>
        <div className="space-y-2">
          {[
            ['1', 'Visitor opens your public vCard and clicks the chat bubble'],
            ['2', 'They type a question — it goes to our AI'],
            ['3', 'AI reads your persona, about text & FAQs to craft an accurate reply'],
            ['4', 'Visitor gets an instant answer as if they\'re talking to your assistant'],
          ].map(([n, t]) => (
            <div key={n} className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
              <p className="text-xs text-gray-600">{t}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-pink-700 transition disabled:opacity-60"
        >
          {saving ? (
            <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save AI Persona'}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default AiPersona;
