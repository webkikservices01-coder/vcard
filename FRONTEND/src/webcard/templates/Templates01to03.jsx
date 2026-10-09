import React from 'react';
import '../webcard-shared.js';
import { CARD } from '../cardData.js';
import { DCLogic, useDC, useLive, liveFrame, ImageSlot, CoverImage, Fill, CardQR, EnquiryForm, CustomSections, downloadQR, openLink, saveContact, shareCard, scrollToSection, ReelMedia, useChat, ChatCallButtons, ChatThread, ChatText, SwipeRow, ChatMic, ServiceSlides, ProductCatalog, PhotoSlides, TestimonialSlides } from '../dc-runtime.jsx';
import { themeTree } from '../theme/themeTree.js';

class Logic extends DCLogic {
  qr() {
    if (this._qr) return this._qr;
    const n = 25;
    let s = 7;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const F = [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ];
    let r = '';
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let on = null;
        for (const [fx, fy] of F)
          if (x >= fx && x < fx + 7 && y >= fy && y < fy + 7) {
            const dx = x - fx,
              dy = y - fy;
            on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
          }
        const zone = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
        if (on === null) on = zone ? false : rnd() > 0.52;
        if (x >= 10 && x <= 14 && y >= 10 && y <= 14) on = false;
        if (on) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>';
      }
    this._qr = {
      __html:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="100%" height="100%" fill="#111" shape-rendering="crispEdges">' +
        r +
        '</svg>',
    };
    return this._qr;
  }

  renderVals() {
    const svg = (p, s, sw, extra) => ({
      __html:
        '<svg width="' +
        (s || 20) +
        '" height="' +
        (s || 20) +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
        (sw || 1.75) +
        '" stroke-linecap="round" stroke-linejoin="round" style="display:block">' +
        (extra || '') +
        p +
        '</svg>',
    });
    const P = {
      phone:
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
      mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
      linkedin:
        '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
      instagram:
        '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
      youtube:
        '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
      more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
      userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
      share:
        '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
      badge:
        '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
      send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
      chevR: '<path d="m9 18 6-6-6-6"/>',
      code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
      mobile: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
      trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
      cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
      spark:
        '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    };
    const ic = {};
    Object.keys(P).forEach((k) => {
      ic[k] = svg(P[k]);
    });
    ic.badgeS = svg(P.badge, 14, 2);
    ic.sparkS = svg(P.spark, 15, 2);
    ic.play = {
      __html:
        '<svg width="18" height="18" viewBox="0 0 24 24" style="display:block;margin-left:2px"><path d="M6 3l14 9-14 9z" fill="currentColor"/></svg>',
    };
    const grad = (a, b, size, id) => ({
      __html:
        '<svg width="' +
        size +
        '" height="' +
        size +
        '" viewBox="0 0 24 24" fill="none" stroke="url(#' +
        id +
        ')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><defs><linearGradient id="' +
        id +
        '" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="' +
        a +
        '"/><stop offset="1" stop-color="' +
        b +
        '"/></linearGradient></defs>' +
        P.spark +
        '</svg>',
    });

    const FR = [
      {
        key: 'hero',
        label: 'Hero · 390×844',
        w: 390,
        h: '844px',
        statusH: 44,
        coverH: 219,
        r: 44,
        bezelR: 54,
        profile: true,
        rest: false,
        chat: false,
        tip: true,
        launch: true,
        launchBottom: 34,
      },
      {
        key: 'small',
        label: 'Small phone · 360×640',
        w: 360,
        h: '640px',
        statusH: 24,
        coverH: 150,
        r: 26,
        bezelR: 36,
        profile: true,
        rest: false,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 12,
      },
      {
        key: 'chat',
        label: 'AI chat open · 390×844',
        w: 390,
        h: '844px',
        statusH: 44,
        coverH: 219,
        r: 44,
        bezelR: 54,
        profile: false,
        rest: false,
        chat: true,
        tip: false,
        launch: false,
        launchBottom: 34,
      },
      {
        key: 'full',
        label: 'Full scroll · 390 wide',
        w: 390,
        h: 'auto',
        statusH: 44,
        coverH: 219,
        r: 44,
        bezelR: 54,
        profile: true,
        rest: true,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 100,
      },
    ].map((f) => ({
      ...f,
      coverHB: f.key === 'small' ? 90 : f.coverH - 30,
      coverTotal: f.statusH + f.coverH,
      chipTop: f.statusH + 6,
      chipTopM: f.statusH + 12,
    }));

    const navLabels = ['Profile', 'Services', 'Products', 'Projects', 'Videos', 'Portfolio', 'Contact', 'QR'];
    const bar = CARD.barFrom([
      { label: 'Call', icon: ic.phone, cA: '#F5F5FA', cM: '#0F172A' },
      { label: 'WhatsApp', icon: ic.wa, cA: '#4ADE80', cM: '#15803D' },
      { label: 'Save', icon: ic.userPlus, cA: '#F5F5FA', cM: '#0F172A' },
    ]);
    return {
      frames: FR,
      ic,
      qr: this.qr(),
      sparkA: grad('#A996FF', '#22D3EE', 14, 'ga1'),
      sparkAL: grad('#A996FF', '#22D3EE', 24, 'ga2'),
      sparkM: grad('#2563EB', '#7C3AED', 14, 'gm1'),
      sparkML: grad('#2563EB', '#7C3AED', 18, 'gm2'),
      sparkB: svg(P.spark, 14, 2.4),
      sparkBL: svg(P.spark, 26, 2.4),
      quick: CARD.quickFrom([
        { label: 'Call', icon: ic.phone, cA: '#F5F5FA', cM: '#0F172A', bB: '#FFFFFF' },
        { label: 'WhatsApp', icon: ic.wa, cA: '#4ADE80', cM: '#15803D', bB: '#3DDC97' },
        { label: 'Email', icon: ic.mail, cA: '#F5F5FA', cM: '#0F172A', bB: '#FFD23F' },
        { label: 'Location', icon: ic.pin, cA: '#F5F5FA', cM: '#0F172A', bB: '#FF5C39' },
      ]),
      socials: CARD.socialsFrom(),
      nav: CARD.navFrom(navLabels.map((label) => ({ label }))).map((n, i) => {
        const a = i === 0;
        return {
          ...n,
          aBg: a ? 'linear-gradient(90deg,#7C5CFF,#22D3EE)' : 'rgba(255,255,255,.06)',
          aFg: a ? '#0B0B14' : '#E4E4EE',
          aBorder: a ? 'none' : '1px solid rgba(255,255,255,.12)',
          mFg: a ? '#0F172A' : '#64748B',
          mLine: a ? 'inset 0 -2px 0 #2563EB' : 'none',
          bBg: a ? '#111' : '#FFF4E0',
          bFg: a ? '#FFF4E0' : '#111',
        };
      }),
      stats: CARD.fill(CARD.stats, [
        { mDiv: 'none', bBg: '#FFD23F', rot: '-4deg' },
        { mDiv: '1px solid #E2E8F0', bBg: '#3DDC97', rot: '3deg' },
        { mDiv: '1px solid #E2E8F0', bBg: '#FF5C39', rot: '-2deg' },
      ]),
      skills: CARD.skills,
      services: CARD.fill(CARD.services, [
        {
          icon: ic.code,
          bento: 'span 2',
          aBorder: 'linear-gradient(160deg, rgba(255,255,255,.24), rgba(255,255,255,.04))',
          bBg: '#FFD23F',
        },
        {
          icon: ic.mobile,
          bento: 'span 1',
          aBorder: 'linear-gradient(160deg, rgba(255,255,255,.24), rgba(255,255,255,.04))',
          bBg: '#3DDC97',
        },
        {
          icon: ic.trend,
          bento: 'span 1',
          aBorder: 'linear-gradient(160deg, rgba(255,255,255,.24), rgba(255,255,255,.04))',
          bBg: '#FFFFFF',
        },
        { icon: ic.cpu, bento: 'span 2', aBorder: 'linear-gradient(135deg, #7C5CFF, #22D3EE)', bBg: '#FF5C39' },
      ]).map((sv, i, all) => (i === all.length - 1 && i % 4 === 0 ? { ...sv, bento: 'span 3' } : sv)),
      projects: CARD.projects,
      reels: CARD.fill(CARD.reels, [
        { bgA: 'linear-gradient(160deg,#2A2350,#0E0E1C)', bgM: 'linear-gradient(160deg,#94A3B8,#334155)', bgB: '#FFD23F' },
        { bgA: 'linear-gradient(160deg,#0E3A4A,#0B0B14)', bgM: 'linear-gradient(160deg,#CBD5E1,#475569)', bgB: '#3DDC97' },
        { bgA: 'linear-gradient(160deg,#3A1F5C,#0B0B14)', bgM: 'linear-gradient(160deg,#64748B,#1E293B)', bgB: '#FF5C39' },
      ]),
      portfolio: CARD.fill(CARD.photos, [
        { r: 2, c: 1, bB: '#FFD23F' },
        { r: 1, c: 1, bB: '#FFFFFF' },
        { r: 1, c: 1, bB: '#3DDC97' },
        { r: 1, c: 2, bB: '#FF5C39' },
        { r: 1, c: 2, bB: '#FFFFFF' },
        { r: 2, c: 1, bB: '#3DDC97' },
        { r: 1, c: 2, bB: '#FFD23F' },
      ]),
      portfolioM: CARD.photos,
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
    };
  }
}

export function AuroraAI(props) {
  const V = useDC(Logic, props);
  const { openChat, closeChat, ...live } = useLive();
  const f = liveFrame(V.frames, live, props);
  const chat = useChat();
  return themeTree(props.__theme, (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        borderRadius: 0,
        overflow: 'clip',
        background: '#0B0B14',
        color: '#F5F5FA',
        fontFamily: "'Inter',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div style={{ position: 'relative', height: `${f?.coverTotal}px`, overflow: 'hidden', background: '#0B0B14' }}>
        <div
          style={{
            position: 'absolute',
            left: '-30%',
            top: '-40%',
            width: '90%',
            height: '120%',
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(124,92,255,.85), rgba(124,92,255,0))',
            animation: 'a_auA 11s ease-in-out infinite alternate',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            right: '-30%',
            top: '-30%',
            width: '90%',
            height: '120%',
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(34,211,238,.7), rgba(34,211,238,0))',
            animation: 'a_auB 13s ease-in-out infinite alternate',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            left: '10%',
            bottom: '-60%',
            width: '80%',
            height: '110%',
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(67,56,202,.9), rgba(67,56,202,0))',
            animation: 'a_auC 9s ease-in-out infinite alternate',
          }}
        ></div>
        <ImageSlot
          id={`t1-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Optional photo blend'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '.18', mixBlendMode: 'luminosity' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            opacity: '.22',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom, rgba(11,11,20,.35) 0%, rgba(11,11,20,0) 35%, rgba(11,11,20,0) 55%, #0B0B14 100%)',
            pointerEvents: 'none',
          }}
        ></div>
        {CARD.company ? (
          <div
            style={{
              position: 'absolute',
              top: `${f?.chipTop}px`,
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 12px 4px 4px',
              borderRadius: '999px',
              background: 'rgba(11,11,20,.55)',
              border: '1px solid rgba(255,255,255,.14)',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#fff',
            }}
          >
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
              <ImageSlot id={`t1-logo-${f?.key}`} shape={'circle'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
            </div>
            <span>{CARD.company}</span>
          </div>
        ) : null}
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 'calc(clamp(96px, 28cqi, 112px) / -2)' }}>
        <div
          style={{
            width: 'clamp(96px, 28cqi, 112px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '3px',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg,#7C5CFF,#22D3EE)',
            boxShadow: '0 0 28px rgba(124,92,255,.45)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#16162A',
              border: '3px solid #0B0B14',
              boxSizing: 'border-box',
            }}
          >
            <ImageSlot id={`t1-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div
        style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4px 8px' }}>
          <h1
            style={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0',
              paddingBottom: '0.08em',
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: '600',
              fontSize: CARD.nameSize('clamp(26px, 7.4cqi, 30px)'),
              lineHeight: '1.12',
              letterSpacing: '-0.02em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#67E8F9' }}></span>
          {CARD.ai.enabled ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 9px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#15152A,#15152A) padding-box, linear-gradient(135deg,#7C5CFF,#22D3EE) border-box',
              }}
            >
              <span dangerouslySetInnerHTML={V.sparkA} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
        {CARD.roleLine ? <p style={{ margin: '0', fontSize: '14.5px', fontWeight: '500', color: '#A6A6BD' }}>{CARD.roleLine}</p> : null}
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '2px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#E4E4EE',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textWrap: 'pretty',
            }}
          >
            {CARD.bio}
          </p>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '44px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '600', color: '#67E8F9' }}
              className="dcp-a0"
            >
              {'Read more'}
            </a>
          ) : null}
          {CARD.ai.enabled ? (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat();
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '32px',
                padding: '0 12px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#15152A,#15152A) padding-box, linear-gradient(135deg,#7C5CFF,#22D3EE) border-box',
              }}
              className="dcp-a1"
            >
              <span dangerouslySetInnerHTML={V.sparkA} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '8px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              className="dcp-a2"
            >
              <span
                dangerouslySetInnerHTML={q?.icon}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: q?.cA,
                  border: '1px solid transparent',
                  background:
                    'linear-gradient(rgba(255,255,255,.06),rgba(255,255,255,.06)) padding-box, linear-gradient(#0B0B14,#0B0B14) padding-box, linear-gradient(160deg, rgba(255,255,255,.28), rgba(255,255,255,.05)) border-box',
                  boxSizing: 'border-box',
                }}
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#A6A6BD' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px 16px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E4E4EE',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.12)',
                boxSizing: 'border-box',
              }}
            ></a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '10px', padding: '10px 16px 0' }}>
        <button
          onClick={saveContact}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            borderRadius: '999px',
            background: 'linear-gradient(90deg,#7C5CFF,#22D3EE)',
            color: '#0B0B14',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124,92,255,.35)',
          }}
          className="dcp-a3"
        >
          <span dangerouslySetInnerHTML={V.ic?.userPlus} style={{ display: 'flex' }}></span>
          {'Save Contact'}
        </button>
        <button
          onClick={shareCard}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,.22)',
            background: 'rgba(255,255,255,.06)',
            color: '#F5F5FA',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-a4"
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          {'Share'}
        </button>
      </div>
      {f?.profile ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflow: 'hidden',
              padding: '18px 16px 10px',
              marginTop: '6px',
              borderBottom: '1px solid rgba(255,255,255,.08)',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#0B0B14',
            }}
          >
            {(V.nav || []).map((n, $index) => (
              <React.Fragment key={$index}>
                <span
                  onClick={n?.go}
                  role="button"
                  style={{
                    flexShrink: '0',
                    height: '36px',
                    position: 'relative',
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: n?.aBg,
                    color: n?.aFg,
                    border: n?.aBorder,
                  }}
                  className="dcp-a5"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Profile'}
              </h3>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '20px',
                  border: '1px solid transparent',
                  background:
                    'linear-gradient(rgba(255,255,255,.05),rgba(255,255,255,.05)) padding-box, linear-gradient(#0B0B14,#0B0B14) padding-box, linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.04)) border-box',
                }}
              >
                {CARD.bio ? (
                  <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', color: '#E4E4EE' }}>
                    {CARD.bio}
                  </p>
                ) : null}
                {V.stats?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '8px', marginTop: '14px' }}>
                    {(V.stats || []).map((st, $index) => (
                      <React.Fragment key={$index}>
                        <div
                          style={{
                            padding: '10px 12px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,.05)',
                            border: '1px solid rgba(255,255,255,.1)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Space Grotesk',sans-serif",
                              fontSize: '22px',
                              fontWeight: '600',
                              background: 'linear-gradient(90deg,#A996FF,#67E8F9)',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent',
                            }}
                          >
                            {st?.v}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#A6A6BD' }}>{st?.l}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {V.skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                    {(V.skills || []).map((sk, $index) => (
                      <React.Fragment key={$index}>
                        <span
                          style={{
                            height: '30px',
                            padding: '0 11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '999px',
                            fontSize: '13px',
                            background: 'rgba(255,255,255,.07)',
                            color: '#E4E4EE',
                          }}
                        >
                          {sk}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {CARD.location || CARD.languages.length ? (
                  <div style={{ marginTop: '12px', fontSize: '14px', color: '#A6A6BD' }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <span style={{ color: '#F5F5FA', fontWeight: '600' }}>{CARD.languages.join(' · ')}</span>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <span style={{ color: '#F5F5FA', fontWeight: '600' }}>{CARD.location}</span>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Services'}
              </h3>
              <ServiceSlides items={CARD.services} />
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Testimonials'}
              </h3>
              <TestimonialSlides items={CARD.testimonials} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Projects'}
              </h3>
              <SwipeRow
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  margin: '0 -16px',
                  padding: '0 16px 6px',
                  scrollPadding: '0 16px',
                }}
              >
                {(V.projects || []).map((p, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={p?.url ? openLink(p.url) : undefined}
                      style={{
                        flex: '0 0 82%',
                        scrollSnapAlign: 'start',
                        minWidth: 0,
                        cursor: p?.url ? 'pointer' : undefined,
                        display: 'flex',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: '18px',
                        border: '1px solid transparent',
                        background:
                          'linear-gradient(rgba(255,255,255,.05),rgba(255,255,255,.05)) padding-box, linear-gradient(#0B0B14,#0B0B14) padding-box, linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.04)) border-box',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          width: '88px',
                          flexShrink: '0',
                          aspectRatio: '1',
                          borderRadius: '12px',
                          background: 'repeating-linear-gradient(135deg,#17172C 0 10px,#1F1F38 10px 11px)',
                        }}
                      >
                        <Fill src={p?.image} alt={p?.title} />
                      </div>
                      <div style={{ minWidth: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                        {p?.tag ? (
                          <span
                            style={{
                              alignSelf: 'flex-start',
                              height: '22px',
                              padding: '0 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              background: 'rgba(255,255,255,.08)',
                              color: '#C9C9DA',
                            }}
                          >
                            {p?.tag}
                          </span>
                        ) : null}
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{p?.title}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#5EEAD4' }}>{p?.result}</div>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat();
                            }}
                            style={{
                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              color: '#C9C9DA',
                            }}
                            className="dcp-a8"
                          >
                            <span dangerouslySetInnerHTML={V.sparkA} style={{ display: 'flex' }}></span>
                            {'Ask AI about this'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Featured Videos'}
              </h3>
              <div
                data-wc-reels="1"
                style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', marginRight: '-16px' }}
              >
                {(V.reels || []).map((r, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={r?.kind === 'external' ? openLink(r.href) : undefined}
                      role="button"
                      style={{
                        cursor: 'pointer',
                        flex: '0 0 42%',
                        aspectRatio: '9/16',
                        borderRadius: '18px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.bgA,
                        border: '1px solid rgba(255,255,255,.1)',
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          height: '22px',
                          padding: '0 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: '999px',
                          background: 'rgba(0,0,0,.55)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {r?.platform}
                      </span>
                      <span
                        dangerouslySetInnerHTML={V.ic?.play}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%,-50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,.92)',
                          color: '#0B0B14',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      ></span>
                      <span
                        style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          padding: '28px 10px 10px',
                          background: 'linear-gradient(to top, rgba(0,0,0,.75), transparent)',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#fff',
                        }}
                      >
                        {r?.title}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {CARD.photos.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Portfolio'}
              </h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'Contact'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <EnquiryForm
                  fieldStyle={{
                    height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,.05)',
                    border: '1px solid rgba(255,255,255,.14)',
                  }}
                  placeholderColor={'#A6A6BD'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg,#7C5CFF,#22D3EE)',
                    color: '#0B0B14',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                  buttonClass="dcp-a9"
                  buttonLabel={'Send message'}
                  messageHeight="108px"
                />
                {CARD.href.WhatsApp ? (
                  <a
                    href={CARD.href.WhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#E4E4EE',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#4ADE80' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '20px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '20px', fontWeight: '600' }}>
                {'QR code'}
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '20px 16px',
                  borderRadius: '20px',
                  border: '1px solid transparent',
                  background:
                    'radial-gradient(70% 60% at 50% 0%, rgba(124,92,255,.18), transparent) padding-box, linear-gradient(#0F0F1C,#0F0F1C) padding-box, linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.04)) border-box',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '176px',
                    height: '176px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    background: '#fff',
                    borderRadius: '16px',
                  }}
                >
                  <CardQR style={{ width: '100%', height: '100%' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '3px solid #fff',
                      background: 'linear-gradient(135deg,#7C5CFF,#22D3EE)',
                      color: '#0B0B14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: '700',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#A6A6BD' }}>{CARD.cardUrl.replace(/^https?:\/\//, '')}</div>
                <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '48px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,.22)',
                      background: 'rgba(255,255,255,.06)',
                      color: '#F5F5FA',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      height: '48px',
                      borderRadius: '999px',
                      border: 'none',
                      background: '#F5F5FA',
                      color: '#0B0B14',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{ fontFamily: "'Space Grotesk',sans-serif" }} />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', color: '#A6A6BD' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#F5F5FA', fontWeight: '600' }}>
                  {'Aicardly'}
                </a>
              </div>
            ) : null}
            {CARD.branding ? (
              <a
                href={'/register'}
                style={{
                  display: 'inline-flex',
                  minHeight: '44px',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#67E8F9',
                }}
              >
                {'Get your own Aicardly card →'}
              </a>
            ) : null}
          </div>
          {V.barCols > 0 ? (
            <div
              style={{
                position: 'fixed',
                left: '0',
                right: '0',
                bottom: '0',
                height: '84px',
                transform: f?.barHidden ? 'translateY(110%)' : 'none',
                transition: 'transform 200ms ease-out',
                paddingBottom: '20px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: `repeat(${V.barCols},1fr)`,
                background: 'rgba(11,11,20,.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(255,255,255,.1)',
                zIndex: '5',
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {(V.bar || []).map((b, $index) => (
                <React.Fragment key={$index}>
                  <span
                    onClick={b?.go}
                    role="button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#E4E4EE',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex', color: b?.cA }}></span>
                    {b?.label}
                  </span>
                </React.Fragment>
              ))}
              {CARD.ai.enabled ? (
                <span
                  onClick={openChat}
                  role="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#E4E4EE',
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={V.ic?.sparkS}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#7C5CFF,#22D3EE)',
                      color: '#0B0B14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  ></span>
                  {'AI'}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.launch ? (
        <>
          <div
            onClick={openChat}
            style={{
              position: 'fixed',
              right: 'calc(max(0px, (var(--wc-vw, 100vw) - 480px) / 2) + 16px)',
              bottom: `${f?.launchBottom}px`,
              zIndex: '6',
              cursor: 'pointer',
            }}
          >
            {f?.tip ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    bottom: '68px',
                    width: 'max-content',
                    padding: '10px 12px',
                    borderRadius: '14px 14px 4px 14px',
                    background: '#F5F5FA',
                    color: '#0B0B14',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(0,0,0,.35)',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                animation: 'a_orbPulse 2.4s ease-out infinite',
                boxShadow: '0 0 30px rgba(124,92,255,.5)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: '0',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg,#7C5CFF,#22D3EE,#7C5CFF)',
                  animation: 'a_orbSpin 5s linear infinite',
                }}
              ></span>
              <span
                dangerouslySetInnerHTML={V.sparkAL}
                style={{
                  position: 'absolute',
                  inset: '3px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #2A2350, #0B0B14 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              ></span>
            </div>
          </div>
        </>
      ) : null}
      {f?.chat ? (
        <>
          <div
            onClick={closeChat}
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '40',
              background: 'rgba(5,5,12,.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: '0',
              right: '0',
              cursor: 'pointer',
            }}
          ></div>
          <div
            style={{
              position: 'fixed',
              left: '0',
              right: '0',
              bottom: '0',
              height: '85%',
              zIndex: '41',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background:
                'radial-gradient(80% 30% at 25% 0%, rgba(124,92,255,.42), transparent 70%), radial-gradient(60% 26% at 85% 0%, rgba(34,211,238,.3), transparent 70%), #11111E',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,.25)' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 6px 12px 16px',
                borderBottom: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  padding: '2px',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg,#7C5CFF,#22D3EE)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#16162A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  {CARD.initials}
                </div>
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontSize: '15.5px', fontWeight: '600' }}>{`${CARD.firstName}'s AI Assistant`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#A6A6BD' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }}></span>
                  {'Online · replies instantly'}
                </div>
              </div>

              <ChatCallButtons />
              <span
                dangerouslySetInnerHTML={V.ic?.x}
                onClick={closeChat}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ></span>
            </div>
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <ChatThread
                chat={chat}
                bot={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '84%',
                      padding: '10px 13px',
                      borderRadius: '18px 18px 18px 6px',
                      background: 'rgba(255,255,255,.08)',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    <ChatText text={text} />
                  </div>
                )}
                user={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '84%',
                      padding: '10px 13px',
                      borderRadius: '18px 18px 6px 18px',
                      background: 'linear-gradient(90deg,#7C5CFF,#5B8CFF)',
                      color: '#fff',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    {text}
                  </div>
                )}
                typing={
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      gap: '5px',
                      padding: '13px 15px',
                      borderRadius: '18px 18px 18px 6px',
                      background: 'rgba(255,255,255,.08)',
                    }}
                  >
                    <span
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#A6A6BD', animation: 'a_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#A6A6BD',
                        animation: 'a_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#A6A6BD',
                        animation: 'a_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px 4px' }}>
              {chat.chips.map((c, $index) => (
                <React.Fragment key={$index}>
                  <span
                    role="button"
                    onClick={() => chat.send(c)}
                    style={{
                      flexShrink: '0',
                      height: '38px',
                      position: 'relative',
                      padding: '0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '999px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      border: '1px solid transparent',
                      background: 'linear-gradient(#15152A,#15152A) padding-box, linear-gradient(135deg,#7C5CFF,#22D3EE) border-box',
                    }}
                    className="dcp-a11"
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 30px' }}>
              <div
                style={{
                  flex: '1',
                  height: '48px',
                  borderRadius: '24px',
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.12)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px 0 16px',
                  boxSizing: 'border-box',
                }}
              >
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={`Ask anything about ${CARD.firstName}…`}
                  enterKeyHint="send"
                  aria-label="Message"
                  className="wc-chat-input"
                  style={{
                    flex: '1',
                    minWidth: 0,
                    height: '100%',
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    fontSize: '16px',
                    '--wc-ph': '#8A8AA3',
                  }}
                />
              </div>
              <span
                role="button"
                aria-label="Send"
                onClick={chat.submit}
                dangerouslySetInnerHTML={V.ic?.send}
                style={{
                  cursor: 'pointer',
                  opacity: chat.busy ? 0.6 : 1,
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7C5CFF,#22D3EE)',
                  color: '#0B0B14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              ></span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  ));
}

export function MinimalPro(props) {
  const V = useDC(Logic, props);
  const { openChat, closeChat, ...live } = useLive();
  const f = liveFrame(V.frames, live, props);
  const chat = useChat();
  return themeTree(props.__theme, (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        borderRadius: 0,
        overflow: 'clip',
        background: '#FFFFFF',
        color: '#0F172A',
        fontFamily: "'Inter',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: `${f?.coverH}px`,
          overflow: 'hidden',
          background: '#E2E8F0',
          filter: CARD.cover ? 'none' : 'grayscale(1) contrast(.92)',
        }}
      >
        <ImageSlot
          id={`t2-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Office / city photo'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 40%, #FFFFFF 100%)',
            pointerEvents: 'none',
          }}
        ></div>
      </div>
      {CARD.company ? (
        <div
          style={{
            position: 'absolute',
            top: `${f?.chipTopM}px`,
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '4px 12px 4px 4px',
            borderRadius: '10px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            fontSize: '12.5px',
            fontWeight: '600',
            boxShadow: '0 1px 2px rgba(15,23,42,.06)',
          }}
        >
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', overflow: 'hidden', background: '#F1F5F9' }}>
            <ImageSlot
              id={`t2-logo-${f?.key}`}
              shape={'rounded'}
              radius={'7'}
              placeholder={'Logo'}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <span>{CARD.company}</span>
        </div>
      ) : null}
      <div style={{ position: 'relative', padding: '0 16px', marginTop: 'calc(clamp(96px, 27cqi, 108px) / -2)' }}>
        <div
          style={{
            width: 'clamp(96px, 27cqi, 108px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '4px',
            boxSizing: 'border-box',
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(15,23,42,.12)',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9' }}>
            <ImageSlot id={`t2-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
          <h1
            style={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0',
              paddingBottom: '0.08em',
              fontWeight: '700',
              fontSize: CARD.nameSize('clamp(26px, 7.4cqi, 30px)'),
              lineHeight: '1.1',
              letterSpacing: '-0.035em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#2563EB' }}></span>
          {CARD.ai.enabled ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 9px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#2563EB,#7C3AED) border-box',
              }}
            >
              <span dangerouslySetInnerHTML={V.sparkM} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
        {CARD.roleLine ? <p style={{ margin: '0', fontSize: '14.5px', fontWeight: '500', color: '#64748B' }}>{CARD.roleLine}</p> : null}
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '2px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#334155',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textWrap: 'pretty',
            }}
          >
            {CARD.bio}
          </p>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '44px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '600', color: '#2563EB' }}
              className="dcp-a12"
            >
              {'Read more'}
            </a>
          ) : null}
          {CARD.ai.enabled ? (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat();
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '32px',
                padding: '0 11px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#2563EB,#7C3AED) border-box',
              }}
              className="dcp-a13"
            >
              <span dangerouslySetInnerHTML={V.sparkM} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '8px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              className="dcp-a14"
            >
              <span
                dangerouslySetInnerHTML={q?.icon}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: q?.cM,
                  border: '1px solid #E2E8F0',
                  boxSizing: 'border-box',
                }}
                className="dcp-a15"
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', padding: '10px 16px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                boxSizing: 'border-box',
              }}
            ></a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '10px', padding: '10px 16px 0' }}>
        <button
          onClick={saveContact}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            borderRadius: '10px',
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-a16"
        >
          <span dangerouslySetInnerHTML={V.ic?.userPlus} style={{ display: 'flex' }}></span>
          {'Save Contact'}
        </button>
        <button
          onClick={shareCard}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#0F172A',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-a17"
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          {'Share'}
        </button>
      </div>
      {f?.profile ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '18px',
              overflow: 'hidden',
              padding: '0 16px',
              marginTop: '20px',
              borderBottom: '1px solid #E2E8F0',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#FFFFFF',
            }}
          >
            {(V.nav || []).map((n, $index) => (
              <React.Fragment key={$index}>
                <span
                  onClick={n?.go}
                  role="button"
                  style={{
                    flexShrink: '0',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: n?.mFg,
                    boxShadow: n?.mLine,
                  }}
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '600', letterSpacing: '-0.01em' }}>{'Profile'}</h3>
              {CARD.bio ? (
                <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.65', color: '#334155' }}>
                  {CARD.bio}
                </p>
              ) : null}
              {V.stats?.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    marginTop: '18px',
                    borderTop: '1px solid #E2E8F0',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  {(V.stats || []).map((st, $index) => (
                    <React.Fragment key={$index}>
                      <div style={{ padding: '14px 0 14px 12px', borderLeft: st?.mDiv }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.03em' }}>{st?.v}</div>
                        <div style={{ fontSize: '12.5px', color: '#64748B' }}>{st?.l}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
              {V.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                  {(V.skills || []).map((sk, $index) => (
                    <React.Fragment key={$index}>
                      <span
                        style={{
                          height: '30px',
                          padding: '0 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                          fontSize: '13px',
                          border: '1px solid #E2E8F0',
                          color: '#334155',
                        }}
                      >
                        {sk}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
              {CARD.location || CARD.languages.length ? (
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748B' }}>
                  {CARD.languages.length ? (
                    <>
                      {'Speaks '}
                      <span style={{ color: '#0F172A', fontWeight: '600' }}>{CARD.languages.join(' · ')}</span>
                      {CARD.location ? ' · ' : ''}
                    </>
                  ) : null}
                  {CARD.location ? (
                    <>
                      {'Based in '}
                      <span style={{ color: '#0F172A', fontWeight: '600' }}>{CARD.location}</span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600' }}>{'Services'}</h3>
              <ServiceSlides items={CARD.services} />
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600' }}>{'Testimonials'}</h3>
              <TestimonialSlides items={CARD.testimonials} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600' }}>{'Projects'}</h3>
              <SwipeRow
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  margin: '0 -16px',
                  padding: '0 16px 6px',
                  scrollPadding: '0 16px',
                }}
              >
                {(V.projects || []).map((p, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={p?.url ? openLink(p.url) : undefined}
                      style={{
                        flex: '0 0 82%',
                        scrollSnapAlign: 'start',
                        minWidth: 0,
                        cursor: p?.url ? 'pointer' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 0',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          width: '72px',
                          flexShrink: '0',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          background: 'repeating-linear-gradient(135deg,#F1F5F9 0 10px,#E2E8F0 10px 11px)',
                        }}
                      >
                        <Fill src={p?.image} alt={p?.title} />
                      </div>
                      <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {p?.tag ? (
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: '600',
                              letterSpacing: '.04em',
                              textTransform: 'uppercase',
                              color: '#64748B',
                            }}
                          >
                            {p?.tag}
                          </span>
                        ) : null}
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{p?.title}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#15803D' }}>{p?.result}</div>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat();
                            }}
                            style={{
                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              color: '#475569',
                            }}
                            className="dcp-a20"
                          >
                            <span dangerouslySetInnerHTML={V.sparkM} style={{ display: 'flex' }}></span>
                            {'Ask AI about this'}
                          </span>
                        ) : null}
                      </div>
                      <span dangerouslySetInnerHTML={V.ic?.chevR} style={{ display: 'flex', color: '#94A3B8' }}></span>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>{'Featured Videos'}</h3>
              <div
                data-wc-reels="1"
                style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', marginRight: '-16px' }}
              >
                {(V.reels || []).map((r, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={r?.kind === 'external' ? openLink(r.href) : undefined}
                      role="button"
                      style={{
                        cursor: 'pointer',
                        flex: '0 0 42%',
                        aspectRatio: '9/16',
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.bgM,
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          height: '22px',
                          padding: '0 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                          background: 'rgba(15,23,42,.7)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {r?.platform}
                      </span>
                      <span
                        dangerouslySetInnerHTML={V.ic?.play}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%,-50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#fff',
                          color: '#0F172A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,.2)',
                        }}
                      ></span>
                      <span
                        style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          padding: '28px 10px 10px',
                          background: 'linear-gradient(to top, rgba(15,23,42,.8), transparent)',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#fff',
                        }}
                      >
                        {r?.title}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {CARD.photos.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>{'Portfolio'}</h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>{'Contact'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                  placeholderColor={'#64748B'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#0F172A',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                  buttonClass="dcp-a21"
                  buttonLabel={'Send message'}
                  messageHeight="108px"
                />
                {CARD.href.WhatsApp ? (
                  <a
                    href={CARD.href.WhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0F172A',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#15803D' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>{'QR code'}</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '128px',
                    height: '128px',
                    flexShrink: '0',
                    padding: '8px',
                    boxSizing: 'border-box',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                >
                  <CardQR style={{ width: '100%', height: '100%' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      border: '2px solid #fff',
                      background: '#0F172A',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{'Scan to open this card'}</div>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#fff',
                      color: '#0F172A',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0F172A',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{}} />
          <div style={{ padding: '32px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#0F172A', fontWeight: '600' }}>
                  {'Aicardly'}
                </a>
              </div>
            ) : null}
            {CARD.branding ? (
              <a
                href={'/register'}
                style={{
                  display: 'inline-flex',
                  minHeight: '44px',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2563EB',
                }}
              >
                {'Get your own Aicardly card →'}
              </a>
            ) : null}
          </div>
          {V.barCols > 0 ? (
            <div
              style={{
                position: 'fixed',
                left: '0',
                right: '0',
                bottom: '0',
                height: '84px',
                transform: f?.barHidden ? 'translateY(110%)' : 'none',
                transition: 'transform 200ms ease-out',
                paddingBottom: '20px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: `repeat(${V.barCols},1fr)`,
                background: 'rgba(255,255,255,.86)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderTop: '1px solid #E2E8F0',
                zIndex: '5',
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {(V.bar || []).map((b, $index) => (
                <React.Fragment key={$index}>
                  <span
                    onClick={b?.go}
                    role="button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#0F172A',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex', color: b?.cM }}></span>
                    {b?.label}
                  </span>
                </React.Fragment>
              ))}
              {CARD.ai.enabled ? (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChat();
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#0F172A',
                  }}
                  className="dcp-a22"
                >
                  <span dangerouslySetInnerHTML={V.sparkML} style={{ display: 'flex' }}></span>
                  {'Ask AI'}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.launch ? (
        <>
          <div
            onClick={openChat}
            style={{
              position: 'fixed',
              right: 'calc(max(0px, (var(--wc-vw, 100vw) - 480px) / 2) + 16px)',
              bottom: `${f?.launchBottom}px`,
              zIndex: '6',
              cursor: 'pointer',
            }}
          >
            {f?.tip ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    bottom: '60px',
                    width: 'max-content',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(15,23,42,.25)',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              style={{
                height: '48px',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '12px',
                border: '1px solid transparent',
                background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#2563EB,#7C3AED) border-box',
                boxShadow: '0 8px 24px rgba(15,23,42,.14)',
                fontSize: '14.5px',
                fontWeight: '600',
                color: '#0F172A',
              }}
            >
              <span dangerouslySetInnerHTML={V.sparkML} style={{ display: 'flex' }}></span>
              {'Ask AI '}
            </div>
          </div>
        </>
      ) : null}
      {f?.chat ? (
        <>
          <div
            onClick={closeChat}
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '40',
              background: 'rgba(15,23,42,.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: '0',
              right: '0',
              cursor: 'pointer',
            }}
          ></div>
          <div
            style={{
              position: 'fixed',
              left: '0',
              right: '0',
              bottom: '0',
              height: '85%',
              zIndex: '41',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              color: '#0F172A',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#2563EB,#60A5FA,#7C3AED)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#CBD5E1' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 6px 12px 16px',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#0F172A',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                {CARD.initials}
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontSize: '15.5px', fontWeight: '600' }}>{`${CARD.firstName}'s AI Assistant`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748B' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                  {'Online · replies instantly'}
                </div>
              </div>

              <ChatCallButtons />
              <span
                dangerouslySetInnerHTML={V.ic?.x}
                onClick={closeChat}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ></span>
            </div>
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <ChatThread
                chat={chat}
                bot={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '84%',
                      padding: '10px 13px',
                      borderRadius: '14px 14px 14px 4px',
                      background: '#F1F5F9',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    <ChatText text={text} />
                  </div>
                )}
                user={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '84%',
                      padding: '10px 13px',
                      borderRadius: '14px 14px 4px 14px',
                      background: '#0F172A',
                      color: '#fff',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    {text}
                  </div>
                )}
                typing={
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      gap: '5px',
                      padding: '13px 15px',
                      borderRadius: '14px 14px 14px 4px',
                      background: '#F1F5F9',
                    }}
                  >
                    <span
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#64748B', animation: 'a_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#64748B',
                        animation: 'a_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#64748B',
                        animation: 'a_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px 4px' }}>
              {chat.chips.map((c, $index) => (
                <React.Fragment key={$index}>
                  <span
                    role="button"
                    onClick={() => chat.send(c)}
                    style={{
                      flexShrink: '0',
                      height: '38px',
                      position: 'relative',
                      padding: '0 13px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      color: '#1E3A8A',
                      border: '1px solid #BFDBFE',
                      background: '#EFF6FF',
                    }}
                    className="dcp-a24"
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 30px' }}>
              <div
                style={{
                  flex: '1',
                  height: '48px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px 0 14px',
                  boxSizing: 'border-box',
                }}
              >
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={`Ask anything about ${CARD.firstName}…`}
                  enterKeyHint="send"
                  aria-label="Message"
                  className="wc-chat-input"
                  style={{
                    flex: '1',
                    minWidth: 0,
                    height: '100%',
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    fontSize: '16px',
                    '--wc-ph': '#64748B',
                  }}
                />
              </div>
              <span
                role="button"
                aria-label="Send"
                onClick={chat.submit}
                dangerouslySetInnerHTML={V.ic?.send}
                style={{
                  cursor: 'pointer',
                  opacity: chat.busy ? 0.6 : 1,
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              ></span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  ));
}

export function NeoBrutal(props) {
  const V = useDC(Logic, props);
  const { openChat, closeChat, ...live } = useLive();
  const f = liveFrame(V.frames, live, props);
  const chat = useChat();
  return themeTree(props.__theme, (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        borderRadius: 0,
        overflow: 'clip',
        background: '#FFF4E0',
        color: '#111111',
        fontFamily: "'Inter',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: `${f?.coverHB}px`,
          overflow: 'hidden',
          background: '#FF5C39',
          borderBottom: '2px solid #111',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-28px',
            top: '-36px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: '#FFD23F',
            border: '2px solid #111',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            left: '46%',
            bottom: '-14px',
            width: '84px',
            height: '84px',
            background: '#3DDC97',
            border: '2px solid #111',
            transform: 'rotate(18deg)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            left: '18%',
            top: '38%',
            width: '0',
            height: '0',
            borderLeft: '26px solid transparent',
            borderRight: '26px solid transparent',
            borderBottom: '44px solid #111',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            right: '24%',
            bottom: '22%',
            width: '64px',
            height: '32px',
            borderRadius: '32px 32px 0 0',
            background: '#FFF4E0',
            border: '2px solid #111',
            borderBottom: 'none',
          }}
        ></div>
        <CoverImage />
        {CARD.company ? (
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 10px 4px 4px',
              background: '#FFF4E0',
              border: '2px solid #111',
              boxShadow: '3px 3px 0 #111',
              fontSize: '12.5px',
              fontWeight: '700',
            }}
          >
            <div style={{ width: '24px', height: '24px', overflow: 'hidden', background: '#fff', border: '1.5px solid #111' }}>
              <ImageSlot id={`t3-logo-${f?.key}`} shape={'rect'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
            </div>
            <span>{CARD.company}</span>
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '0 16px' }}>
        <div style={{ paddingTop: '12px', minWidth: '0' }}>
          <h1
            style={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0',
              paddingBottom: '0.08em',
              fontFamily: "'Archivo',sans-serif",
              fontStretch: '62%',
              fontVariationSettings: "'wdth' 62",
              fontWeight: '900',
              fontSize: CARD.nameSize('clamp(42px, 12.8cqi, 54px)', true),
              lineHeight: '.9',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            {CARD.firstName}
            {CARD.restName ? (
              <>
                <br />
                {CARD.restName}
              </>
            ) : null}
          </h1>
        </div>
        <div
          style={{
            flexShrink: '0',
            position: 'relative', // paint above the (positioned) banner it overlaps
            zIndex: 2,
            alignSelf: 'flex-start', // keep it round (the row would stretch it into an oval)
            marginTop: 'calc(clamp(92px, 26cqi, 104px) / -2)',
            width: 'clamp(92px, 26cqi, 104px)',
            aspectRatio: '1',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#FFD23F',
            border: '3px solid #111',
            boxShadow: '4px 4px 0 #111',
            boxSizing: 'border-box',
          }}
        >
          <ImageSlot id={`t3-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {CARD.roleLine ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '15px', fontWeight: '700' }}>{CARD.roleLine}</span>
          </div>
        ) : null}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              fontSize: '11.5px',
              fontWeight: '700',
              background: '#FFF',
              border: '2px solid #111',
            }}
          >
            <span dangerouslySetInnerHTML={V.ic?.badgeS} style={{ display: 'flex' }}></span>
            {'Verified'}
          </span>
          {CARD.ai.enabled ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                fontSize: '11.5px',
                fontWeight: '700',
                background: 'linear-gradient(90deg,#FFD23F,#3DDC97)',
                border: '2px solid #111',
              }}
            >
              <span dangerouslySetInnerHTML={V.sparkB} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '4px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#2A2620',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textWrap: 'pretty',
            }}
          >
            {CARD.bio}
          </p>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '44px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '700', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              className="dcp-a25"
            >
              {'Read more'}
            </a>
          ) : null}
          {CARD.ai.enabled ? (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                openChat();
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '32px',
                padding: '0 10px',
                fontSize: '13px',
                fontWeight: '700',
                background: 'linear-gradient(90deg,#FFD23F,#3DDC97)',
                border: '2px solid #111',
                boxShadow: '2px 2px 0 #111',
                transform: 'rotate(-1.5deg)',
              }}
              className="dcp-a26"
            >
              <span dangerouslySetInnerHTML={V.sparkB} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '10px', padding: '8px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
            >
              <span
                dangerouslySetInnerHTML={q?.icon}
                style={{
                  width: '100%',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: q?.bB,
                  color: '#111',
                  border: '2px solid #111',
                  boxShadow: '3px 3px 0 #111',
                  boxSizing: 'border-box',
                }}
                className="dcp-a27"
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '700' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', padding: '10px 16px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                border: '2px solid #111',
                boxSizing: 'border-box',
              }}
            ></a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '12px', padding: '12px 20px 0 16px' }}>
        <button
          onClick={saveContact}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '2px solid #111',
            borderRadius: '10px',
            background: '#FF5C39',
            color: '#111',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #111',
          }}
          className="dcp-a28"
        >
          <span dangerouslySetInnerHTML={V.ic?.userPlus} style={{ display: 'flex' }}></span>
          {'Save Contact'}
        </button>
        <button
          onClick={shareCard}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            border: '2px solid #111',
            borderRadius: '10px',
            background: '#FFFFFF',
            color: '#111',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #111',
          }}
          className="dcp-a29"
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          {'Share'}
        </button>
      </div>
      {f?.profile ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflow: 'hidden',
              padding: '12px 16px',
              marginTop: '18px',
              borderTop: '2px solid #111',
              borderBottom: '2px solid #111',
              background: '#FFF4E0',
              position: 'sticky',
              top: '0',
              zIndex: '4',
            }}
          >
            {(V.nav || []).map((n, $index) => (
              <React.Fragment key={$index}>
                <span
                  onClick={n?.go}
                  role="button"
                  style={{
                    flexShrink: '0',
                    height: '36px',
                    position: 'relative',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid #111',
                    fontSize: '14px',
                    fontWeight: '700',
                    background: n?.bBg,
                    color: n?.bFg,
                  }}
                  className="dcp-a30"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Profile'}
              </h3>
              <div
                style={{
                  padding: '16px',
                  background: '#FFFFFF',
                  border: '2px solid #111',
                  boxShadow: '4px 4px 0 #111',
                  borderRadius: '12px',
                }}
              >
                {CARD.bio ? (
                  <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.6' }}>
                    {CARD.bio}
                  </p>
                ) : null}
                {V.stats?.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                      gap: '10px',
                      marginTop: '18px',
                      padding: '0 2px',
                    }}
                  >
                    {(V.stats || []).map((st, $index) => (
                      <React.Fragment key={$index}>
                        <div
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            background: st?.bBg,
                            border: '2px solid #111',
                            boxShadow: '3px 3px 0 #111',
                            transform: `rotate(${st?.rot})`,
                          }}
                        >
                          <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: '22px' }}>{st?.v}</div>
                          <div style={{ fontSize: '12.5px', fontWeight: '700' }}>{st?.l}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {V.skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                    {(V.skills || []).map((sk, $index) => (
                      <React.Fragment key={$index}>
                        <span
                          style={{
                            height: '30px',
                            padding: '0 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: '2px solid #111',
                            background: '#FFF4E0',
                          }}
                        >
                          {sk}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {CARD.location || CARD.languages.length ? (
                  <div style={{ marginTop: '12px', fontSize: '14px' }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <b>{CARD.languages.join(' · ')}</b>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <b>{CARD.location}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Services'}
              </h3>
              <ServiceSlides items={CARD.services} />
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Testimonials'}
              </h3>
              <TestimonialSlides items={CARD.testimonials} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Projects'}
              </h3>
              <SwipeRow
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  margin: '0 -16px',
                  padding: '0 16px 6px',
                  scrollPadding: '0 16px',
                }}
              >
                {(V.projects || []).map((p, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={p?.url ? openLink(p.url) : undefined}
                      style={{
                        flex: '0 0 82%',
                        scrollSnapAlign: 'start',
                        minWidth: 0,
                        cursor: p?.url ? 'pointer' : undefined,
                        display: 'flex',
                        gap: '12px',
                        padding: '10px',
                        background: '#FFF',
                        border: '2px solid #111',
                        boxShadow: '4px 4px 0 #111',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          width: '84px',
                          flexShrink: '0',
                          aspectRatio: '1',
                          border: '2px solid #111',
                          borderRadius: '8px',
                          background: 'repeating-linear-gradient(45deg,#FFE3B3 0 8px,#FFD08A 8px 16px)',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Fill src={p?.image} alt={p?.title} />
                      </div>
                      <div style={{ minWidth: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                        {p?.tag ? (
                          <span
                            style={{
                              alignSelf: 'flex-start',
                              height: '22px',
                              padding: '0 7px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              background: '#FFD23F',
                              border: '1.5px solid #111',
                            }}
                          >
                            {p?.tag}
                          </span>
                        ) : null}
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{p?.title}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0B6B43' }}>{p?.result}</div>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat();
                            }}
                            style={{
                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                            }}
                            className="dcp-a33"
                          >
                            <span dangerouslySetInnerHTML={V.sparkB} style={{ display: 'flex' }}></span>
                            {'Ask AI about this'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Featured Videos'}
              </h3>
              <div
                data-wc-reels="1"
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  marginRight: '-16px',
                  paddingBottom: '4px',
                }}
              >
                {(V.reels || []).map((r, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={r?.kind === 'external' ? openLink(r.href) : undefined}
                      role="button"
                      style={{
                        cursor: 'pointer',
                        flex: '0 0 42%',
                        aspectRatio: '9/16',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.bgB,
                        border: '2px solid #111',
                        borderRadius: '12px',
                        boxShadow: '3px 3px 0 #111',
                        boxSizing: 'border-box',
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          height: '22px',
                          padding: '0 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#FFF',
                          border: '1.5px solid #111',
                          fontSize: '11px',
                          fontWeight: '700',
                        }}
                      >
                        {r?.platform}
                      </span>
                      <span
                        dangerouslySetInnerHTML={V.ic?.play}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%,-50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#FFF',
                          border: '2px solid #111',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      ></span>
                      <span
                        style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          padding: '8px 10px',
                          background: '#111',
                          color: '#FFF4E0',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}
                      >
                        {r?.title}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {CARD.photos.length > 0 ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Portfolio'}
              </h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '32px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'Contact'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderRadius: '10px', background: '#FFF', border: '2px solid #111' }}
                  placeholderColor={'#57524A'}
                  buttonStyle={{
                    height: '48px',
                    border: '2px solid #111',
                    borderRadius: '10px',
                    background: '#FF5C39',
                    color: '#111',
                    fontSize: '15px',
                    fontWeight: '700',
                    boxShadow: '4px 4px 0 #111',
                    cursor: 'pointer',
                  }}
                  buttonClass="dcp-a34"
                  buttonLabel={'Send message'}
                  messageHeight="108px"
                />
                {CARD.href.WhatsApp ? (
                  <a
                    href={CARD.href.WhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#0B6B43' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3
                style={{
                  display: 'inline-block',
                  margin: '0 0 14px',
                  padding: '6px 12px',
                  background: '#111',
                  color: '#FFF4E0',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontWeight: '400',
                  fontSize: '18px',
                  textTransform: 'uppercase',
                }}
              >
                {'QR code'}
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px 16px',
                  background: '#FFD23F',
                  border: '2px solid #111',
                  boxShadow: '4px 4px 0 #111',
                  borderRadius: '12px',
                  marginRight: '4px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '168px',
                    height: '168px',
                    padding: '10px',
                    boxSizing: 'border-box',
                    background: '#fff',
                    border: '2px solid #111',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  <CardQR style={{ width: '100%', height: '100%' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: '32px',
                      height: '32px',
                      border: '2px solid #111',
                      background: '#FF5C39',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Archivo Black',sans-serif",
                      fontSize: '15px',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '48px',
                      border: '2px solid #111',
                      borderRadius: '10px',
                      background: '#FFF',
                      color: '#111',
                      fontSize: '14px',
                      fontWeight: '700',
                      boxShadow: '3px 3px 0 #111',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      height: '48px',
                      border: '2px solid #111',
                      borderRadius: '10px',
                      background: '#111',
                      color: '#FFF4E0',
                      fontSize: '14px',
                      fontWeight: '700',
                      boxShadow: '3px 3px 0 #FF5C39',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{ fontFamily: "'Archivo Black',sans-serif" }} />
          <div style={{ padding: '32px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', fontWeight: '600' }}>
                {'Powered by '}
                <a href={'/'} style={{ fontWeight: '800', textDecoration: 'underline' }}>
                  {'Aicardly'}
                </a>
              </div>
            ) : null}
            {CARD.branding ? (
              <a
                href={'/register'}
                style={{
                  display: 'inline-flex',
                  minHeight: '44px',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#B8331A',
                }}
              >
                {'Get your own Aicardly card →'}
              </a>
            ) : null}
          </div>
          {V.barCols > 0 ? (
            <div
              style={{
                position: 'fixed',
                left: '0',
                right: '0',
                bottom: '0',
                height: '84px',
                transform: f?.barHidden ? 'translateY(110%)' : 'none',
                transition: 'transform 200ms ease-out',
                paddingBottom: '20px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: `repeat(${V.barCols},1fr)`,
                background: 'rgba(255,244,224,.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderTop: '2px solid #111',
                zIndex: '5',
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {(V.bar || []).map((b, $index) => (
                <React.Fragment key={$index}>
                  <span
                    onClick={b?.go}
                    role="button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: '800',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex' }}></span>
                    {b?.label}
                  </span>
                </React.Fragment>
              ))}
              {CARD.ai.enabled ? (
                <span
                  onClick={openChat}
                  role="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={V.sparkB}
                    style={{
                      width: '26px',
                      height: '26px',
                      background: 'linear-gradient(135deg,#FFD23F,#3DDC97)',
                      border: '2px solid #111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                  ></span>
                  {'AI'}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.launch ? (
        <>
          <div
            onClick={openChat}
            style={{
              position: 'fixed',
              left: 'calc(max(0px, (var(--wc-vw, 100vw) - 480px) / 2) + 16px)',
              bottom: `${f?.launchBottom}px`,
              zIndex: '6',
              cursor: 'pointer',
            }}
          >
            {f?.tip ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: '0',
                    bottom: '70px',
                    width: 'max-content',
                    padding: '9px 12px',
                    background: '#FFF',
                    border: '2px solid #111',
                    boxShadow: '3px 3px 0 #111',
                    fontSize: '13.5px',
                    fontWeight: '700',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              dangerouslySetInnerHTML={V.sparkBL}
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg,#FFD23F,#3DDC97)',
                border: '2px solid #111',
                boxShadow: '4px 4px 0 #111',
                transform: 'rotate(-5deg)',
                boxSizing: 'border-box',
              }}
            ></div>
          </div>
        </>
      ) : null}
      {f?.chat ? (
        <>
          <div
            onClick={closeChat}
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '40',
              background: 'rgba(17,17,17,.45)',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: '0',
              right: '0',
              cursor: 'pointer',
            }}
          ></div>
          <div
            style={{
              position: 'fixed',
              left: '0',
              right: '0',
              bottom: '0',
              height: '85%',
              zIndex: '41',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFF4E0',
              border: '2px solid #111',
              borderBottom: 'none',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#111' }}></span>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px 12px 16px', borderBottom: '2px solid #111' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg,#FFD23F,#3DDC97)',
                  border: '2px solid #111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Archivo Black',sans-serif",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                {CARD.initials}
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '16px', fontWeight: '700' }}>
                  {`${CARD.firstName}'s AI Assistant`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '600' }}>
                  <span
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3DDC97', border: '1.5px solid #111' }}
                  ></span>
                  {'Online · replies instantly'}
                </div>
              </div>

              <ChatCallButtons />
              <span
                dangerouslySetInnerHTML={V.ic?.x}
                onClick={closeChat}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              ></span>
            </div>
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <ChatThread
                chat={chat}
                bot={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '82%',
                      padding: '10px 13px',
                      background: '#FFF',
                      border: '2px solid #111',
                      borderRadius: '14px 14px 14px 2px',
                      boxShadow: '3px 3px 0 #111',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    <ChatText text={text} />
                  </div>
                )}
                user={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '82%',
                      padding: '10px 13px',
                      background: '#FF5C39',
                      border: '2px solid #111',
                      borderRadius: '14px 14px 2px 14px',
                      boxShadow: '3px 3px 0 #111',
                      fontSize: '15px',
                      fontWeight: '600',
                      lineHeight: '1.45',
                    }}
                  >
                    {text}
                  </div>
                )}
                typing={
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      gap: '5px',
                      padding: '12px 14px',
                      background: '#FFF',
                      border: '2px solid #111',
                      borderRadius: '14px 14px 14px 2px',
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', background: '#111', animation: 'a_dotB 1.2s infinite' }}></span>
                    <span style={{ width: '7px', height: '7px', background: '#111', animation: 'a_dotB 1.2s .15s infinite' }}></span>
                    <span style={{ width: '7px', height: '7px', background: '#111', animation: 'a_dotB 1.2s .3s infinite' }}></span>
                  </div>
                }
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px 6px' }}>
              {chat.chips
                .map((label, i) => ({ label, bg: ['#FFD23F', '#3DDC97', '#FFFFFF', '#FF5C39'][i % 4] }))
                .map((c, $index) => (
                  <React.Fragment key={$index}>
                    <span
                      role="button"
                      onClick={() => chat.send(c.label)}
                      style={{
                        flexShrink: '0',
                        height: '38px',
                        position: 'relative',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        background: c?.bg,
                        border: '2px solid #111',
                        boxShadow: '2px 2px 0 #111',
                      }}
                      className="dcp-a36"
                    >
                      {c?.label}
                    </span>
                  </React.Fragment>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px 30px 12px' }}>
              <div
                style={{
                  flex: '1',
                  height: '48px',
                  background: '#FFF',
                  border: '2px solid #111',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px 0 14px',
                  boxSizing: 'border-box',
                }}
              >
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={`Ask anything about ${CARD.firstName}…`}
                  enterKeyHint="send"
                  aria-label="Message"
                  className="wc-chat-input"
                  style={{
                    flex: '1',
                    minWidth: 0,
                    height: '100%',
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                    fontSize: '16px',
                    '--wc-ph': '#57524A',
                  }}
                />
              </div>
              <span
                role="button"
                aria-label="Send"
                onClick={chat.submit}
                dangerouslySetInnerHTML={V.ic?.send}
                style={{
                  cursor: 'pointer',
                  opacity: chat.busy ? 0.6 : 1,
                  width: '48px',
                  height: '48px',
                  background: '#FF5C39',
                  border: '2px solid #111',
                  borderRadius: '10px',
                  boxShadow: '3px 3px 0 #111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              ></span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  ));
}
