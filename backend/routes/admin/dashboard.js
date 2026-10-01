// /api/admin/dashboard?days=7|30|90 — everything at a glance: growth, money, the order funnel,
// AI, leads, top cards, recent activity and system health. Days are counted in IST.
const express = require('express');
const User = require('../../models/User');
const vCard = require('../../models/vCard');
const CardOrder = require('../../models/CardOrder');
const Transaction = require('../../models/Transaction');
const SupportTicket = require('../../models/SupportTicket');
const AdminAuditLog = require('../../models/AdminAuditLog');
const ChatSession = require('../../models/ChatSession');
const PlatformLead = require('../../models/PlatformLead');
const Enquiry = require('../../models/Enquiry');
const AiUsageLog = require('../../models/AiUsageLog');
const AppLog = require('../../models/AppLog');
const { CardPresence, CardDayView } = require('../../models/CardVisit');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z } = require('../../middleware/admin/validate');
const { can } = require('../../constants/adminPermissions');
const { isMailConfigured } = require('../../utils/mailer');
const { isWhatsAppConfigured } = require('../../utils/whatsapp');
const { isRazorpayConfigured } = require('../../utils/razorpay');

const router = express.Router();
const DAY = 24 * 60 * 60 * 1000;
const IST = 5.5 * 3600 * 1000;
const TZ = 'Asia/Kolkata';

// Midnight today in India.
function startOfTodayIST() {
  const ist = new Date(Date.now() + IST);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST);
}
const dayKey = (d) => new Date(new Date(d).getTime() + IST).toISOString().slice(0, 10);

const sumBy = (rows, key = 'n') => rows.reduce((a, r) => a + (r[key] || 0), 0);
const perDay = (Model, field, match, valueExpr = 1) =>
  Model.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${field}`, timezone: TZ } }, n: { $sum: valueExpr } } },
  ]);

router.get('/', requirePermission('dashboard.view'), validate({ query: z.object({ days: z.coerce.number().int().refine((d) => [7, 30, 90].includes(d), 'use 7, 30 or 90').default(30) }) }), async (req, res) => {
  const days = req.v.query.days;
  const now = new Date();
  const today = startOfTodayIST();
  const from = new Date(today.getTime() - (days - 1) * DAY);
  const prevFrom = new Date(from.getTime() - days * DAY);
  const inPeriod = { $gte: from };
  const inPrev = { $gte: prevFrom, $lt: from };
  const notRemoved = { deletedAt: null };
  const viewDays = Array.from({ length: days }, (_, i) => dayKey(from.getTime() + i * DAY));
  const prevViewDays = Array.from({ length: days }, (_, i) => dayKey(prevFrom.getTime() + i * DAY));

  const [
    usersTotal, usersBlocked, usersRemoved, newUsers, newUsersPrev, newToday,
    cardsTotal, newCards, newCardsPrev,
    signupsDaily, cardsDaily,
    cardPaidDaily, planPaidDaily, cardRevAll, planRevAll, cardRevPrev, planRevPrev,
    orderStatus, activePlans, planTiers,
    viewsDaily, viewsPrev, liveVisitors,
    chats, chatsPrev, chatsDaily, npsAgg,
    aiByRoute, aiCostPrev,
    cardyFeedback, leadsNew, leadsPeriod, leadsRecent, enquiries, enquiriesPrev,
    openTickets, stuckDeliveries, logLevels,
    recentUsers, recentOrders, recentTxns, recentAudit,
    usersWithCard, usersWithOrder, usersPaid, usersDelivered, topViews,
  ] = await Promise.all([
    User.countDocuments(notRemoved),
    User.countDocuments({ ...notRemoved, isBlocked: true }),
    User.countDocuments({ deletedAt: { $ne: null } }),
    User.countDocuments({ ...notRemoved, createdAt: inPeriod }),
    User.countDocuments({ ...notRemoved, createdAt: inPrev }),
    User.countDocuments({ ...notRemoved, createdAt: { $gte: today } }),
    vCard.countDocuments(),
    vCard.countDocuments({ createdAt: inPeriod }),
    vCard.countDocuments({ createdAt: inPrev }),
    perDay(User, 'createdAt', { createdAt: inPeriod }),
    perDay(vCard, 'createdAt', { createdAt: inPeriod }),
    perDay(CardOrder, 'paidAt', { status: 'PAID', paidAt: inPeriod }, { $divide: ['$amount', 100] }),
    perDay(Transaction, 'updatedAt', { status: 'completed', updatedAt: inPeriod }, '$amount'),
    CardOrder.aggregate([{ $match: { status: 'PAID' } }, { $group: { _id: null, n: { $sum: { $divide: ['$amount', 100] } } } }]),
    Transaction.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, n: { $sum: '$amount' } } }]),
    CardOrder.aggregate([{ $match: { status: 'PAID', paidAt: inPrev } }, { $group: { _id: null, n: { $sum: { $divide: ['$amount', 100] } } } }]),
    Transaction.aggregate([{ $match: { status: 'completed', updatedAt: inPrev } }, { $group: { _id: null, n: { $sum: '$amount' } } }]),
    CardOrder.aggregate([
      { $project: { s: { $cond: [{ $and: [{ $eq: ['$status', 'PENDING_PAYMENT'] }, { $lte: ['$expiresAt', now] }] }, 'EXPIRED', '$status'] } } },
      { $group: { _id: '$s', n: { $sum: 1 } } },
    ]),
    User.countDocuments({ ...notRemoved, plan: { $ne: 'Free Trial' }, planExpiry: { $gt: now } }),
    User.aggregate([{ $match: { ...notRemoved, plan: { $ne: 'Free Trial' }, planExpiry: { $gt: now } } }, { $group: { _id: '$plan', n: { $sum: 1 } } }]),
    CardDayView.aggregate([{ $match: { day: { $in: viewDays } } }, { $group: { _id: '$day', n: { $sum: '$count' } } }]),
    CardDayView.aggregate([{ $match: { day: { $in: prevViewDays } } }, { $group: { _id: null, n: { $sum: '$count' } } }]),
    CardPresence.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 60 * 1000) } }),
    ChatSession.aggregate([{ $match: { createdAt: inPeriod } }, { $group: { _id: null, sessions: { $sum: 1 }, messages: { $sum: '$messages' }, offers: { $sum: { $cond: ['$offerShown', 1, 0] } }, offerClicks: { $sum: { $cond: ['$offerClicked', 1, 0] } } } }]),
    ChatSession.countDocuments({ createdAt: inPrev }),
    perDay(ChatSession, 'createdAt', { createdAt: inPeriod }),
    ChatSession.aggregate([{ $match: { createdAt: inPeriod, nps: { $ne: null } } }, { $group: { _id: null, avg: { $avg: '$nps' }, n: { $sum: 1 }, promoters: { $sum: { $cond: [{ $gte: ['$nps', 9] }, 1, 0] } }, detractors: { $sum: { $cond: [{ $lte: ['$nps', 6] }, 1, 0] } } } }]),
    AiUsageLog.aggregate([{ $match: { createdAt: inPeriod } }, { $group: { _id: '$route', n: { $sum: 1 }, cost: { $sum: '$costUsd' } } }]),
    AiUsageLog.aggregate([{ $match: { createdAt: inPrev } }, { $group: { _id: null, cost: { $sum: '$costUsd' } } }]),
    AppLog.aggregate([{ $match: { type: 'cardy.feedback', createdAt: inPeriod } }, { $group: { _id: '$meta.rating', n: { $sum: 1 } } }]),
    PlatformLead.countDocuments({ status: 'new' }),
    PlatformLead.countDocuments({ createdAt: inPeriod }),
    PlatformLead.find().sort({ createdAt: -1 }).limit(5).select('name email phone businessName need status createdAt').lean(),
    Enquiry.countDocuments({ createdAt: inPeriod }),
    Enquiry.countDocuments({ createdAt: inPrev }),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
    CardOrder.countDocuments({ status: 'PAID', 'delivery.status': { $in: ['PENDING', 'FAILED'] } }),
    AppLog.aggregate([{ $match: { createdAt: { $gte: new Date(Date.now() - DAY) } } }, { $group: { _id: '$level', n: { $sum: 1 } } }]),
    User.find(notRemoved).sort({ createdAt: -1 }).limit(6).select('name email phone plan planExpiry createdAt').lean(),
    CardOrder.find({ status: 'PAID' }).sort({ paidAt: -1 }).limit(6).populate('user', 'name email').lean(),
    Transaction.find({ status: 'completed' }).sort({ updatedAt: -1 }).limit(6).populate('userId', 'name email').lean(),
    can(req.admin.role, 'audit.view') ? AdminAuditLog.find().sort({ createdAt: -1 }).limit(8).lean() : [],
    // Funnel, all time: each step counts people (not orders).
    vCard.distinct('userId').then((a) => a.length),
    CardOrder.distinct('user').then((a) => a.length),
    CardOrder.distinct('user', { status: 'PAID' }).then((a) => a.length),
    CardOrder.distinct('user', { status: 'PAID', 'delivery.status': { $in: ['SENT', 'DELIVERED', 'READ'] } }).then((a) => a.length),
    // Top cards by views in the period.
    CardDayView.aggregate([
      { $match: { day: { $in: viewDays } } },
      { $group: { _id: '$vcardId', n: { $sum: '$count' } } },
      { $sort: { n: -1 } },
      { $limit: 6 },
    ]),
  ]);
  const topCardDocs = await vCard.find({ _id: { $in: topViews.map((t) => t._id) } }).select('username personalInfo.name personalInfo.profilePic viewCount userId').lean();
  const cardById = Object.fromEntries(topCardDocs.map((c) => [String(c._id), c]));

  const series = (rows) => {
    const m = Object.fromEntries(rows.map((r) => [r._id, r.n]));
    return viewDays.map((d) => ({ date: d, value: Math.round((m[d] || 0) * 100) / 100 }));
  };
  const revenueDaily = (() => {
    const a = Object.fromEntries(cardPaidDaily.map((r) => [r._id, r.n]));
    const b = Object.fromEntries(planPaidDaily.map((r) => [r._id, r.n]));
    return viewDays.map((d) => ({ date: d, value: Math.round(((a[d] || 0) + (b[d] || 0)) * 100) / 100 }));
  })();
  const revenuePeriod = sumBy(revenueDaily, 'value');
  const revenuePrev = (cardRevPrev[0]?.n || 0) + (planRevPrev[0]?.n || 0);
  const views = series(viewsDaily);
  const statusCount = Object.fromEntries(orderStatus.map((o) => [o._id, o.n]));
  const chat = chats[0] || { sessions: 0, messages: 0, offers: 0, offerClicks: 0 };
  const nps = npsAgg[0];
  const aiCost = sumBy(aiByRoute, 'cost');
  const feedback = Object.fromEntries(cardyFeedback.map((f) => [f._id, f.n]));
  const levels = Object.fromEntries(logLevels.map((l) => [l._id, l.n]));

  res.json({
    period: { days, from, to: now },
    kpis: {
      users: { total: usersTotal, period: newUsers, prev: newUsersPrev, today: newToday, blocked: usersBlocked, removed: usersRemoved },
      cards: { total: cardsTotal, period: newCards, prev: newCardsPrev },
      revenue: { total: (cardRevAll[0]?.n || 0) + (planRevAll[0]?.n || 0), period: revenuePeriod, prev: revenuePrev },
      views: { period: sumBy(views, 'value'), prev: viewsPrev[0]?.n || 0, liveNow: liveVisitors },
      aiChats: { period: chat.sessions, prev: chatsPrev, messages: chat.messages },
      leads: { period: leadsPeriod + enquiries, prev: enquiriesPrev, newCardy: leadsNew },
      activePlans,
    },
    series: {
      signups: series(signupsDaily),
      cards: series(cardsDaily),
      revenue: revenueDaily,
      views,
      aiChats: series(chatsDaily),
    },
    funnel: [
      { key: 'signup', label: 'Signed up', value: usersTotal },
      { key: 'card', label: 'Created a card', value: usersWithCard },
      { key: 'link', label: 'Got a payment link', value: usersWithOrder },
      { key: 'paid', label: 'Paid', value: usersPaid },
      { key: 'delivered', label: 'Card delivered', value: usersDelivered },
    ],
    payments: {
      pending: statusCount.PENDING_PAYMENT || 0,
      paid: statusCount.PAID || 0,
      expired: statusCount.EXPIRED || 0,
      failed: (statusCount.FAILED || 0) + (statusCount.CANCELLED || 0),
    },
    plans: Object.fromEntries(planTiers.map((p) => [p._id, p.n])),
    ai: {
      cost: { period: aiCost, prev: aiCostPrev[0]?.cost || 0 },
      byFeature: aiByRoute.map((r) => ({ feature: r._id, requests: r.n, cost: r.cost })).sort((a, b) => b.requests - a.requests),
      cardChats: chat,
      nps: nps ? { avg: Math.round(nps.avg * 10) / 10, responses: nps.n, score: Math.round(((nps.promoters - nps.detractors) / nps.n) * 100) } : null,
      cardyFeedback: { up: feedback.up || 0, down: feedback.down || 0 },
    },
    leads: { cardyNew: leadsNew, cardyPeriod: leadsPeriod, cardEnquiries: enquiries, recent: leadsRecent },
    topCards: topViews.map((t) => {
      const c = cardById[String(t._id)] || {};
      return { id: String(t._id), username: c.username, name: c.personalInfo?.name || c.username, photo: c.personalInfo?.profilePic || '', views: t.n, totalViews: c.viewCount || 0, ownerId: c.userId ? String(c.userId) : '' };
    }),
    recent: {
      signups: recentUsers.map((u) => ({ id: String(u._id), name: u.name, email: u.email, plan: u.planExpiry && new Date(u.planExpiry) > now ? u.plan : 'Free Trial', at: u.createdAt })),
      payments: [
        ...recentOrders.map((o) => ({ id: String(o._id), kind: o.complimentary ? 'Free card' : 'Card', amount: o.amount / 100, user: o.user && { id: String(o.user._id), name: o.user.name, email: o.user.email }, at: o.paidAt })),
        ...recentTxns.map((t) => ({ id: String(t._id), kind: t.plan, amount: t.amount, user: t.userId && { id: String(t.userId._id), name: t.userId.name, email: t.userId.email }, at: t.updatedAt })),
      ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6),
      activity: recentAudit.map((a) => ({ id: String(a._id), action: a.action, summary: a.summary, adminEmail: a.adminEmail, success: a.success, createdAt: a.createdAt })),
    },
    health: {
      email: isMailConfigured(),
      whatsapp: isWhatsAppConfigured(),
      payments: isRazorpayConfigured(),
      errors24h: levels.error || 0,
      warnings24h: levels.warn || 0,
      openTickets,
      stuckDeliveries,
      unpaidLinks: statusCount.PENDING_PAYMENT || 0,
    },
  });
});

module.exports = router;
