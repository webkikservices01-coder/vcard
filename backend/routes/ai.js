const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vCard = require('../models/vCard');
const User = require('../models/User');
const AiPersona = require('../models/AiPersona');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const CustomSection = require('../models/CustomSection');

const AI_PLANS = ['SMART AI CARD', 'AI AGENT PRO'];

const getCardId = async (userId) => {
  const card = await vCard.findOne({ userId });
  return card?._id;
};

// ─── Format a contact link as clickable markdown ──────────────────────────────
const fmtLink = (l) => {
  const raw = (l.url || '').trim();
  const label = l.title || l.fieldType;
  const num = raw.replace(/[^0-9+]/g, '');
  switch (l.fieldType) {
    case 'Mobile / Phone': return `📞 [${raw}](tel:${num})`;
    case 'WhatsApp':       return `💬 [WhatsApp](https://wa.me/${num})`;
    case 'Email':          return `📧 [${raw}](mailto:${raw})`;
    case 'Website':        return `🌐 [${label || raw}](${raw.startsWith('http') ? raw : 'https://' + raw})`;
    case 'LinkedIn':       return `🔗 [LinkedIn Profile](${raw.startsWith('http') ? raw : 'https://' + raw})`;
    case 'Instagram':      return `📸 [Instagram](${raw.startsWith('http') ? raw : 'https://instagram.com/' + raw.replace('@','')})`;
    case 'Facebook':       return `📘 [Facebook](${raw.startsWith('http') ? raw : 'https://' + raw})`;
    case 'YouTube':        return `▶️ [YouTube](${raw.startsWith('http') ? raw : 'https://' + raw})`;
    case 'Twitter':        return `🐦 [Twitter](${raw.startsWith('http') ? raw : 'https://twitter.com/' + raw.replace('@','')})`;
    case 'Location':       return `📍 [View on Map](https://maps.google.com/?q=${encodeURIComponent(raw)})`;
    default:               return `🔗 [${label}](${raw.startsWith('http') ? raw : 'https://' + raw})`;
  }
};

// ─── Build rich system prompt from ALL vCard data ─────────────────────────────
const buildSystemPrompt = (persona, card, products, portfolio, testimonials, gallery, customSections) => {
  const p = card.personalInfo || {};
  const links = card.dynamicLinks || [];
  const ownerFirst = p.name?.split(' ')[0] || 'them';
  const toneDesc = { formal: 'professional and formal', friendly: 'warm and friendly', casual: 'casual and conversational' };

  const sections = [];

  // About
  sections.push(`=== ABOUT ${p.name || 'the Owner'} ===
Role: ${p.designation || 'Professional'}
${p.bio ? `Bio: ${p.bio}` : ''}
${persona.aboutText ? `\nExtra Info:\n${persona.aboutText}` : ''}`);

  // Contact — ALL formatted as clickable markdown links
  if (links.length > 0) {
    sections.push(`=== CONTACT & SOCIAL LINKS ===
${links.map(fmtLink).join('\n')}

IMPORTANT: When sharing contact info, ALWAYS use the exact markdown format above so links are clickable. Never write a raw URL — always wrap it as [label](url).`);
  }

  // Products
  if (products.length > 0) {
    const items = products.map((item, i) => {
      let block = `${i + 1}. **${item.title}**`;
      if (item.description) block += `\n   ${item.description}`;
      if (item.price) block += `\n   💰 Price: ₹${item.price}`;
      if (item.link) block += `\n   🛒 [Buy / View Details](${item.link})`;
      if (item.coverImage) block += `\n   ![${item.title}](${item.coverImage})`;
      return block;
    }).join('\n\n');
    sections.push(`=== PRODUCTS & SERVICES (${products.length}) ===\n${items}`);
  }

  // Portfolio
  if (portfolio.length > 0) {
    const items = portfolio.map((item, i) => {
      let block = `${i + 1}. **${item.title}**`;
      if (item.description) block += `\n   ${item.description}`;
      if (item.url) block += `\n   🔗 [View Project](${item.url})`;
      if (item.coverImage) block += `\n   ![${item.title}](${item.coverImage})`;
      return block;
    }).join('\n\n');
    sections.push(`=== PORTFOLIO / PROJECTS (${portfolio.length}) ===\n${items}`);
  }

  // Gallery
  if (gallery.length > 0) {
    const imgs = gallery.filter(g => g.type === 'image').map(g => `![work](${g.url})`).join('\n');
    const vids = gallery.filter(g => g.type === 'video').map(g => `▶️ [Watch Video](${g.url})`).join('\n');
    if (imgs || vids) sections.push(`=== GALLERY / WORK SAMPLES ===\n${imgs}\n${vids}`);
  }

  // Testimonials
  if (testimonials.length > 0) {
    const reviews = testimonials.map(t =>
      `⭐ ${'★'.repeat(t.rating || 5)} — "${t.review}" — *${t.name}*`
    ).join('\n');
    sections.push(`=== CLIENT REVIEWS ===\n${reviews}`);
  }

  // Custom sections
  if (customSections.length > 0) {
    sections.push(`=== ADDITIONAL INFO ===\n${customSections.map(c => `**${c.title}**\n${c.content}`).join('\n\n')}`);
  }

  // FAQs
  if (persona.faqs?.length > 0) {
    sections.push(`=== FAQs ===\n${persona.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`);
  }

  return `You are ${persona.aiName || 'an AI assistant'} for ${p.name || 'this professional'}'s digital card.

${sections.join('\n\n')}

=== BEHAVIOUR ===
Tone: ${toneDesc[persona.tone] || 'warm and friendly'}

- Answer only what the visitor asks. Do not volunteer unsolicited information.
- Keep replies short and to the point.
- When sharing a link, use markdown format: [label](url). Never write a bare URL.
- When showing an image use: ![title](imageUrl)
- If you don't have the answer, say so simply. Do not add calls to action or redirect suggestions.
- Never make up facts, prices, or contact details not listed above.`;
};

// ─── GET /api/ai/persona ──────────────────────────────────────────────────────
router.get('/persona', auth, async (req, res) => {
  try {
    const vcardId = await getCardId(req.user.userId);
    if (!vcardId) return res.status(404).json({ msg: 'vCard not found' });
    const persona = await AiPersona.findOne({ vcardId }) || {};
    res.json(persona);
  } catch (err) { res.status(500).send('Server Error'); }
});

// ─── POST /api/ai/persona ─────────────────────────────────────────────────────
router.post('/persona', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!AI_PLANS.includes(user.plan)) {
      return res.status(403).json({ msg: 'Upgrade to Smart AI Card or AI Agent Pro to use AI features.' });
    }
    const vcardId = await getCardId(req.user.userId);
    if (!vcardId) return res.status(404).json({ msg: 'Create a vCard profile first.' });

    const { enabled, aiName, tone, greeting, aboutText, faqs } = req.body;
    const persona = await AiPersona.findOneAndUpdate(
      { vcardId },
      { $set: { enabled, aiName, tone, greeting, aboutText, faqs } },
      { new: true, upsert: true }
    );
    res.json({ msg: 'AI persona saved!', persona });
  } catch (err) { res.status(500).send('Server Error'); }
});

// ─── POST /api/ai/chat/:username ──────────────────────────────────────────────
router.post('/chat/:username', async (req, res) => {
  try {
    const card = await vCard.findOne({ username: req.params.username });
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    const owner = await User.findById(card.userId);
    if (!AI_PLANS.includes(owner?.plan)) {
      return res.status(403).json({ msg: 'AI chat is not enabled for this card.' });
    }

    const persona = await AiPersona.findOne({ vcardId: card._id });
    if (!persona || !persona.enabled) {
      return res.status(403).json({ msg: 'AI chat is disabled for this card.' });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ msg: 'AI service not configured yet.' });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ msg: 'Messages required' });
    }

    // Fetch ALL vCard data in parallel
    const [products, portfolio, testimonials, gallery, customSections] = await Promise.all([
      Product.find({ vcardId: card._id }).sort('order'),
      Portfolio.find({ vcardId: card._id }).sort('order'),
      Testimonial.find({ vcardId: card._id }),
      Gallery.find({ vcardId: card._id }).sort('order'),
      CustomSection.find({ vcardId: card._id }).sort('order'),
    ]);

    const systemPrompt = buildSystemPrompt(persona, card, products, portfolio, testimonials, gallery, customSections);

    const useGroq = !!process.env.GROQ_API_KEY;
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey,
      ...(useGroq ? { baseURL: 'https://api.groq.com/openai/v1' } : {})
    });
    const model = useGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10)
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ msg: 'AI response failed. Please try again.' });
  }
});

// ─── GET /api/ai/public/:username ─────────────────────────────────────────────
router.get('/public/:username', async (req, res) => {
  try {
    const card = await vCard.findOne({ username: req.params.username });
    if (!card) return res.json({ enabled: false });

    const owner = await User.findById(card.userId);
    if (!AI_PLANS.includes(owner?.plan)) return res.json({ enabled: false });

    const persona = await AiPersona.findOne({ vcardId: card._id });
    if (!persona || !persona.enabled) return res.json({ enabled: false });

    res.json({ enabled: true, aiName: persona.aiName, greeting: persona.greeting });
  } catch {
    res.json({ enabled: false });
  }
});

module.exports = router;
