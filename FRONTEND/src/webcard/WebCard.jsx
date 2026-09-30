import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReelViewer, PdfViewer, useReelCarousel, WcThemeCtx } from './dc-runtime.jsx';
import './webcard.css';
import { AuroraAI, MinimalPro, NeoBrutal } from './templates/Templates01to03.jsx';
import { LuxeNoir, SplitHeroCorporate, SoftBentoWellness } from './templates/Templates04to06.jsx';
import { CreatorReel } from './templates/CreatorReel.jsx';
import { DevTerminal } from './templates/DevTerminal.jsx';
import { EditorialArchitect } from './templates/EditorialArchitect.jsx';
import { WebkikSignature } from './templates/WebkikSignature.jsx';
import { applyCard, buildCard, DEMO_PAYLOAD, shareCard } from './cardData.js';
import { templateIdOf, DEFAULT_TEMPLATE_ID } from './templates/TemplatePicker.jsx';
import { buildTheme, tokensFor, templateInfo } from './theme/themeTree.js';
import VisitorCounter, { useVisitorStats } from './components/VisitorCounter.jsx';
import SaveContactSheet from './components/SaveContactSheet.jsx';
import { Toast } from './components/Sheet.jsx';

// Order matches the Template Picker. lightCover / counterTop / radius place and shape the
// visitor counter and Save Contact sheet for each design (from the upstream template kit).
export const TEMPLATES = [
  { id: 'aurora-ai', name: 'Aurora AI', Component: AuroraAI },
  { id: 'minimal-pro', name: 'Minimal Pro', Component: MinimalPro, lightCover: true },
  { id: 'neo-brutal', name: 'Neo Brutal', Component: NeoBrutal, radius: 10, counterTop: 58 },
  { id: 'luxe-noir', name: 'Luxe Noir', Component: LuxeNoir, radius: 4 },
  { id: 'split-hero-corporate', name: 'Split Hero Corporate', Component: SplitHeroCorporate, radius: 12 },
  { id: 'soft-bento-wellness', name: 'Soft Bento Wellness', Component: SoftBentoWellness, lightCover: true, counterTop: 42 },
  { id: 'creator-reel', name: 'Creator Reel', Component: CreatorReel },
  { id: 'dev-terminal', name: 'Dev Terminal', Component: DevTerminal, radius: 8 },
  { id: 'editorial-architect', name: 'Editorial Architect', Component: EditorialArchitect, radius: 2, lightCover: true, counterTop: 38 },
  { id: 'webkik-signature', name: 'Webkik Signature', Component: WebkikSignature, radius: 14 },
].map((t) => ({ radius: 999, ...t, native: templateInfo(t.id)?.native || 'light' }));

export const DEFAULT_TEMPLATE = DEFAULT_TEMPLATE_ID;
export const resolveTemplate = templateIdOf;

// The 5 palettes of a template: [{ name, swatch }], for the Theme page.
export const palettesOf = (id) => (templateInfo(resolveTemplate(id))?.palettes || []).map((p) => ({ name: p.name, swatch: p.swatch }));
export const nativeModeOf = (id) => templateInfo(resolveTemplate(id))?.native || 'light';

// Only the template (no counter, sheets or viewers), in a palette and mode. Used by the live
// thumbnails in the template picker; reads the card data WebCard (or applyCard) already set.
export function TemplateView({ template, palette = 0, mode }) {
  const t = TEMPLATES.find((x) => x.id === resolveTemplate(template));
  const theme = useMemo(() => buildTheme(t.id, palette, mode || t.native), [t.id, palette, mode, t.native]);
  const C = t.Component;
  return (
    <WcThemeCtx.Provider value={theme}>
      <div className="wc-root">
        <C key={t.id} __theme={theme} />
      </div>
    </WcThemeCtx.Provider>
  );
}

// Renders a card with one of the templates.
// data: the /api/vcard/public/:slug payload ({ card, products, portfolio, ... }).
// aiPersona: the card's AI persona (the AI buttons and chat sheet show only when it is enabled).
// videoRoomUrl: adds a "Video call" suggestion in the chat.
// palette (0–4), mode ('light' | 'dark') and counter default to the owner's saved theme options.
// share: shows the Share button (top right, stays on screen while scrolling).
export default function WebCard({ template, data, aiPersona, videoRoomUrl, palette, mode, counter, share = false, ...rest }) {
  const id = resolveTemplate(template);
  const t = TEMPLATES.find((x) => x.id === id);
  const payload = data || DEMO_PAYLOAD;
  applyCard(buildCard(payload, { aiPersona, videoRoomUrl }));

  const opts = payload.card?.themeOptions || {};
  const p = Math.max(0, Math.min(4, Number(palette ?? opts.palette ?? 0) || 0));
  const m = mode || opts.mode || t.native;
  const showCounter = (counter ?? opts.counter ?? true) && !!payload.card?.username;
  const theme = useMemo(() => buildTheme(t.id, p, m), [t.id, p, m]);
  const T = tokensFor(t.id, p, m);

  const root = useRef(null);
  useReelCarousel(root);
  const stats = useVisitorStats(showCounter);

  // Save buttons open the Save Contact sheet while this card is on screen.
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    window.__wcSaveSheet = true;
    const open = () => setSaveOpen(true);
    window.addEventListener('wc:save', open);
    return () => {
      window.__wcSaveSheet = false;
      window.removeEventListener('wc:save', open);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const C = t.Component;
  return (
    <WcThemeCtx.Provider value={theme}>
      <div className="wc-root" ref={root} style={{ position: 'relative' }}>
        {/* Zero-height bar over the cover: visitors top left, Share top right (scroll away with the card). */}
        {(showCounter || share) && (
          <div style={{ position: 'relative', height: 0, zIndex: 40 }}>
            <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
              {showCounter && <VisitorCounter stats={stats} tokens={T} light={t.lightCover && m === 'light'} top={t.counterTop || 12} />}
              {share && (
                <button type="button" className="wc-sideshare" onClick={shareCard} aria-label="Share this card">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        )}
        <C key={t.id} __theme={theme} {...rest} />
        <ReelViewer />
        <PdfViewer />
        <SaveContactSheet
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          onSaved={(n) => setToast(`Contact saved with ${n} details`)}
          tokens={T}
          radius={Math.min(t.radius, 14)}
        />
        <Toast msg={toast} />
      </div>
    </WcThemeCtx.Provider>
  );
}
