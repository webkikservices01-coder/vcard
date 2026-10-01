import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Pin, PinOff, Trash2, Download, Plus, MessageSquare } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { exportChat, timeAgo } from './history';

// Earlier chats with Cardy (saved in this browser): open, search, pin, download or delete.
export default function HistoryPanel({ chats, activeId, onOpen, onNew, onDelete, onPin, onClose, reducedMotion }) {
  const [q, setQ] = useState('');
  const list = chats
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.messages.some((m) => m.content.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.pinned - a.pinned) || b.updatedAt - a.updatedAt);

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { x: '-100%' }}
      animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { x: '-100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      className="absolute inset-0 z-20 flex flex-col"
      style={{ background: 'var(--surface-1)' }}
      role="region"
      aria-label="Your previous chats"
    >
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3" style={{ borderColor: 'var(--surface-border)' }}>
        <IconButton variant="ghost" size="sm" onClick={onClose} title="Back to chat">
          <ArrowLeft className="h-4 w-4" />
        </IconButton>
        <p className="flex-1 text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Your chats</p>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white"
          style={{ backgroundImage: 'var(--background-image-gradient-crimson)' }}
        >
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>
      <div className="shrink-0 px-3 pt-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--surface-text-2)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your chats"
            aria-label="Search your chats"
            className="input-premium w-full !py-2 !pl-8 text-sm"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
        {list.length === 0 ? (
          <p className="pt-10 text-center text-xs" style={{ color: 'var(--surface-text-2)' }}>
            {chats.length ? 'No chats match.' : 'Your chats with Cardy will show up here. They stay only on this device.'}
          </p>
        ) : (
          list.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: c.id === activeId ? 'color-mix(in srgb, var(--color-crimson-500) 45%, transparent)' : 'var(--surface-border)',
                background: c.id === activeId ? 'color-mix(in srgb, var(--color-crimson-500) 7%, var(--surface-1))' : 'var(--surface-1)',
              }}
            >
              <button type="button" onClick={() => onOpen(c.id)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson-500" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold" style={{ color: 'var(--surface-text)' }}>
                    {c.pinned && <Pin className="mr-1 inline h-3 w-3 text-crimson-500" aria-label="Pinned" />}
                    {c.title}
                  </span>
                  <span className="block text-[11px]" style={{ color: 'var(--surface-text-2)' }}>
                    {(() => { const n = c.messages.filter((m) => m.role === 'user').length; return `${n} question${n === 1 ? '' : 's'}`; })()} · {timeAgo(c.updatedAt)}
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 items-center opacity-70 transition-opacity group-hover:opacity-100">
                <IconButton variant="ghost" size="sm" onClick={() => onPin(c.id)} title={c.pinned ? 'Unpin' : 'Pin'}>
                  {c.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </IconButton>
                <IconButton variant="ghost" size="sm" onClick={() => exportChat(c)} title="Download chat">
                  <Download className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton variant="ghost" size="sm" onClick={() => window.confirm('Delete this chat?') && onDelete(c.id)} title="Delete chat">
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="shrink-0 px-3 pb-3 text-center text-[10.5px]" style={{ color: 'var(--surface-text-2)' }}>
        Saved only in this browser. Clearing site data removes them.
      </p>
    </motion.div>
  );
}
