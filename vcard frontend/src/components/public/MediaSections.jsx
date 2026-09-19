import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from 'lucide-react';
import Carousel from './Carousel';
import Modal from './Modal';
import { describeMedia, getImageUrl } from '../../utils/media';

const enter = {
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const Stars = ({ n }) => (
  <div className="flex shrink-0 items-center gap-0.5 text-[10px] text-amber-500" aria-label={`${n} out of 5 stars`}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </div>
);

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const TestimonialsCarousel = ({ testimonials }) => (
  <motion.div {...enter}>
    <Carousel label="Verified reviews" autoPlayMs={5000}>
      {testimonials.map((t) => (
        <div key={t._id} className="flex w-full flex-col rounded-xl border border-pink-100 bg-[#faf8fa] p-3 shadow-2xs">
          <div className="flex items-start gap-2">
            {t.photo ? (
              <img src={getImageUrl(t.photo)} alt={t.name} loading="lazy" draggable={false} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E70C65] text-xs font-black text-white">{t.name?.[0]}</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-bold text-slate-900">{t.name}</p>
                <Stars n={t.rating || 5} />
              </div>
              <p className="mt-0.5 break-words text-[11px] leading-relaxed text-slate-600">"{t.review}"</p>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  </motion.div>
);

// ─── Featured works (portfolio) ──────────────────────────────────────────────
export const PortfolioCarousel = ({ portfolio }) => {
  const [detail, setDetail] = useState({ item: null, open: false });
  const openItem = detail.item;
  const close = useCallback(() => setDetail((d) => ({ ...d, open: false })), []);

  return (
    <motion.div {...enter}>
      <Carousel label="Featured works" autoPlayMs={5500}>
        {portfolio.map((p) => {
          const hasDetail = !!(p.coverImage || p.description);
          const Wrapper = hasDetail || !p.url ? 'button' : 'a';
          const wrapperProps = hasDetail || !p.url
            ? { type: 'button', onClick: () => setDetail({ item: p, open: true }) }
            : { href: p.url, target: '_blank', rel: 'noopener noreferrer' };
          return (
            <Wrapper
              key={p._id}
              {...wrapperProps}
              className="group block w-full overflow-hidden rounded-xl border border-pink-100 bg-[#faf8fa] text-left shadow-2xs transition-colors hover:bg-pink-50/50 cursor-pointer"
            >
              {p.coverImage && (
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img src={getImageUrl(p.coverImage)} alt={p.title} loading="lazy" draggable={false} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{p.title}</p>
                  {p.description && <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">{p.description}</p>}
                </div>
                <ChevronRight className="ml-2 h-3.5 w-3.5 shrink-0 text-[#E70C65]" />
              </div>
            </Wrapper>
          );
        })}
      </Carousel>

      <Modal open={detail.open && !!openItem} onClose={close} label={openItem?.title || 'Project details'} panelClassName="sm:max-w-lg">
        {openItem && (
          <div className="overflow-hidden rounded-[24px] bg-white text-slate-900 shadow-2xl">
            <div className="relative">
              {openItem.coverImage ? (
                <img src={getImageUrl(openItem.coverImage)} alt={openItem.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="h-16 bg-gradient-to-r from-[#E70C65] to-[#cf0a55]" />
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <h3 className="break-words text-base font-black leading-snug">{openItem.title}</h3>
              {openItem.description && <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">{openItem.description}</p>}
              {openItem.url && (
                <a
                  href={openItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#cf0a55] px-4 py-3 text-xs font-bold text-white shadow-md"
                >
                  View project <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

// ─── Photo / video lightbox ──────────────────────────────────────────────────
const Lightbox = ({ items, index, open, onClose, onIndex }) => {
  const item = items[index];
  const media = item ? describeMedia(item) : null;
  const count = items.length;
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

  useEffect(() => {
    if (!open || !item) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, item, prev, next]);

  useEffect(() => {
    if (!open || !item) return;
    [index - 1, index + 1].forEach((i) => {
      const n = items[(i + count) % count];
      if (n && n.type !== 'video') { const im = new Image(); im.src = getImageUrl(n.url); }
    });
  }, [open, item, index, items, count]);

  const iconBtn = 'flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition-colors hover:bg-white/25 cursor-pointer';

  return (
    <Modal open={open && !!item} onClose={onClose} variant="full" label="Media viewer">
      {item && media && (
        <div className="relative flex h-full w-full flex-col" onClick={onClose}>
          <div
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4"
            style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-bold tabular-nums text-white backdrop-blur-md">{index + 1} / {count}</span>
            <button type="button" onClick={onClose} aria-label="Close" className={iconBtn}><X className="h-5 w-5" /></button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-16 pt-16 sm:px-20">
            <motion.div
              key={item._id}
              drag={count > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -80 || velocity.x < -500) next();
                else if (offset.x > 80 || velocity.x > 500) prev();
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-full max-w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {media.kind === 'image' && (
                <img src={media.src} alt="" draggable={false} className="max-h-[calc(100dvh-8rem)] max-w-full select-none rounded-xl object-contain shadow-2xl" />
              )}
              {media.kind === 'youtube' && (
                <div className="aspect-video w-[min(92vw,960px)] max-h-[calc(100dvh-8rem)] overflow-hidden rounded-xl bg-black shadow-2xl">
                  <iframe title="Video" src={media.embed} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full border-0" />
                </div>
              )}
              {media.kind === 'file' && (
                <video src={media.src} controls autoPlay playsInline className="max-h-[calc(100dvh-8rem)] max-w-full rounded-xl bg-black shadow-2xl" />
              )}
              {media.kind === 'external' && (
                <a href={media.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-2xl">
                  Open video <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </motion.div>
          </div>

          {count > 1 && (
            <div onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={prev} aria-label="Previous" className={`${iconBtn} absolute left-3 top-1/2 hidden -translate-y-1/2 sm:flex`}><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={next} aria-label="Next" className={`${iconBtn} absolute right-3 top-1/2 hidden -translate-y-1/2 sm:flex`}><ChevronRight className="h-5 w-5" /></button>
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 sm:hidden"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.9rem)' }}
              >
                <button type="button" onClick={prev} aria-label="Previous" className={iconBtn}><ChevronLeft className="h-5 w-5" /></button>
                <span className="text-[11px] font-medium text-white/70">Swipe or tap arrows</span>
                <button type="button" onClick={next} aria-label="Next" className={iconBtn}><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ─── Gallery ─────────────────────────────────────────────────────────────────
export const GalleryCarousel = ({ gallery }) => {
  const [viewer, setViewer] = useState({ index: 0, open: false });
  const close = useCallback(() => setViewer((v) => ({ ...v, open: false })), []);
  const setIndex = useCallback((i) => setViewer({ index: i, open: true }), []);

  return (
    <motion.div {...enter}>
      <Carousel label="Media gallery" perView={2} autoPlayMs={4500}>
        {gallery.map((item, i) => {
          const media = describeMedia(item);
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.type === 'video' ? 'Play video' : 'Open photo'}
              className="group relative aspect-square w-full overflow-hidden rounded-xl border border-pink-100 bg-pink-50 shadow-2xs cursor-pointer"
            >
              {media.thumb ? (
                <img src={media.thumb} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : media.kind === 'file' ? (
                <video src={`${media.src}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950" />
              )}
              {item.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#E70C65] shadow-lg"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
                </span>
              )}
            </button>
          );
        })}
      </Carousel>
      <Lightbox items={gallery} index={Math.min(viewer.index, gallery.length - 1)} open={viewer.open} onClose={close} onIndex={setIndex} />
    </motion.div>
  );
};
