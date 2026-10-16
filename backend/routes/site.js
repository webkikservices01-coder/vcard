// /api/site: what the public website reads from the admin panel's settings and content:
// metal card price, the announcement strip, support contact, the chatbot's welcome / booking
// link, and the published customer stories. Cached briefly by browsers and the CDN.
const express = require('express');
const SiteTestimonial = require('../models/SiteTestimonial');
const { getSettings } = require('../services/siteSettings');
const { COMPANY } = require('../constants/chatbotKnowledge');

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const [site, cardy] = await Promise.all([getSettings('site'), getSettings('cardy')]);
    const booking = cardy.bookingUrl === 'off' ? '' : cardy.bookingUrl || COMPANY.bookingUrl;
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json({
      metalCardPrice: site.metalCardPrice || 0,
      metalCardDelivery: site.metalCardDelivery,
      announcement: site.announcement?.active && site.announcement.text ? { text: site.announcement.text, link: site.announcement.link } : null,
      supportEmail: site.supportEmail,
      supportPhone: site.supportPhone,
      cardy: { enabled: cardy.enabled !== false, welcome: cardy.welcome || '', bookingUrl: booking },
    });
  } catch (err) {
    res.status(500).json({ msg: 'Could not load settings' });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const rows = await SiteTestimonial.find({ published: true, consent: true }).sort({ order: 1, createdAt: -1 }).limit(24).select('name role company quote rating photo cardLink').lean();
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.json({ testimonials: rows.map(({ _id, ...t }) => ({ id: String(_id), ...t })) });
  } catch (err) {
    res.status(500).json({ msg: 'Could not load testimonials' });
  }
});

module.exports = router;
