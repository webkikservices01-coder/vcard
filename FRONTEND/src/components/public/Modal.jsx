import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../../utils/scrollLock';

// Popup rendered in a portal on <body> so it always sits above the page, the sticky header and
// the floating chat buttons. Locks background scroll, respects notches/home-indicator
// (safe-area insets), uses dynamic viewport height so mobile browser toolbars never clip it,
// and scrolls internally when its content is taller than the screen.
//   variant "sheet": bottom sheet on phones, centered card on tablet/desktop.
//   variant "full":  edge-to-edge dark viewer (used by the photo lightbox).
const Modal = ({ open, onClose, label, variant = 'sheet', panelClassName = '', children }) => {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  const full = variant === 'full';

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className={`fixed inset-0 z-[300] flex justify-center overscroll-contain ${full ? 'items-center bg-black/95' : 'items-end sm:items-center bg-black/65 backdrop-blur-sm'}`}
          style={{
            height: '100dvh',
            paddingTop: full ? 0 : 'max(env(safe-area-inset-top), 0.75rem)',
            paddingBottom: full ? 0 : 'max(env(safe-area-inset-bottom), 0.75rem)',
            paddingLeft: full ? 0 : 'max(env(safe-area-inset-left), 0.75rem)',
            paddingRight: full ? 0 : 'max(env(safe-area-inset-right), 0.75rem)',
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={full ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={full ? { opacity: 0, scale: 0.97 } : { opacity: 0, y: 48, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className={`relative w-full ${full ? 'h-full' : 'max-h-full overflow-y-auto overscroll-contain'} ${panelClassName}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
