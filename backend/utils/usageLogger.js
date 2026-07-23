const AiUsageLog = require('../models/AiUsageLog');

// Claude Sonnet 5 introductory pricing, valid through 2026-08-31 (standard rate after: $3/$15 per MTok).
const PRICE_PER_MTOK_INPUT = 2.00;
const PRICE_PER_MTOK_OUTPUT = 10.00;

const computeCostUsd = (inputTokens, outputTokens) =>
  (inputTokens / 1_000_000) * PRICE_PER_MTOK_INPUT +
  (outputTokens / 1_000_000) * PRICE_PER_MTOK_OUTPUT;

// Fire-and-forget: usage logging must never break the chat/jarvis/voice-fill response.
const logUsage = ({ route, userId, vcardId, model, usage }) => {
  const inputTokens = usage?.input_tokens || 0;
  const outputTokens = usage?.output_tokens || 0;
  AiUsageLog.create({
    route,
    userId,
    vcardId,
    model,
    inputTokens,
    outputTokens,
    costUsd: computeCostUsd(inputTokens, outputTokens),
  }).catch(err => console.error('AI usage log error:', err.message));
};

module.exports = { logUsage, computeCostUsd };
