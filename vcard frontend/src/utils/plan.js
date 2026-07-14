import { useEffect, useState } from 'react';
import axios from 'axios';

export const PLANS = {
  DIGITAL: 'DIGITAL CARD',
  SMART_AI: 'SMART AI CARD',
  AI_AGENT_PRO: 'AI AGENT PRO',
};

// Smart AI Card + AI Agent Pro: chatbot assistant to fill vCard details
export const CHAT_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Smart AI Card + AI Agent Pro: voice assistant to fill vCard details
export const VOICE_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

export const hasChatFill = (plan) => CHAT_FILL_PLANS.includes(plan);
export const hasVoiceFill = (plan) => VOICE_FILL_PLANS.includes(plan);

// Fetches the logged-in user's plan for pages that need to gate a single
// feature (e.g. the voice-fill button) without pulling in the full dashboard layout.
export const usePlan = () => {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    let active = true;
    axios.get(`${import.meta.env.VITE_API_URL}/api/stats`, {
      headers: { 'x-auth-token': localStorage.getItem('token') },
    }).then(res => { if (active) setPlan(res.data?.user?.plan || res.data?.currentPlan || null); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return plan;
};
