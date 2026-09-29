import React, { useState } from 'react';

// Look of each template's thumbnail (same order as TEMPLATES in WebCard.jsx).
const IDS = [
  'aurora-ai',
  'minimal-pro',
  'neo-brutal',
  'luxe-noir',
  'split-hero-corporate',
  'soft-bento-wellness',
  'creator-reel',
  'dev-terminal',
  'editorial-architect',
  'webkik-signature',
];
const RAW = [
  {
    name: 'Aurora AI',
    mood: 'Futuristic, calm, intelligent',
    for: 'Tech founders, AI/SaaS professionals and startups.',
    tags: ['Dark', 'Creative'],
    badge: 'Popular',
    bg: '#0B0B14',
    cover: 'radial-gradient(60% 80% at 25% 40%,#7C5CFF,transparent),radial-gradient(60% 80% at 80% 50%,#22D3EE,transparent),#1B1640',
    align: 'center',
    av: '#2A2350',
    ring: '#22D3EE',
    avR: '50%',
    font: "'Space Grotesk',sans-serif",
    nameSize: '12px',
    text: '#F5F5FA',
    line: '#3A3A55',
    q: 'rgba(255,255,255,.08)',
    qR: '50%',
    qBd: '1px solid rgba(255,255,255,.18)',
    btn: 'linear-gradient(90deg,#7C5CFF,#22D3EE)',
    btn2: 'rgba(255,255,255,.08)',
    btn2Bd: '1px solid rgba(255,255,255,.25)',
    btnR: '999px',
    btnBd: 'none',
    btnSh: 'none',
    tile: 'rgba(255,255,255,.06)',
    tileR: '8px',
    tileBd: '1px solid rgba(255,255,255,.14)',
    orb: 'conic-gradient(#7C5CFF,#22D3EE,#7C5CFF)',
    orbR: '50%',
    orbW: '18px',
    orbH: '18px',
    orbRight: '8px',
  },
  {
    name: 'Minimal Pro',
    mood: 'Swiss, trustworthy, quiet',
    for: 'Consultants, CAs, lawyers and corporate professionals.',
    tags: ['Light', 'Minimal'],
    bg: '#FFFFFF',
    cover: 'linear-gradient(to bottom,#94A3B8,#E2E8F0 80%,#FFFFFF)',
    align: 'flex-start',
    av: '#CBD5E1',
    ring: '#FFFFFF',
    avR: '50%',
    font: "'Inter',sans-serif",
    nameSize: '12px',
    text: '#0F172A',
    line: '#E2E8F0',
    q: '#FFFFFF',
    qR: '4px',
    qBd: '1px solid #E2E8F0',
    btn: '#0F172A',
    btn2: '#FFFFFF',
    btn2Bd: '1px solid #CBD5E1',
    btnR: '4px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#FFFFFF',
    tileR: '0',
    tileBd: '0 solid transparent; border-bottom:1px solid #E2E8F0',
    orb: '#FFFFFF; box-shadow:0 0 0 1px #2563EB',
    orbR: '5px',
    orbW: '30px',
    orbH: '14px',
    orbRight: '8px',
  },
  {
    name: 'Neo Brutal',
    mood: 'Bold, playful, confident',
    for: 'Designers, creative agencies and marketers.',
    tags: ['Light', 'Bold', 'Creative'],
    badge: 'Popular',
    bg: '#FFF4E0',
    cover: '#FF5C39',
    align: 'flex-end',
    av: '#FFD23F',
    ring: '#111111',
    avR: '50%',
    font: "'Archivo Black',sans-serif",
    nameSize: '13px',
    text: '#111111',
    line: '#111111',
    q: '#FFD23F',
    qR: '0',
    qBd: '1.5px solid #111',
    btn: '#FF5C39',
    btn2: '#FFFFFF',
    btn2Bd: '1.5px solid #111',
    btnR: '4px',
    btnBd: '1.5px solid #111',
    btnSh: '2px 2px 0 #111',
    tile: '#3DDC97',
    tileR: '4px',
    tileBd: '1.5px solid #111',
    orb: 'linear-gradient(135deg,#FFD23F,#3DDC97); border:1.5px solid #111',
    orbR: '2px',
    orbW: '18px',
    orbH: '18px',
    orbRight: '112px',
  },
  {
    name: 'Luxe Noir',
    mood: 'Elegant, exclusive, cinematic',
    for: 'Real estate, jewellery, luxury interiors and premium brands.',
    tags: ['Dark', 'Minimal'],
    bg: '#0A0A0A',
    cover: 'linear-gradient(to bottom,#3A2E1C,#0A0A0A)',
    align: 'center',
    av: '#1C1A16',
    ring: '#C9A45C',
    avR: '50%',
    font: "'Cormorant Garamond',serif",
    nameSize: '14px',
    text: '#EDE6D6',
    line: '#2A2620',
    q: 'transparent',
    qR: '50%',
    qBd: '1px solid #C9A45C',
    btn: '#C9A45C',
    btn2: 'transparent',
    btn2Bd: '1px solid #C9A45C',
    btnR: '2px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#141414',
    tileR: '0',
    tileBd: '0 solid transparent; border-bottom:1px solid #2A2620',
    orb: '#0A0A0A; box-shadow:0 0 0 1px #C9A45C',
    orbR: '2px',
    orbW: '34px',
    orbH: '14px',
    orbRight: '8px',
  },
  {
    name: 'Split Hero Corporate',
    mood: 'Structured, efficient, credible',
    for: 'Sales leaders, B2B business owners and bankers.',
    tags: ['Light', 'Minimal'],
    bg: '#F6F8FB',
    cover: 'linear-gradient(120deg,#0B3B31,#0E7C66)',
    align: 'flex-start',
    av: '#E6ECF2',
    ring: '#FFFFFF',
    avR: '8px',
    font: "'Manrope',sans-serif",
    nameSize: '12px',
    text: '#0B1B2B',
    line: '#D6E0EA',
    q: '#E4F2EE',
    qR: '5px',
    qBd: 'none',
    btn: '#0E7C66',
    btn2: '#FFFFFF',
    btn2Bd: '1px solid #CBD6E2',
    btnR: '5px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#FFFFFF',
    tileR: '6px',
    tileBd: '1px solid #E3E9F0',
    orb: '#0E7C66',
    orbR: '50%',
    orbW: '18px',
    orbH: '18px',
    orbRight: '8px',
  },
  {
    name: 'Soft Bento Wellness',
    mood: 'Warm, gentle, approachable',
    for: 'Doctors, clinics, coaches, wellness and beauty professionals.',
    tags: ['Light', 'Creative'],
    badge: 'New',
    bg: '#FBF7F4',
    cover:
      'radial-gradient(40% 60% at 20% 30%,#E8F3EE 99%,transparent),radial-gradient(40% 60% at 80% 40%,#FDEDEC 99%,transparent),radial-gradient(35% 55% at 50% 80%,#EEF0FB 99%,transparent),#FBF7F4',
    align: 'center',
    av: '#E8F3EE',
    ring: '#FFFFFF',
    avR: '50%',
    font: "'Plus Jakarta Sans',sans-serif",
    nameSize: '12px',
    text: '#2B2B2B',
    line: '#EDE5DF',
    q: '#E8F3EE',
    qR: '999px',
    qBd: 'none',
    btn: '#2B2B2B',
    btn2: '#FFFFFF',
    btn2Bd: 'none',
    btnR: '999px',
    btnBd: 'none',
    btnSh: '0 2px 6px rgba(43,43,43,.12)',
    tile: '#FDEDEC',
    tileR: '10px',
    tileBd: 'none',
    orb: 'linear-gradient(145deg,#9FDCC4,#C6CCF6)',
    orbR: '50%',
    orbW: '20px',
    orbH: '20px',
    orbRight: '8px',
  },
  {
    name: 'Creator Reel',
    mood: 'Energetic, social, video-first',
    for: 'Influencers, content creators, coaches and public speakers.',
    tags: ['Dark', 'Bold'],
    badge: 'New',
    bg: '#0D0D0D',
    cover: 'radial-gradient(50% 70% at 30% 50%,#FF3D77,transparent),radial-gradient(50% 70% at 75% 50%,#FF9A3D,transparent),#1A0B10',
    align: 'flex-end',
    av: '#2A2A2A',
    ring: '#FF9A3D',
    avR: '50%',
    font: "'Sora',sans-serif",
    nameSize: '12px',
    text: '#FFFFFF',
    line: '#2C2C2C',
    q: '#1A1A1A',
    qR: '50%',
    qBd: 'none',
    btn: 'linear-gradient(90deg,#FF3D77,#FF9A3D)',
    btn2: '#1A1A1A',
    btn2Bd: '1px solid #3A3A3A',
    btnR: '999px',
    btnBd: 'none',
    btnSh: 'none',
    tile: 'linear-gradient(160deg,#5A1630,#1A0B10)',
    tileR: '8px',
    tileBd: 'none',
    orb: 'conic-gradient(#FF3D77,#FF9A3D,#FF3D77)',
    orbR: '50%',
    orbW: '20px',
    orbH: '20px',
    orbRight: '8px',
  },
  {
    name: 'Dev Terminal',
    mood: 'Technical, smart, slightly geeky',
    for: 'Developers, engineers and tech freelancers.',
    tags: ['Dark', 'Minimal'],
    bg: '#0D1117',
    cover:
      'linear-gradient(rgba(88,166,255,.14) 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,rgba(88,166,255,.14) 1px,transparent 1px) 0 0/8px 8px,#0D1117',
    align: 'flex-start',
    av: '#161B22',
    ring: '#3FB950',
    avR: '50%',
    font: "'JetBrains Mono',monospace",
    nameSize: '11px',
    text: '#E6EDF3',
    line: '#30363D',
    q: '#161B22',
    qR: '3px',
    qBd: '1px solid #30363D',
    btn: '#3FB950',
    btn2: '#161B22',
    btn2Bd: '1px solid #30363D',
    btnR: '3px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#161B22',
    tileR: '3px',
    tileBd: '1px solid #30363D',
    orb: '#161B22; box-shadow:0 0 0 1px #3FB950',
    orbR: '4px',
    orbW: '18px',
    orbH: '18px',
    orbRight: '8px',
  },
  {
    name: 'Editorial Architect',
    mood: 'Magazine-like, refined, image-led',
    for: 'Architects, interior designers, photographers and studios.',
    tags: ['Light', 'Minimal', 'Creative'],
    bg: '#F4F1EC',
    cover: 'linear-gradient(160deg,#CFC6B8,#A99F90)',
    align: 'space-between',
    av: '#E4DED4',
    ring: '#1C1C1C',
    avR: '50%',
    font: "'DM Serif Display',serif",
    nameSize: '15px',
    text: '#1C1C1C',
    line: '#D9D2C7',
    q: 'transparent',
    qR: '50%',
    qBd: '1px solid #1C1C1C',
    btn: '#B5573B',
    btn2: 'transparent',
    btn2Bd: '0 solid transparent; border-bottom:1px solid #1C1C1C',
    btnR: '1px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#CFC6B8',
    tileR: '0',
    tileBd: 'none',
    orb: '#1C1C1C',
    orbR: '1px 0 0 1px',
    orbW: '8px',
    orbH: '30px',
    orbRight: '0',
  },
  {
    name: 'Webkik Signature',
    mood: 'Confident, modern, brand-forward',
    for: 'Default template for Webkik teams and general business owners.',
    tags: ['Light', 'Dark', 'Bold'],
    badge: 'Popular',
    bg: '#FFFFFF',
    cover: 'repeating-linear-gradient(135deg,rgba(255,255,255,.08) 0 1px,transparent 1px 8px),linear-gradient(135deg,#ED2460,#7A0E33)',
    align: 'center',
    av: '#FDE4EC',
    ring: '#FFFFFF',
    avR: '50%',
    font: "'Poppins',sans-serif",
    nameSize: '12px',
    text: '#1A1A1A',
    line: '#F4D9E3',
    q: '#FDE4EC',
    qR: '50%',
    qBd: 'none',
    btn: '#ED2460',
    btn2: '#14141A',
    btn2Bd: 'none',
    btnR: '6px',
    btnBd: 'none',
    btnSh: 'none',
    tile: '#FFF5F8',
    tileR: '8px',
    tileBd: '1px solid #F4D9E3',
    orb: 'radial-gradient(circle at 35% 30%,#FF8FB1,#ED2460 60%,#A80F40)',
    orbR: '50%',
    orbW: '20px',
    orbH: '20px',
    orbRight: '8px',
  },
];

export const TEMPLATE_META = RAW.map((t, i) => ({
  ...t,
  id: IDS[i],
  align: t.align === 'space-between' ? 'flex-end' : t.align,
  badgeBg: t.badge === 'New' ? '#15803D' : '#ED2460',
}));

// Solid colours per template, for UI that can't render the template itself (e.g. the 3D card preview).
const PALETTE = {
  'aurora-ai': { accent: '#7C5CFF', surface: '#0B0B14', card: '#15152A', link: '#22D3EE', text: '#F5F5FA', sub: '#A6A6BD', dark: true },
  'minimal-pro': { accent: '#2563EB', surface: '#FFFFFF', card: '#F1F5F9', link: '#0F172A', text: '#0F172A', sub: '#64748B', dark: false },
  'neo-brutal': { accent: '#FF5C39', surface: '#FFF4E0', card: '#FFD23F', link: '#111111', text: '#111111', sub: '#57524A', dark: false },
  'luxe-noir': { accent: '#C9A45C', surface: '#0A0A0A', card: '#141414', link: '#C9A45C', text: '#EDE6D6', sub: '#A89F8C', dark: true },
  'split-hero-corporate': {
    accent: '#0E7C66',
    surface: '#F6F8FB',
    card: '#FFFFFF',
    link: '#0E7C66',
    text: '#0B1B2B',
    sub: '#5B6B7C',
    dark: false,
  },
  'soft-bento-wellness': {
    accent: '#3AA17E',
    surface: '#FBF7F4',
    card: '#E8F3EE',
    link: '#2B2B2B',
    text: '#2B2B2B',
    sub: '#5E5A57',
    dark: false,
  },
  'creator-reel': { accent: '#FF3D77', surface: '#0D0D0D', card: '#1A1A1A', link: '#FF9A3D', text: '#FFFFFF', sub: '#C9C9C9', dark: true },
  'dev-terminal': { accent: '#3FB950', surface: '#0D1117', card: '#161B22', link: '#58A6FF', text: '#E6EDF3', sub: '#8B949E', dark: true },
  'editorial-architect': {
    accent: '#B5573B',
    surface: '#F4F1EC',
    card: '#E4DED4',
    link: '#1C1C1C',
    text: '#1C1C1C',
    sub: '#5E5850',
    dark: false,
  },
  'webkik-signature': {
    accent: '#ED2460',
    surface: '#FFFFFF',
    card: '#FFF5F8',
    link: '#14141A',
    text: '#1A1A1A',
    sub: '#5E5560',
    dark: false,
  },
};

export const DEFAULT_TEMPLATE_ID = 'webkik-signature';

// Template id for a saved card (older cards stored colour-theme ids such as "midnight-tech").
export const templateIdOf = (id) => (PALETTE[id] ? id : DEFAULT_TEMPLATE_ID);

export const templatePalette = (id) => PALETTE[templateIdOf(id)];

export const templateMeta = (id) => TEMPLATE_META.find((t) => t.id === templateIdOf(id));

export const TEMPLATE_FILTERS = ['All', 'Dark', 'Light', 'Minimal', 'Bold', 'Creative'];

const FOUR = [0, 1, 2, 3];

// Miniature phone mock of a template, drawn from its colour tokens.
export function TemplateThumb({ t, name = 'Your Name', selected = false }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '20px',
        padding: '3px',
        boxSizing: 'border-box',
        background: selected ? '#ED2460' : 'transparent',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '9/17',
          borderRadius: '17px',
          overflow: 'hidden',
          background: t.bg,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)',
        }}
      >
        <div style={{ height: '34%', background: t.cover }}></div>
        <div style={{ display: 'flex', justifyContent: t.align, padding: '0 10px', marginTop: '-16px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: t.avR,
              background: t.av,
              border: `2px solid ${t.ring}`,
              boxSizing: 'border-box',
            }}
          ></span>
        </div>
        <div style={{ padding: '6px 10px 0', display: 'flex', flexDirection: 'column', alignItems: t.align, gap: '4px' }}>
          <span
            style={{
              maxWidth: '100%',
              fontFamily: t.font,
              fontSize: t.nameSize,
              lineHeight: '1',
              color: t.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </span>
          <span style={{ width: '62%', height: '4px', borderRadius: '2px', background: t.line }}></span>
          <span style={{ width: '84%', height: '4px', borderRadius: '2px', background: t.line, opacity: '.6' }}></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '5px', padding: '8px 10px 0' }}>
          {FOUR.map((i) => (
            <span key={i} style={{ aspectRatio: '1', borderRadius: t.qR, background: t.q, border: t.qBd }}></span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '5px', padding: '8px 10px 0' }}>
          <span
            style={{
              height: '14px',
              borderRadius: t.btnR,
              background: t.btn,
              border: t.btnBd,
              boxShadow: t.btnSh,
              boxSizing: 'border-box',
            }}
          ></span>
          <span style={{ height: '14px', borderRadius: t.btnR, background: t.btn2, border: t.btn2Bd, boxSizing: 'border-box' }}></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', padding: '10px 10px 0' }}>
          {FOUR.map((i) => (
            <span
              key={i}
              style={{ height: '24px', borderRadius: t.tileR, background: t.tile, border: t.tileBd, boxSizing: 'border-box' }}
            ></span>
          ))}
        </div>
        <span
          style={{
            position: 'absolute',
            right: t.orbRight,
            bottom: '10px',
            width: t.orbW,
            height: t.orbH,
            borderRadius: t.orbR,
            background: t.orb,
          }}
        ></span>
      </div>
      {t.badge ? (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            height: '22px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '999px',
            background: t.badgeBg,
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: '700',
          }}
        >
          {t.badge}
        </span>
      ) : null}
    </div>
  );
}

// Filterable grid of template thumbnails. onPick receives the template id.
export function TemplatePicker({ selected, onPick, name, columns = 2, dark = false }) {
  const [filter, setFilter] = useState('All');
  const shown = TEMPLATE_META.filter((t) => filter === 'All' || t.tags.includes(filter));
  const fg = dark ? '#F5F2F4' : '#1A1A1A';
  const muted = dark ? '#B7AEB5' : '#5E5560';
  return (
    <div style={{ color: fg }}>
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '12px' }}>
        {TEMPLATE_FILTERS.map((label) => {
          const on = label === filter;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(label)}
              style={{
                flexShrink: '0',
                height: '36px',
                padding: '0 14px',
                borderRadius: '999px',
                border: `1px solid ${on ? '#ED2460' : dark ? 'rgba(255,255,255,.15)' : '#F0C9D6'}`,
                background: on ? '#ED2460' : 'transparent',
                color: on ? '#FFFFFF' : fg,
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: columns === 'auto' ? 'repeat(auto-fill,minmax(132px,1fr))' : `repeat(${columns},minmax(0,1fr))`,
          gap: '14px 12px',
        }}
      >
        {shown.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick && onPick(t.id)}
            aria-pressed={t.id === selected}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '0',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              color: fg,
            }}
          >
            <TemplateThumb t={t} name={name} selected={t.id === selected} />
            <div style={{ padding: '0 2px' }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '14px', fontWeight: '600' }}>{t.name}</div>
              <div style={{ fontSize: '12px', lineHeight: '1.35', color: muted }}>{t.mood}</div>
            </div>
          </button>
        ))}
      </div>
      {shown.length === 0 ? <p style={{ fontSize: '14px', color: muted, textAlign: 'center' }}>{'No templates in this filter.'}</p> : null}
    </div>
  );
}
