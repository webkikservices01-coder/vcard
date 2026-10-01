// Cardy's saved chats, kept in this browser only (localStorage): the chat survives a reload, and
// earlier chats can be reopened from the history panel. Nothing here is sent anywhere.
const KEY = 'aicardly_cardy_chats_v1';
const ACTIVE_KEY = 'aicardly_cardy_active_v1';
const MAX_CHATS = 30;
const MAX_MESSAGES = 80;

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage full or blocked: the chat still works, it just isn't saved */
  }
};

// Only what can be shown again later: text answers and plan recommendations.
const keepable = (m) => m && (m.type === 'text' || m.type === 'recommendation') && typeof m.content === 'string';

export const loadChats = () => (Array.isArray(read(KEY, [])) ? read(KEY, []) : []).filter((c) => c && c.id && Array.isArray(c.messages));

export const saveChats = (chats) => {
  const sorted = [...chats].sort((a, b) => (b.pinned - a.pinned) || b.updatedAt - a.updatedAt);
  write(KEY, sorted.slice(0, MAX_CHATS).map((c) => ({ ...c, messages: c.messages.filter(keepable).slice(-MAX_MESSAGES) })));
};

export const getActiveId = () => read(ACTIVE_KEY, null);
export const setActiveId = (id) => write(ACTIVE_KEY, id);

export const newChatId = () => `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// Title = the visitor's first question, shortened.
export const titleFrom = (messages) => {
  const first = messages.find((m) => m.role === 'user')?.content || 'New chat';
  return first.length > 42 ? `${first.slice(0, 42)}…` : first;
};

// Puts the current messages into the chat list (creates the chat on its first question).
export const upsertChat = (chats, id, messages) => {
  if (!messages.some((m) => m.role === 'user')) return chats;
  const now = Date.now();
  const existing = chats.find((c) => c.id === id);
  if (existing) return chats.map((c) => (c.id === id ? { ...c, messages, updatedAt: now, title: c.renamed ? c.title : titleFrom(messages) } : c));
  return [{ id, title: titleFrom(messages), messages, createdAt: now, updatedAt: now, pinned: false }, ...chats];
};

// A chat as a .txt file the visitor can keep.
export const exportChat = (chat) => {
  const lines = chat.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'You' : 'Cardy (Aicardly)'}: ${m.content}`)
    .join('\n\n');
  const blob = new Blob([`Aicardly chat: ${chat.title}\n${new Date(chat.createdAt).toLocaleString('en-IN')}\n\n${lines}\n`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aicardly-chat-${new Date(chat.createdAt).toISOString().slice(0, 10)}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
