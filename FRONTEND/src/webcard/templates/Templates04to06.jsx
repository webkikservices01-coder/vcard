import React from 'react';
import '../webcard-shared.js';
import { CARD } from '../cardData.js';
import { DCLogic, useDC, useLive, liveFrame, ImageSlot, CoverImage, Fill, CardQR, EnquiryForm, CustomSections, downloadQR, openLink, saveContact, shareCard, scrollToSection, enquire, ReelMedia, useChat, ChatCallButtons, ChatThread, ChatText, SwipeRow, ChatMic, ServiceSlides, ProductCatalog, PhotoSlides, TestimonialSlides } from '../dc-runtime.jsx';
import { themeTree } from '../theme/themeTree.js';

class Logic extends DCLogic {
  state = { tab: 'services' };

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
    const svg = (p, s, sw) => ({
      __html:
        '<svg width="' +
        (s || 20) +
        '" height="' +
        (s || 20) +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
        (sw || 1.75) +
        '" stroke-linecap="round" stroke-linejoin="round" style="display:block">' +
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
      cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
      clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
      bubble: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
      spark:
        '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    };
    const ic = {};
    Object.keys(P).forEach((k) => {
      ic[k] = svg(P[k]);
    });
    ic.bubble = svg(P.bubble, 24, 2);
    ic.clockS = svg(P.clock, 14, 2);
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
        r: 44,
        bezelR: 54,
        profile: true,
        rest: false,
        chat: false,
        tip: true,
        launch: true,
        launchBottom: 34,
        coverL: 250,
        coverC: 150,
        blobH: 330,
        heroPad: 26,
        logoTop: 0,
      },
      {
        key: 'small',
        label: 'Small phone · 360×640',
        w: 360,
        h: '640px',
        statusH: 24,
        r: 26,
        bezelR: 36,
        profile: true,
        rest: false,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 10,
        coverL: 80,
        coverC: 60,
        blobH: 250,
        heroPad: 0,
        logoTop: 0,
        compact: true,
      },
      {
        key: 'chat',
        label: 'AI chat open · 390×844',
        w: 390,
        h: '844px',
        statusH: 44,
        r: 44,
        bezelR: 54,
        profile: false,
        rest: false,
        chat: true,
        tip: false,
        launch: false,
        launchBottom: 34,
        coverL: 250,
        coverC: 150,
        blobH: 330,
        heroPad: 26,
        logoTop: 0,
      },
      {
        key: 'full',
        label: 'Full scroll · 390 wide',
        w: 390,
        h: 'auto',
        statusH: 44,
        r: 44,
        bezelR: 54,
        profile: true,
        rest: true,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 100,
        coverL: 250,
        coverC: 150,
        blobH: 330,
        heroPad: 26,
        logoTop: 0,
      },
    ].map((f) => ({
      ...f,
      full: !f.compact,
      lxPadR: f.compact ? 5 : 14,
      bookH: f.compact ? 48 : 52,
      coverLT: f.statusH + f.coverL,
      coverCT: f.statusH + f.coverC,
      chipTop: f.statusH + 8,
    }));

    const tab = CARD.services.length === 0 ? 'projects' : CARD.projects.length === 0 ? 'services' : this.state.tab;
    const navLabels = ['Profile', 'Services', 'Products', 'Projects', 'Videos', 'Portfolio', 'Contact', 'QR'];
    const on = (a, b) => (a ? b[0] : b[1]);
    const bar = CARD.barFrom([
      { label: 'Call', icon: ic.phone },
      { label: 'WhatsApp', icon: ic.wa },
      { label: 'Save', icon: ic.userPlus },
    ]);
    return {
      frames: FR,
      ic,
      qr: this.qr(),
      sparkLx: grad('#C9A45C', '#EDE6D6', 14, 'glx1'),
      sparkLxM: grad('#C9A45C', '#EDE6D6', 20, 'glx2'),
      sparkCo: grad('#0E7C66', '#5EC4A8', 14, 'gco1'),
      sparkCoL: grad('#0E7C66', '#5EC4A8', 20, 'gco2'),
      sparkW: grad('#3AA17E', '#7C88E0', 14, 'gw1'),
      quick: CARD.quickFrom([
        { label: 'Call', icon: ic.phone, w: '#E8F3EE' },
        { label: 'WhatsApp', icon: ic.wa, w: '#DDF0E7' },
        { label: 'Email', icon: ic.mail, w: '#FDEDEC' },
        { label: 'Location', icon: ic.pin, w: '#EEF0FB' },
      ]),
      socials: CARD.socialsFrom(),
      nav: CARD.navFrom(navLabels.map((label) => ({ label }))).map((n, i) => {
        const a = i === 0;
        return {
          ...n,
          lxFg: on(a, ['#C9A45C', '#A89F8C']),
          lxLine: on(a, ['inset 0 -1px 0 #C9A45C', 'none']),
          coBg: on(a, ['#0E7C66', '#F1F5F9']),
          coFg: on(a, ['#FFFFFF', '#334155']),
          wBg: on(a, ['#2B2B2B', '#FFFFFF']),
          wFg: on(a, ['#FFFFFF', '#2B2B2B']),
          wSh: on(a, ['none', '0 4px 12px rgba(43,43,43,.06)']),
        };
      }),
      stats: CARD.fill(CARD.stats, [
        { lxDiv: 'none', coDiv: 'none', w: '#E8F3EE' },
        { lxDiv: '1px solid #2A2620', coDiv: '1px solid #E3E9F0', w: '#FDEDEC' },
        { lxDiv: '1px solid #2A2620', coDiv: '1px solid #E3E9F0', w: '#EEF0FB' },
      ]),
      skills: CARD.skills,
      skillsLine: CARD.skills.join(' · '),
      services: CARD.fill(CARD.services, [{ icon: ic.code }, { icon: ic.mobile }, { icon: ic.trend }, { icon: ic.cpu }]),
      projects: CARD.fill(CARD.projects, [
        { lxBg: 'linear-gradient(135deg,#2A2418,#0E0D0B)', w: '#E8F3EE' },
        { lxBg: 'linear-gradient(135deg,#1F1B14,#0A0A0A)', w: '#FDEDEC' },
        { lxBg: 'linear-gradient(135deg,#2E2619,#11100D)', w: '#EEF0FB' },
      ]),
      reels: CARD.fill(CARD.reels, [
        { lx: 'linear-gradient(160deg,#2A2418,#0A0A0A)', co: 'linear-gradient(160deg,#5B8F83,#0B3B31)', w: '#E8F3EE' },
        { lx: 'linear-gradient(160deg,#1C1A16,#0A0A0A)', co: 'linear-gradient(160deg,#94A3B8,#1E293B)', w: '#FDEDEC' },
        { lx: 'linear-gradient(160deg,#302617,#0A0A0A)', co: 'linear-gradient(160deg,#6E8FAE,#0B1B2B)', w: '#EEF0FB' },
      ]),
      portfolioLx: CARD.fill(CARD.photos, [
        { r: 2, c: 1, bg: 'linear-gradient(160deg,#2A2418,#0E0D0B)' },
        { r: 1, c: 1, bg: 'linear-gradient(160deg,#1C1A16,#0E0D0B)' },
        { r: 1, c: 1, bg: 'linear-gradient(160deg,#302617,#0E0D0B)' },
        { r: 1, c: 2, bg: 'linear-gradient(160deg,#241F16,#0A0A0A)' },
        { r: 1, c: 2, bg: 'linear-gradient(160deg,#2E2619,#0A0A0A)' },
      ]),
      portfolioM: CARD.photos,
      portfolioW: CARD.fill(CARD.photos, [
        { r: 2, c: 1, bg: '#E8F3EE' },
        { r: 1, c: 1, bg: '#FDEDEC' },
        { r: 1, c: 1, bg: '#EEF0FB' },
        { r: 1, c: 2, bg: '#FDEDEC' },
        { r: 1, c: 2, bg: '#EEF0FB' },
        { r: 2, c: 1, bg: '#E8F3EE' },
        { r: 1, c: 2, bg: '#E8F3EE' },
      ]),
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
      timeline: CARD.experience.map((e, i) => ({
        ...e,
        dot: i === 0 ? '#0E7C66' : '#FFFFFF',
        ring: i === 0 ? '#0E7C66' : '#9FB3C4',
      })),
      testimonials: CARD.testimonials,
      timings: CARD.timings,
      servicesW: CARD.fill(CARD.services, [
        { wide: true, bg: '#E8F3EE', fg: '#23775A', icon: ic.code },
        { bg: '#FDEDEC', fg: '#B2463F', linkColor: '#8E2F28', icon: ic.mobile },
        { bg: '#EEF0FB', fg: '#4A55A8', linkColor: '#39448F', icon: ic.cpu },
        { wide: true, bg: '#E8F3EE', fg: '#23775A', icon: ic.trend },
      ]),
      rating: CARD.testimonials.length
        ? (() => {
            const avg = CARD.testimonials.reduce((a, t) => a + (t.rating || 5), 0) / CARD.testimonials.length;
            const n = CARD.testimonials.length;
            return { avg: avg.toFixed(1), stars: '★'.repeat(Math.round(avg)), label: n + (n === 1 ? ' review' : ' reviews') };
          })()
        : null,
      tab: {
        isS: tab === 'services',
        isP: tab === 'projects',
        sBg: on(tab === 'services', ['#FFFFFF', 'transparent']),
        sFg: on(tab === 'services', ['#0B1B2B', '#5B6B7C']),
        sSh: on(tab === 'services', ['0 1px 3px rgba(11,27,43,.12)', 'none']),
        pBg: on(tab === 'projects', ['#FFFFFF', 'transparent']),
        pFg: on(tab === 'projects', ['#0B1B2B', '#5B6B7C']),
        pSh: on(tab === 'projects', ['0 1px 3px rgba(11,27,43,.12)', 'none']),
      },
      tabServices: () => this.setState({ tab: 'services' }),
      tabProjects: () => this.setState({ tab: 'projects' }),
    };
  }
}

export function LuxeNoir(props) {
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
        background: '#0A0A0A',
        color: '#EDE6D6',
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
          height: `${f?.coverLT}px`,
          overflow: 'hidden',
          background: 'radial-gradient(90% 70% at 70% 20%, #3A2E1C 0%, #0A0A0A 70%)',
        }}
      >
        <ImageSlot
          id={`t4-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Cinematic cover image'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom, rgba(10,10,10,.55) 0%, rgba(10,10,10,.1) 30%, rgba(10,10,10,.6) 70%, #0A0A0A 100%)',
            pointerEvents: 'none',
          }}
        ></div>
        {CARD.company ? (
          <div style={{ position: 'absolute', top: `${f?.chipTop}px`, left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 4px 4px',
                border: '1px solid rgba(201,164,92,.45)',
                background: 'rgba(10,10,10,.55)',
                borderRadius: '4px',
                fontSize: '11.5px',
                fontWeight: '500',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ width: '24px', height: '24px', overflow: 'hidden', background: '#141414', borderRadius: '2px' }}>
                <ImageSlot id={`t4-logo-${f?.key}`} shape={'rect'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
              </div>
              <span>{CARD.company}</span>
            </div>
          </div>
        ) : null}
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 'calc(clamp(96px, 28cqi, 112px) / -2)' }}>
        <div
          style={{
            width: 'clamp(96px, 28cqi, 112px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '4px',
            boxSizing: 'border-box',
            border: '1.5px solid #C9A45C',
            background: '#0A0A0A',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#1C1A16' }}>
            <ImageSlot id={`t4-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div
        style={{ padding: '10px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}
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
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: '600',
              fontSize: CARD.nameSize('clamp(30px, 8.6cqi, 36px)'),
              lineHeight: '1.02',
              letterSpacing: '.01em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#C9A45C' }}></span>
        </div>
        {CARD.roleLine ? (
          <p
            style={{
              margin: '0',
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: '#C9A45C',
            }}
          >
            {CARD.roleLine}
          </p>
        ) : null}
        {CARD.ai.enabled ? (
          <span
            style={{
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '24px',
              padding: '0 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              border: '1px solid transparent',
              background: 'linear-gradient(#0A0A0A,#0A0A0A) padding-box, linear-gradient(135deg,#C9A45C,#EDE6D6,#8C6B2F) border-box',
            }}
          >
            <span dangerouslySetInnerHTML={V.sparkLx} style={{ display: 'flex' }}></span>
            {'AI-enabled'}
          </span>
        ) : null}
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '6px 0 0',
              fontSize: '16px',
              lineHeight: '1.55',
              color: '#CFC7B6',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minHeight: '44px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{
                position: 'relative',
                fontSize: '13px',
                fontWeight: '500',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: '#EDE6D6',
                borderBottom: '1px solid #C9A45C',
                paddingBottom: '2px',
              }}
              className="dcp-b0"
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
                height: '30px',
                padding: '0 11px',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: '500',
                border: '1px solid transparent',
                background: 'linear-gradient(#0A0A0A,#0A0A0A) padding-box, linear-gradient(135deg,#C9A45C,#EDE6D6,#8C6B2F) border-box',
              }}
              className="dcp-b1"
            >
              <span dangerouslySetInnerHTML={V.sparkLx} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '6px 20px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
              className="dcp-b2"
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
                  color: '#C9A45C',
                  border: '1px solid rgba(201,164,92,.5)',
                  boxSizing: 'border-box',
                }}
                className="dcp-b3"
              ></span>
              <span style={{ fontSize: '11.5px', fontWeight: '500', letterSpacing: '.06em', color: '#CFC7B6' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '10px 20px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EDE6D6' }}
            ></a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: '10px', padding: '10px 20px 0' }}>
        <button
          onClick={saveContact}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            borderRadius: '4px',
            background: 'linear-gradient(90deg,#C9A45C,#E2C889,#C9A45C)',
            backgroundSize: '200% 100%',
            color: '#0A0A0A',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          className="dcp-b4"
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
            borderRadius: '4px',
            border: '1px solid #C9A45C',
            background: 'transparent',
            color: '#C9A45C',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          className="dcp-b5"
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
              gap: '20px',
              overflow: 'hidden',
              padding: '0 20px',
              marginTop: '22px',
              borderTop: '1px solid #1F1D19',
              borderBottom: '1px solid #1F1D19',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#0A0A0A',
            }}
          >
            {(V.nav || []).map((n, $index) => (
              <React.Fragment key={$index}>
                <span
                  onClick={n?.go}
                  role="button"
                  style={{
                    flexShrink: '0',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: '500',
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: n?.lxFg,
                    boxShadow: n?.lxLine,
                  }}
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '30px 20px 0', animation: 'b_lxFade 900ms ease-out both' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'01'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Profile'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              {CARD.bio ? (
                <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.7', color: '#CFC7B6' }}>
                  {CARD.bio}
                </p>
              ) : null}
              {V.stats?.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    marginTop: '20px',
                    borderTop: '1px solid #2A2620',
                    borderBottom: '1px solid #2A2620',
                  }}
                >
                  {(V.stats || []).map((st, $index) => (
                    <React.Fragment key={$index}>
                      <div style={{ padding: '14px 0', textAlign: 'center', borderLeft: st?.lxDiv }}>
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: '30px',
                            fontWeight: '600',
                            color: '#C9A45C',
                            lineHeight: '1',
                          }}
                        >
                          {st?.v}
                        </div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            letterSpacing: '.14em',
                            textTransform: 'uppercase',
                            color: '#A89F8C',
                            marginTop: '4px',
                          }}
                        >
                          {st?.l}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
              {V.skillsLine ? (
                <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.9', color: '#A89F8C' }}>{V.skillsLine}</div>
              ) : null}
              {CARD.location || CARD.languages.length ? (
                <div style={{ marginTop: '6px', fontSize: '14px', color: '#A89F8C' }}>
                  {[...CARD.languages, CARD.location].filter(Boolean).join(' · ')}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 ? (
            <div style={{ padding: '40px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'02'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Services'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <ServiceSlides items={CARD.services} pad={20} />
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '40px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'—'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Testimonials'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <TestimonialSlides items={CARD.testimonials} pad={20} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '40px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '0 20px 14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'03'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Projects'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <SwipeRow
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  padding: '0 20px 6px',
                  scrollPadding: '0 20px',
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
                        position: 'relative',
                        aspectRatio: '4/3',
                        overflow: 'hidden',
                        background: p?.lxBg,
                      }}
                    >
                      <ImageSlot
                        id={`t4-proj-${f?.key}-${$index}`}
                        shape={'rect'}
                        placeholder={'Project image'}
                        style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: '0',
                          background: 'linear-gradient(to top, rgba(10,10,10,.92) 0%, rgba(10,10,10,.2) 55%, rgba(10,10,10,0) 100%)',
                          pointerEvents: 'none',
                        }}
                      ></div>
                      <div style={{ position: 'absolute', left: '20px', right: '20px', bottom: '18px', pointerEvents: 'none' }}>
                        {p?.tag ? (
                          <div style={{ fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#C9A45C' }}>
                            {p?.tag}
                          </div>
                        ) : null}
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: '26px',
                            fontWeight: '600',
                            lineHeight: '1.1',
                            marginTop: '4px',
                          }}
                        >
                          {p?.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '6px',
                            fontSize: '13.5px',
                            color: '#CFC7B6',
                          }}
                        >
                          <span>{p?.result}</span>
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
                                fontSize: '12px',
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                              }}
                              className="dcp-b8"
                            >
                              <span dangerouslySetInnerHTML={V.sparkLx} style={{ display: 'flex' }}></span>
                              {'Ask AI'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '40px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'04'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Featured Videos'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <div
                data-wc-reels="1"
                style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', marginRight: '-20px' }}
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
                        borderRadius: '4px',
                        border: '1px solid rgba(201,164,92,.35)',
                        background: r?.lx,
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          fontSize: '10.5px',
                          letterSpacing: '.14em',
                          textTransform: 'uppercase',
                          color: '#EDE6D6',
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
                          border: '1px solid #C9A45C',
                          background: 'rgba(10,10,10,.5)',
                          color: '#C9A45C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      ></span>
                      <span
                        style={{
                          position: 'absolute',
                          left: '10px',
                          right: '10px',
                          bottom: '12px',
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: '17px',
                          fontWeight: '600',
                          lineHeight: '1.2',
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
            <div style={{ padding: '40px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '0 20px 14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'05'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>
                  {'Portfolio'}
                </h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <PhotoSlides items={CARD.photos} pad={0} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '40px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'06'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'Contact'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderBottom: '1px solid #3A352C' }}
                  placeholderColor={'#A89F8C'}
                  buttonStyle={{
                    marginTop: '8px',
                    height: '48px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#C9A45C',
                    color: '#0A0A0A',
                    fontSize: '14px',
                    fontWeight: '600',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                  buttonClass="dcp-b9"
                  buttonLabel={'Send enquiry'}
                  messageHeight="96px"
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
                      color: '#CFC7B6',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#C9A45C' }}></span>
                    {'Prefer WhatsApp? Message privately'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '32px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A45C' }}>
                  {'07'}
                </span>
                <h3 style={{ margin: '0', fontFamily: "'Cormorant Garamond',serif", fontWeight: '600', fontSize: '26px' }}>{'QR code'}</h3>
                <span style={{ flex: '1', height: '1px', background: 'linear-gradient(90deg, rgba(201,164,92,.5), transparent)' }}></span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '22px 16px',
                  background: '#141414',
                  border: '1px solid #2A2620',
                  borderRadius: '4px',
                }}
              >
                <div style={{ padding: '6px', border: '1px solid #C9A45C' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '160px',
                      height: '160px',
                      padding: '10px',
                      boxSizing: 'border-box',
                      background: '#EDE6D6',
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
                        border: '2px solid #EDE6D6',
                        background: '#0A0A0A',
                        color: '#C9A45C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: '15px',
                        fontWeight: '600',
                      }}
                    >
                      {CARD.initials}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#A89F8C' }}>
                  {CARD.cardUrl.replace(/^https?:\/\//, '')}
                </div>
                <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '48px',
                      borderRadius: '4px',
                      border: '1px solid #C9A45C',
                      background: 'transparent',
                      color: '#C9A45C',
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      height: '48px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#C9A45C',
                      color: '#0A0A0A',
                      fontSize: '13px',
                      fontWeight: '600',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{ fontFamily: "'Cormorant Garamond',serif" }} />
          <div style={{ padding: '36px 20px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12px', letterSpacing: '.08em', color: '#A89F8C' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#EDE6D6' }}>
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
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '18px',
                  fontStyle: 'italic',
                  color: '#C9A45C',
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
                background: 'rgba(10,10,10,.97)',
                borderTop: '1px solid rgba(201,164,92,.25)',
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
                      fontSize: '10.5px',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: '#EDE6D6',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex', color: '#C9A45C' }}></span>
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
                    fontSize: '10.5px',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: '#EDE6D6',
                  }}
                >
                  <span dangerouslySetInnerHTML={V.sparkLxM} style={{ display: 'flex' }}></span>
                  {'Concierge'}
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
                    padding: '10px 14px',
                    borderRadius: '4px',
                    background: '#EDE6D6',
                    color: '#0A0A0A',
                    fontSize: '13.5px',
                    fontWeight: '500',
                    boxShadow: '0 10px 30px rgba(0,0,0,.45)',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              style={{
                height: '48px',
                padding: `0 ${f?.lxPadR}px 0 5px`,
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                borderRadius: '4px',
                background: '#0A0A0A',
                border: '1px solid #C9A45C',
                boxShadow: '0 10px 30px rgba(0,0,0,.5)',
              }}
            >
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg,#C9A45C,#E9D6A5,#A8843F)',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '17px',
                  fontWeight: '600',
                }}
              >
                {CARD.initials}
              </span>
              {f?.full ? (
                <>
                  <span
                    style={{ fontSize: '12px', fontWeight: '500', letterSpacing: '.16em', textTransform: 'uppercase', color: '#EDE6D6' }}
                  >
                    {'Concierge'}
                  </span>
                  <span dangerouslySetInnerHTML={V.sparkLx} style={{ display: 'flex' }}></span>
                </>
              ) : null}
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
              background: 'rgba(0,0,0,.6)',
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
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#101010',
              borderTop: '1px solid #C9A45C',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <span style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#3A352C' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 6px 14px 20px',
                borderBottom: '1px solid #2A2620',
              }}
            >
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: '0',
                  border: '1px solid #C9A45C',
                  color: '#C9A45C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: '17px',
                  fontWeight: '600',
                }}
              >
                {CARD.initials}
              </span>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: '600', lineHeight: '1.1' }}>
                  {'Private Concierge'}
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', letterSpacing: '.06em', color: '#A89F8C' }}
                >
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C9A45C' }}></span>
                  {'Available · replies instantly'}
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
                padding: '18px 20px',
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
                      maxWidth: '86%',
                      padding: '12px 14px',
                      background: '#181715',
                      border: '1px solid #2A2620',
                      borderRadius: '4px',
                      fontSize: '15px',
                      lineHeight: '1.5',
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
                      maxWidth: '80%',
                      padding: '11px 14px',
                      background: '#C9A45C',
                      color: '#0A0A0A',
                      borderRadius: '4px',
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
                      background: '#181715',
                      border: '1px solid #2A2620',
                      borderRadius: '4px',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A45C', animation: 'b_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#C9A45C',
                        animation: 'b_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#C9A45C',
                        animation: 'b_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 20px 4px' }}>
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
                      borderRadius: '4px',
                      fontSize: '13.5px',
                      color: '#EDE6D6',
                      border: '1px solid rgba(201,164,92,.5)',
                    }}
                    className="dcp-b10"
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px 30px' }}>
              <div
                style={{
                  flex: '1',
                  height: '48px',
                  borderBottom: '1px solid #C9A45C',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0 0 4px',
                }}
              >
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={'Ask the concierge…'}
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
                    '--wc-ph': '#8C8474',
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
                  borderRadius: '4px',
                  background: '#C9A45C',
                  color: '#0A0A0A',
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

export function SplitHeroCorporate(props) {
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
        background: '#F6F8FB',
        color: '#0B1B2B',
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
          height: `${f?.coverCT}px`,
          overflow: 'hidden',
          background: 'linear-gradient(120deg,#0B3B31,#0E7C66)',
        }}
      >
        <ImageSlot
          id={`t5-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Office / skyline cover'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '.55' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom, rgba(11,27,43,.45), rgba(11,27,43,.1))',
            pointerEvents: 'none',
          }}
        ></div>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: '14px', padding: '0 16px', marginTop: '-48px' }}>
        <div
          style={{
            width: 'clamp(104px, 31cqi, 124px)',
            flexShrink: '0',
            aspectRatio: '4/5',
            padding: '5px',
            boxSizing: 'border-box',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 1px 2px rgba(11,27,43,.06), 0 10px 24px rgba(11,27,43,.1)',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', background: '#E6ECF2' }}>
            <ImageSlot
              id={`t5-av-${f?.key}`}
              shape={'rounded'}
              radius={'12'}
              placeholder={'Photo'}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '0', paddingTop: '56px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1
              style={{
                overflowWrap: 'anywhere',
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                margin: '0',
                paddingBottom: '0.08em',
                fontFamily: "'Manrope',sans-serif",
                fontWeight: '800',
                fontSize: CARD.nameSize('clamp(24px, 6.9cqi, 28px)'),
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
              }}
            >
              {CARD.fullName}
            </h1>
            <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#0E7C66' }}></span>
          </div>
          {CARD.role ? <div style={{ fontSize: '14.5px', fontWeight: '500', color: '#475569' }}>{CARD.role}</div> : null}
          {CARD.company ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#E6ECF2' }}>
                <ImageSlot
                  id={`t5-logo-${f?.key}`}
                  shape={'rounded'}
                  radius={'6'}
                  placeholder={'Logo'}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{CARD.company}</span>
            </div>
          ) : null}
          {CARD.ai.enabled ? (
            <span
              style={{
                alignSelf: 'flex-start',
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 9px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#F6F8FB,#F6F8FB) padding-box, linear-gradient(135deg,#0E7C66,#5EC4A8) border-box',
              }}
            >
              <span dangerouslySetInnerHTML={V.sparkCo} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ padding: '10px 16px 0' }}>
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '0',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '40px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '600', color: '#0E7C66' }}
              className="dcp-b11"
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
                height: '30px',
                padding: '0 11px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#F6F8FB,#F6F8FB) padding-box, linear-gradient(135deg,#0E7C66,#5EC4A8) border-box',
              }}
              className="dcp-b12"
            >
              <span dangerouslySetInnerHTML={V.sparkCo} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      {V.stats?.length > 0 ? (
        <div
          style={{
            margin: '4px 16px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            background: '#FFFFFF',
            border: '1px solid #E3E9F0',
            borderRadius: '12px',
          }}
        >
          {(V.stats || []).map((st, $index) => (
            <React.Fragment key={$index}>
              <div style={{ padding: '10px 12px', borderLeft: st?.coDiv }}>
                <div
                  style={{ fontFamily: "'Manrope',sans-serif", fontSize: '21px', fontWeight: '800', color: '#0B1B2B', lineHeight: '1.1' }}
                >
                  {st?.v}
                </div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#5B6B7C' }}>{st?.l}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '10px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <span
                dangerouslySetInnerHTML={q?.icon}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#E4F2EE',
                  color: '#0E7C66',
                }}
                className="dcp-b13"
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}>{q?.label}</span>
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
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                border: '1px solid #E3E9F0',
                color: '#0B1B2B',
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
            borderRadius: '12px',
            background: '#0E7C66',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-b14"
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
            borderRadius: '12px',
            border: '1px solid #CBD6E2',
            background: '#FFFFFF',
            color: '#0B1B2B',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-b15"
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
              padding: '12px 16px',
              marginTop: '16px',
              background: '#F6F8FB',
              borderTop: '1px solid #E3E9F0',
              borderBottom: '1px solid #E3E9F0',
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
                    padding: '0 13px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: n?.coBg,
                    color: n?.coFg,
                  }}
                  className="dcp-b16"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>{'Profile'}</h3>
              <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E3E9F0', borderRadius: '14px' }}>
                {CARD.bio ? (
                  <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', color: '#334155' }}>
                    {CARD.bio}
                  </p>
                ) : null}
                {V.skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                    {(V.skills || []).map((sk, $index) => (
                      <React.Fragment key={$index}>
                        <span
                          style={{
                            height: '30px',
                            padding: '0 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: '#F1F5F9',
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
                  <div style={{ marginTop: '12px', fontSize: '14px', color: '#5B6B7C' }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <b style={{ color: '#0B1B2B' }}>{CARD.languages.join(' · ')}</b>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <b style={{ color: '#0B1B2B' }}>{CARD.location}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {V.timeline?.length > 0 ? (
                <>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: '#5B6B7C',
                      margin: '20px 0 10px',
                    }}
                  >
                    {'Experience'}
                  </div>
                  <div style={{ position: 'relative', paddingLeft: '22px' }}>
                    <div
                      style={{ position: 'absolute', left: '6px', top: '6px', bottom: '6px', width: '2px', background: '#D6E4EE' }}
                    ></div>
                    {(V.timeline || []).map((tl, $index) => (
                      <React.Fragment key={$index}>
                        <div style={{ position: 'relative', paddingBottom: '16px' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '-22px',
                              top: '4px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: tl?.dot,
                              border: '3px solid #F6F8FB',
                              boxSizing: 'border-box',
                              boxShadow: `0 0 0 1px ${tl?.ring}`,
                            }}
                          ></span>
                          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0E7C66' }}>{tl?.years}</div>
                          <div style={{ fontSize: '15px', fontWeight: '700' }}>{tl?.role}</div>
                          <div style={{ fontSize: '13.5px', color: '#5B6B7C' }}>{tl?.org}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 || CARD.projects.length > 0 ? (
            <div style={{ padding: '16px 16px 0' }}>
              {CARD.services.length > 0 && CARD.projects.length > 0 ? (
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '4px', borderRadius: '12px', background: '#E9EEF4' }}
                >
                  <button
                    onClick={V.tabServices}
                    style={{
                      height: '40px',
                      border: 'none',
                      borderRadius: '9px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: V.tab?.sBg,
                      color: V.tab?.sFg,
                      boxShadow: V.tab?.sSh,
                    }}
                  >
                    {'Services'}
                  </button>
                  <button
                    onClick={V.tabProjects}
                    style={{
                      height: '40px',
                      border: 'none',
                      borderRadius: '9px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: V.tab?.pBg,
                      color: V.tab?.pFg,
                      boxShadow: V.tab?.pSh,
                    }}
                  >
                    {'Projects'}
                  </button>
                </div>
              ) : (
                <h3 style={{ margin: '12px 0 0', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>
                  {CARD.services.length > 0 ? 'Services' : 'Projects'}
                </h3>
              )}
              {V.tab?.isS ? (
                <div style={{ marginTop: '12px' }}>
                  <ServiceSlides items={CARD.services} />
                </div>
              ) : null}
              {V.tab?.isP ? (
                <>
                  <SwipeRow
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      overflowX: 'auto',
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'none',
                      margin: '12px -16px 0',
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
                            background: '#FFFFFF',
                            border: '1px solid #E3E9F0',
                            borderRadius: '14px',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              overflow: 'hidden',
                              width: '80px',
                              flexShrink: '0',
                              aspectRatio: '1',
                              borderRadius: '10px',
                              background: 'repeating-linear-gradient(135deg,#EEF2F6 0 10px,#E1E8EF 10px 11px)',
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
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: '600',
                                  background: '#F1F5F9',
                                  color: '#475569',
                                }}
                              >
                                {p?.tag}
                              </span>
                            ) : null}
                            <div style={{ fontSize: '15px', fontWeight: '700' }}>{p?.title}</div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0E7C66' }}>{p?.result}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </SwipeRow>
                </>
              ) : null}
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '28px 0 0' }}>
              <h3 style={{ margin: '0 16px 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>
                {'What clients say'}
              </h3>
              <div style={{ padding: '0 16px' }}>
                <TestimonialSlides items={CARD.testimonials} />
              </div>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>{'Featured Videos'}</h3>
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
                        borderRadius: '14px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.co,
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
                          background: 'rgba(11,27,43,.7)',
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
                          color: '#0B1B2B',
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
                          background: 'linear-gradient(to top, rgba(11,27,43,.85), transparent)',
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
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>{'Portfolio'}</h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>{'Contact'}</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E3E9F0',
                  borderRadius: '14px',
                }}
              >
                <EnquiryForm
                  fieldStyle={{
                    height: '56px',
                    borderRadius: '12px',
                    border: '1px solid #CBD6E2',
                    background: '#FFFFFF',
                  }}
                  placeholderColor={'#5B6B7C'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#0E7C66',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                  buttonLabel={'Send message'}
                  messageHeight="100px"
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
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#0E7C66' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Manrope',sans-serif", fontSize: '19px', fontWeight: '800' }}>{'QR code'}</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E3E9F0',
                  borderRadius: '14px',
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
                    border: '1px solid #E3E9F0',
                    borderRadius: '10px',
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
                      background: '#0E7C66',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>{'Scan to open this card'}</div>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '44px',
                      borderRadius: '12px',
                      border: '1px solid #CBD6E2',
                      background: '#fff',
                      color: '#0B1B2B',
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
                      borderRadius: '12px',
                      border: 'none',
                      background: '#0B1B2B',
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
          <CustomSections headStyle={{ fontFamily: "'Manrope',sans-serif" }} />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', color: '#5B6B7C' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#0B1B2B', fontWeight: '600' }}>
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
                  color: '#0E7C66',
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
                background: 'rgba(255,255,255,.97)',
                borderTop: '1px solid #E3E9F0',
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
                      color: '#0B1B2B',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex', color: '#0E7C66' }}></span>
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
                    color: '#0B1B2B',
                  }}
                >
                  <span dangerouslySetInnerHTML={V.sparkCoL} style={{ display: 'flex' }}></span>
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
                    maxWidth: '230px',
                    padding: '10px 12px',
                    borderRadius: '12px 12px 4px 12px',
                    background: '#0B1B2B',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    lineHeight: '1.35',
                    boxShadow: '0 10px 30px rgba(11,27,43,.25)',
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
                background: '#0E7C66',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 24px rgba(14,124,102,.35)',
              }}
            >
              <span dangerouslySetInnerHTML={V.ic?.bubble} style={{ display: 'flex' }}></span>
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '22px',
                  height: '22px',
                  padding: '0 6px',
                  boxSizing: 'border-box',
                  borderRadius: '11px',
                  background: '#DC2626',
                  color: '#fff',
                  border: '2px solid #F6F8FB',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'b_fabPop 2.4s ease-in-out infinite',
                }}
              >
                {'1'}
              </span>
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
              background: 'rgba(11,27,43,.4)',
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
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ height: '3px', background: 'linear-gradient(90deg,#0E7C66,#5EC4A8)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#CBD6E2' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 6px 12px 16px',
                borderBottom: '1px solid #E3E9F0',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#0E7C66',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                }}
              >
                {CARD.initials}
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div
                  style={{ fontFamily: "'Manrope',sans-serif", fontSize: '15.5px', fontWeight: '800' }}
                >{`${CARD.firstName}'s AI Assistant`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5B6B7C' }}>
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
                background: '#F6F8FB',
              }}
            >
              <ChatThread
                chat={chat}
                bot={(text, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '86%',
                      padding: '10px 13px',
                      borderRadius: '14px 14px 14px 4px',
                      background: '#FFFFFF',
                      border: '1px solid #E3E9F0',
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
                      maxWidth: '80%',
                      padding: '10px 13px',
                      borderRadius: '14px 14px 4px 14px',
                      background: '#0E7C66',
                      color: '#fff',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    {text}
                  </div>
                )}
                typing={null}
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 16px 4px' }}>
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
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      color: '#0B5C4C',
                      background: '#E4F2EE',
                    }}
                    className="dcp-b19"
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
                  borderRadius: '12px',
                  border: '1px solid #CBD6E2',
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
                  placeholder={'Type your question…'}
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
                    '--wc-ph': '#5B6B7C',
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
                  borderRadius: '12px',
                  background: '#0E7C66',
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

export function SoftBentoWellness(props) {
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
        background: '#FBF7F4',
        color: '#2B2B2B',
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: `${f?.blobH}px`,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Owner's cover, fading into the page so the header text stays readable. */}
        <CoverImage style={{ opacity: 0.5, WebkitMaskImage: 'linear-gradient(#000 40%, transparent)', maskImage: 'linear-gradient(#000 40%, transparent)' }} />
        <div
          style={{
            position: 'absolute',
            left: '-18%',
            top: '-22%',
            width: '62%',
            aspectRatio: '1',
            background: '#E8F3EE',
            borderRadius: '58% 42% 55% 45% / 48% 58% 42% 52%',
            animation: 'b_blobDrift 11s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            right: '-16%',
            top: '-8%',
            width: '56%',
            aspectRatio: '1',
            background: '#FDEDEC',
            borderRadius: '42% 58% 45% 55% / 58% 42% 58% 42%',
            animation: 'b_blobA 10s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            left: '28%',
            top: '22%',
            width: '46%',
            aspectRatio: '1',
            background: '#EEF0FB',
            opacity: '.9',
            borderRadius: '52% 48% 40% 60% / 55% 45% 55% 45%',
            animation: 'b_blobDrift 9s ease-in-out infinite alternate-reverse',
            willChange: 'transform',
          }}
        ></div>
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: `${f?.heroPad}px` }}>
        {CARD.company ? (
          <div
            style={{
              position: 'absolute',
              top: `${f?.logoTop}px`,
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 11px 4px 4px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,.8)',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(43,43,43,.06)',
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: '#E8F3EE' }}>
              <ImageSlot id={`t6-logo-${f?.key}`} shape={'circle'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
            </div>
            <span>{CARD.company}</span>
          </div>
        ) : null}
        <div
          style={{
            width: 'clamp(96px, 29cqi, 116px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '5px',
            boxSizing: 'border-box',
            background: '#FFFFFF',
            boxShadow: '0 12px 30px rgba(58,161,126,.18)',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#E8F3EE' }}>
            <ImageSlot id={`t6-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          padding: '10px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '4px',
        }}
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
              fontWeight: '800',
              fontSize: CARD.nameSize('clamp(25px, 7.2cqi, 29px)'),
              lineHeight: '1.12',
              letterSpacing: '-0.02em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#23775A' }}></span>
        </div>
        {CARD.roleLine ? <p style={{ margin: '0', fontSize: '14.5px', fontWeight: '500', color: '#5E5A57' }}>{CARD.roleLine}</p> : null}
        {CARD.ai.enabled ? (
          <span
            style={{
              marginTop: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '26px',
              padding: '0 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              border: '1px solid transparent',
              background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#3AA17E,#9AA5F0) border-box',
            }}
          >
            <span dangerouslySetInnerHTML={V.sparkW} style={{ display: 'flex' }}></span>
            {'AI-enabled'}
          </span>
        ) : null}
        {CARD.bio ? (
          <p
            data-bio="1"
            style={{
              margin: '6px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#3F3C3A',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '40px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '700', color: '#23775A' }}
              className="dcp-b20"
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
                height: '30px',
                padding: '0 12px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                border: '1px solid transparent',
                background: 'linear-gradient(#FBF7F4,#FBF7F4) padding-box, linear-gradient(135deg,#3AA17E,#9AA5F0) border-box',
              }}
              className="dcp-b21"
            >
              <span dangerouslySetInnerHTML={V.sparkW} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ position: 'relative', padding: '4px 16px 0' }}>
        <button
          onClick={enquire(null)}
          style={{
            width: '100%',
            height: `${f?.bookH}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            borderRadius: '999px',
            background: '#3AA17E',
            color: '#0F2A20',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(58,161,126,.3)',
          }}
          className="dcp-b22"
        >
          <span dangerouslySetInnerHTML={V.ic?.cal} style={{ display: 'flex' }}></span>
          {'Book appointment'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '10px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <span
                dangerouslySetInnerHTML={q?.icon}
                style={{
                  width: '48px',
                  height: '44px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: q?.w,
                  color: '#2B2B2B',
                }}
                className="dcp-b23"
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5E5A57' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '8px 16px 0' }}>
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
                background: '#FFFFFF',
                color: '#2B2B2B',
                boxShadow: '0 4px 12px rgba(43,43,43,.07)',
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
            background: '#2B2B2B',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(43,43,43,.15)',
          }}
          className="dcp-b24"
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
            border: 'none',
            borderRadius: '999px',
            background: '#FFFFFF',
            color: '#2B2B2B',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(43,43,43,.08)',
          }}
          className="dcp-b25"
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
              padding: '12px 16px',
              marginTop: '14px',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#FBF7F4',
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
                    fontWeight: '700',
                    background: n?.wBg,
                    color: n?.wFg,
                    boxShadow: n?.wSh,
                  }}
                  className="dcp-b26"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '14px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Profile'}</h3>
              <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 8px 24px rgba(43,43,43,.05)' }}>
                {CARD.bio ? (
                  <p data-bio="1" style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', color: '#3F3C3A' }}>
                    {CARD.bio}
                  </p>
                ) : null}
                {V.stats?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '8px', marginTop: '14px' }}>
                    {(V.stats || []).map((st, $index) => (
                      <React.Fragment key={$index}>
                        <div style={{ padding: '12px 10px', borderRadius: '18px', background: st?.w, textAlign: 'center' }}>
                          <div style={{ fontSize: '21px', fontWeight: '800' }}>{st?.v}</div>
                          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#5E5A57' }}>{st?.l}</div>
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
                            padding: '0 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: '#FBF7F4',
                            color: '#3F3C3A',
                          }}
                        >
                          {sk}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {CARD.location || CARD.languages.length ? (
                  <div style={{ marginTop: '12px', fontSize: '14px', color: '#5E5A57' }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <b style={{ color: '#2B2B2B' }}>{CARD.languages.join(' · ')}</b>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <b style={{ color: '#2B2B2B' }}>{CARD.location}</b>
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
          {CARD.services.length > 0 || CARD.href.Location || CARD.timings.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>
                {CARD.services.length > 0 ? 'Services & visit info' : 'Visit info'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gridAutoFlow: 'dense', gap: '10px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <ServiceSlides items={CARD.services} />
                </div>
                {CARD.href.Location ? (
                  <a
                    href={CARD.href.Location}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      gridColumn: 'span 2',
                      position: 'relative',
                      height: '150px',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      background: 'repeating-linear-gradient(135deg,#EFE9E4 0 12px,#E7E0DA 12px 13px)',
                      color: '#2B2B2B',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%,-70%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50% 50% 50% 4px',
                        transformOrigin: 'center',
                        rotate: '-45deg',
                        background: '#3AA17E',
                        boxShadow: '0 8px 18px rgba(58,161,126,.35)',
                      }}
                    ></div>
                    <div
                      style={{
                        position: 'absolute',
                        left: '10px',
                        right: '10px',
                        bottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '8px 8px 8px 14px',
                        borderRadius: '999px',
                        background: '#FFFFFF',
                        boxShadow: '0 6px 16px rgba(43,43,43,.08)',
                      }}
                    >
                      <div style={{ minWidth: '0' }}>
                        <div
                          style={{
                            fontSize: '13.5px',
                            fontWeight: '800',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {CARD.location || 'Find us on the map'}
                        </div>
                        {CARD.company ? <div style={{ fontSize: '12px', color: '#5E5A57' }}>{CARD.company}</div> : null}
                      </div>
                      <span
                        style={{
                          height: '36px',
                          padding: '0 14px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '999px',
                          background: '#2B2B2B',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '700',
                          flexShrink: '0',
                        }}
                      >
                        {'Directions'}
                      </span>
                    </div>
                  </a>
                ) : null}
                {V.timings?.length > 0 ? (
                  <div
                    style={{
                      gridRow: V.timings.length > 2 ? 'span 2' : undefined,
                      padding: '14px',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(43,43,43,.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#23775A' }}
                    >
                      <span dangerouslySetInnerHTML={V.ic?.clockS} style={{ display: 'flex' }}></span>
                      {'Timings'}
                    </div>
                    {V.timings.map((tg, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{tg.d}</span>
                        <span style={{ fontSize: '13px', color: '#5E5A57' }}>{tg.h}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {V.rating ? (
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '24px',
                      background: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(43,43,43,.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '26px', fontWeight: '800' }}>{V.rating.avg}</div>
                    <div style={{ fontSize: '13px', color: '#C07A0B', letterSpacing: '1px' }}>{V.rating.stars}</div>
                    <div style={{ fontSize: '12.5px', color: '#5E5A57' }}>{V.rating.label}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <ProductCatalog items={CARD.products} />
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Testimonials'}</h3>
              <TestimonialSlides items={CARD.testimonials} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Projects'}</h3>
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
                        borderRadius: '24px',
                        background: '#FFFFFF',
                        boxShadow: '0 8px 24px rgba(43,43,43,.05)',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          width: '84px',
                          flexShrink: '0',
                          aspectRatio: '1',
                          borderRadius: '18px',
                          background: p?.w,
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
                              padding: '0 9px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              background: '#FBF7F4',
                            }}
                          >
                            {p?.tag}
                          </span>
                        ) : null}
                        <div style={{ fontSize: '15px', fontWeight: '800' }}>{p?.title}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#23775A' }}>{p?.result}</div>
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
                            className="dcp-b31"
                          >
                            <span dangerouslySetInnerHTML={V.sparkW} style={{ display: 'flex' }}></span>
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
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Featured Videos'}</h3>
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
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.w,
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          height: '24px',
                          padding: '0 9px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: '999px',
                          background: '#FFFFFF',
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
                          background: '#FFFFFF',
                          color: '#2B2B2B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 16px rgba(43,43,43,.12)',
                        }}
                      ></span>
                      <span
                        style={{
                          position: 'absolute',
                          left: '10px',
                          right: '10px',
                          bottom: '12px',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#2B2B2B',
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
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Portfolio'}</h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'Contact'}</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '24px',
                  background: '#FFFFFF',
                  boxShadow: '0 8px 24px rgba(43,43,43,.05)',
                }}
              >
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderRadius: '999px', background: '#FBF7F4' }}
                  placeholderColor={'#6E6965'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '999px',
                    background: '#3AA17E',
                    color: '#0F2A20',
                    fontSize: '15px',
                    fontWeight: '800',
                    boxShadow: '0 8px 18px rgba(58,161,126,.25)',
                  }}
                  buttonLabel={'Send message'}
                  messageHeight="100px"
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
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#23775A' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '19px', fontWeight: '800' }}>{'QR code'}</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '20px 16px',
                  borderRadius: '28px',
                  background: '#EEF0FB',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '168px',
                    height: '168px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    background: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 8px 24px rgba(43,43,43,.06)',
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
                      borderRadius: '50%',
                      border: '3px solid #fff',
                      background: '#3AA17E',
                      color: '#0F2A20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '800',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '48px',
                      border: 'none',
                      borderRadius: '999px',
                      background: '#fff',
                      color: '#2B2B2B',
                      fontSize: '14px',
                      fontWeight: '700',
                      boxShadow: '0 6px 14px rgba(43,43,43,.06)',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      height: '48px',
                      border: 'none',
                      borderRadius: '999px',
                      background: '#2B2B2B',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{}} />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', color: '#5E5A57' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#2B2B2B', fontWeight: '700' }}>
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
                  fontWeight: '700',
                  color: '#23775A',
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
                background: 'rgba(251,247,244,.97)',
                borderTop: '1px solid #EFE7E1',
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
                      fontWeight: '700',
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
                    fontWeight: '700',
                  }}
                >
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#9FDCC4,#C6CCF6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '3px', height: '4px', borderRadius: '2px', background: '#2B2B2B' }}></span>
                    <span style={{ width: '3px', height: '4px', borderRadius: '2px', background: '#2B2B2B' }}></span>
                  </span>
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
                    right: '4px',
                    bottom: '70px',
                    width: 'max-content',
                    padding: '10px 14px',
                    borderRadius: '20px 20px 6px 20px',
                    background: '#FFFFFF',
                    color: '#2B2B2B',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 12px 30px rgba(43,43,43,.14)',
                  }}
                >
                  {'Hi! Need an appointment?'}
                </div>
              </>
            ) : null}
            <div
              style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(145deg,#9FDCC4,#C6CCF6)',
                boxShadow: '0 12px 26px rgba(58,161,126,.3), inset 0 -6px 12px rgba(255,255,255,.35)',
                borderRadius: '58% 42% 55% 45% / 48% 58% 42% 52%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <span
                  style={{ width: '6px', height: '9px', borderRadius: '3px', background: '#2B2B2B', animation: 'b_blink 4s infinite' }}
                ></span>
                <span
                  style={{ width: '6px', height: '9px', borderRadius: '3px', background: '#2B2B2B', animation: 'b_blink 4s infinite' }}
                ></span>
              </div>
              <span style={{ width: '14px', height: '7px', borderRadius: '0 0 8px 8px', background: '#2B2B2B' }}></span>
              <span dangerouslySetInnerHTML={V.sparkW} style={{ position: 'absolute', top: '4px', right: '2px', display: 'flex' }}></span>
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
              background: 'rgba(43,43,43,.3)',
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
              borderRadius: '32px 32px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#FBF7F4',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#E0D8D2' }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px 12px 16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  flexShrink: '0',
                  background: 'linear-gradient(145deg,#9FDCC4,#C6CCF6)',
                  borderRadius: '58% 42% 55% 45% / 48% 58% 42% 52%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                }}
              >
                <div style={{ display: 'flex', gap: '7px' }}>
                  <span style={{ width: '4px', height: '6px', borderRadius: '2px', background: '#2B2B2B' }}></span>
                  <span style={{ width: '4px', height: '6px', borderRadius: '2px', background: '#2B2B2B' }}></span>
                </div>
                <span style={{ width: '9px', height: '4px', borderRadius: '0 0 5px 5px', background: '#2B2B2B' }}></span>
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontSize: '15.5px', fontWeight: '800' }}>{`${CARD.firstName}'s AI Assistant`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5E5A57' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3AA17E' }}></span>
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
                padding: '8px 16px',
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
                      padding: '11px 14px',
                      borderRadius: '22px 22px 22px 8px',
                      background: '#FFFFFF',
                      fontSize: '15px',
                      lineHeight: '1.45',
                      boxShadow: '0 4px 12px rgba(43,43,43,.04)',
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
                      maxWidth: '80%',
                      padding: '11px 14px',
                      borderRadius: '22px 22px 8px 22px',
                      background: '#3AA17E',
                      color: '#0F2A20',
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
                      padding: '14px 16px',
                      borderRadius: '22px 22px 22px 8px',
                      background: '#FFFFFF',
                    }}
                  >
                    <span
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3AA17E', animation: 'b_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#3AA17E',
                        animation: 'b_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#3AA17E',
                        animation: 'b_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div data-wc-chips="" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 16px 4px' }}>
              {chat.chips
                .map((l, i) => ({ l, bg: ['#E8F3EE', '#FDEDEC', '#EEF0FB', '#E8F3EE'][i % 4] }))
                .map((c, $index) => (
                  <React.Fragment key={$index}>
                    <span
                      role="button"
                      onClick={() => chat.send(c.l)}
                      style={{
                        flexShrink: '0',
                        height: '38px',
                        position: 'relative',
                        padding: '0 14px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '999px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        background: c?.bg,
                      }}
                      className="dcp-b32"
                    >
                      {c?.l}
                    </span>
                  </React.Fragment>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 30px' }}>
              <div
                style={{
                  flex: '1',
                  height: '50px',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 5px 0 18px',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 12px rgba(43,43,43,.05)',
                }}
              >
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={'Ask me anything…'}
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
                    '--wc-ph': '#6E6965',
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
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#3AA17E',
                  color: '#0F2A20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(58,161,126,.3)',
                }}
              ></span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  ));
}
