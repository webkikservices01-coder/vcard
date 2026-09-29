import React, { useRef } from 'react';
import { ReelViewer, PdfViewer, useReelCarousel } from './dc-runtime.jsx';
import './webcard.css';
import { AuroraAI, MinimalPro, NeoBrutal } from './templates/Templates01to03.jsx';
import { LuxeNoir, SplitHeroCorporate, SoftBentoWellness } from './templates/Templates04to06.jsx';
import { CreatorReel } from './templates/CreatorReel.jsx';
import { DevTerminal } from './templates/DevTerminal.jsx';
import { EditorialArchitect } from './templates/EditorialArchitect.jsx';
import { WebkikSignature } from './templates/WebkikSignature.jsx';
import { applyCard, buildCard, DEMO_PAYLOAD } from './cardData.js';
import { templateIdOf, DEFAULT_TEMPLATE_ID } from './templates/TemplatePicker.jsx';

// Order matches the Template Picker.
export const TEMPLATES = [
  { id: 'aurora-ai', name: 'Aurora AI', Component: AuroraAI },
  { id: 'minimal-pro', name: 'Minimal Pro', Component: MinimalPro },
  { id: 'neo-brutal', name: 'Neo Brutal', Component: NeoBrutal },
  { id: 'luxe-noir', name: 'Luxe Noir', Component: LuxeNoir },
  { id: 'split-hero-corporate', name: 'Split Hero Corporate', Component: SplitHeroCorporate },
  { id: 'soft-bento-wellness', name: 'Soft Bento Wellness', Component: SoftBentoWellness },
  { id: 'creator-reel', name: 'Creator Reel', Component: CreatorReel },
  { id: 'dev-terminal', name: 'Dev Terminal', Component: DevTerminal },
  { id: 'editorial-architect', name: 'Editorial Architect', Component: EditorialArchitect },
  { id: 'webkik-signature', name: 'Webkik Signature', Component: WebkikSignature },
];

export const DEFAULT_TEMPLATE = DEFAULT_TEMPLATE_ID;
export const resolveTemplate = templateIdOf;

// Renders a card with one of the templates.
// data: the /api/vcard/public/:slug payload ({ card, products, portfolio, ... }).
// aiPersona: the card's AI persona (the AI buttons and chat sheet show only when it is enabled).
// videoRoomUrl: adds a "Video call" suggestion in the chat.
export default function WebCard({ template, data, aiPersona, videoRoomUrl, ...rest }) {
  const id = resolveTemplate(template);
  const t = TEMPLATES.find((x) => x.id === id);
  applyCard(buildCard(data || DEMO_PAYLOAD, { aiPersona, videoRoomUrl }));
  const root = useRef(null);
  useReelCarousel(root);
  const C = t.Component;
  return (
    <div className="wc-root" ref={root}>
      <C key={t.id} {...rest} />
      <ReelViewer />
      <PdfViewer />
    </div>
  );
}
