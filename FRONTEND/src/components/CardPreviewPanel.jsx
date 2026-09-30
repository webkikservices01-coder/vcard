import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import LiveCardPreview from './LiveCardPreview';

// Side panel with the owner's live card, openable from every dashboard page.
// It refreshes after each save, so every step can be checked without leaving the page.
const CardPreviewPanel = ({ open, onClose, username, look = null }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[210] bg-black/40 lg:bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Live card preview"
            className="fixed inset-y-0 right-0 z-[220] flex w-full max-w-[430px] flex-col shadow-2xl"
            style={{ background: 'var(--surface-bg, #fff)', borderLeft: '1px solid var(--surface-border)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--surface-border)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Live card preview</p>
                <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--surface-text-2)' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {look ? 'Showing your unsaved look' : 'Refreshes after every save'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ color: 'var(--surface-text)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden px-4 py-4">
              <LiveCardPreview username={username} look={look} height="calc(100dvh - 120px)" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CardPreviewPanel;
