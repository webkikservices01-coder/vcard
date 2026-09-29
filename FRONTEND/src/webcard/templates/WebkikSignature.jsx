import React from 'react';
import W from '../webcard-shared.js';
import { CARD } from '../cardData.js';
import {
  DCLogic,
  useDC,
  useLive,
  liveFrame,
  ImageSlot,
  CoverImage,
  Fill,
  CardQR,
  EnquiryForm,
  CustomSections,
  downloadQR,
  openLink,
  saveContact,
  shareCard,
  scrollToSection,
  ReelMedia,
  useChat,
  ChatThread,
  ChatText,
  SwipeRow,
} from '../dc-runtime.jsx';

class Logic extends DCLogic {
  state = { align: null };
  componentDidMount() {
    if (!window.WC)
      this._t = setInterval(() => {
        if (window.WC) {
          clearInterval(this._t);
          this.forceUpdate();
        }
      }, 40);
  }
  componentWillUnmount() {
    clearInterval(this._t);
  }
  renderVals() {
    const W = window.WC;
    if (!W) return {};
    const ic = W.ic;
    const align = this.state.align || this.props.photoAlign || 'center';
    const AL = {
      left: { justify: 'flex-start', text: 'left' },
      center: { justify: 'center', text: 'center' },
      right: { justify: 'flex-end', text: 'right' },
    };
    const L = {
      bg: '#FFFFFF',
      surf: '#FFF5F8',
      text: '#1A1A1A',
      muted: '#5E5560',
      line: '#F4D9E3',
      tint: '#FDE4EC',
      pinkT: '#C8154D',
      sec: '#14141A',
      secFg: '#FFFFFF',
      icon: '#ED2460',
    };
    const Dk = {
      bg: '#14141A',
      surf: '#1E1E26',
      text: '#F5F2F4',
      muted: '#B7AEB5',
      line: '#2E2E38',
      tint: '#3A1A27',
      pinkT: '#FF6B95',
      sec: '#F5F2F4',
      secFg: '#14141A',
      icon: '#FF6B95',
    };
    const base = W.frames({ small: { cover: 112 } });
    const dark = { ...base[0], key: 'dark', label: 'Dark mode · hero', tip: false, dark: true };
    const frames = [base[0], dark, base[1], base[2], base[3]].map((f) => {
      const c = f.cover || 200;
      const t = f.dark ? Dk : L;
      return { ...f, t, coverT: c + f.statusH, chipTop: f.statusH + 6, navT: t };
    });
    const svcIcons = [ic.code, ic.mobile, ic.trend, ic.cpu];
    const bar = CARD.barFrom([
      { label: 'Call', icon: ic.phone, c: '#1A1A1A' },
      { label: 'WhatsApp', icon: ic.wa, c: '#15803D' },
      { label: 'Save', icon: ic.userPlus, c: '#1A1A1A' },
    ]);
    return {
      frames,
      ic,
      al: AL[align],
      bio: CARD.bio,
      bio2: CARD.bio,
      skills: CARD.skills,
      stats: CARD.stats,
      chips: ['Book a call', 'What services do you offer?', 'Show recent projects', 'Pricing?'],
      alignOpts: ['left', 'center', 'right'].map((k) => ({
        label: k[0].toUpperCase() + k.slice(1),
        bg: k === align ? '#ED2460' : 'transparent',
        fg: k === align ? '#FFFFFF' : '#3F3F46',
        set: () => this.setState({ align: k }),
      })),
      qr: W.qr('#14141A'),
      spark: W.grad('#ED2460', '#FF8FB1', 14, 'g10'),
      icS: {
        spark: W.svg(W.P.spark, 15, 2.2),
        sparkL: W.svg(W.P.spark, 24, 2),
        user: W.svg(W.P.userPlus, 16, 2),
        wa: W.svg(W.P.wa, 16, 2),
      },
      quick: CARD.quickFrom([
        { label: 'Call', icon: ic.phone },
        { label: 'WhatsApp', icon: ic.wa },
        { label: 'Email', icon: ic.mail },
        { label: 'Location', icon: ic.pin },
      ]),
      socials: CARD.socialsFrom(),
      nav: CARD.navFrom(['Profile', 'Services', 'Projects', 'Reels', 'Portfolio', 'Contact', 'QR'].map((label) => ({ label }))).map(
        (n, i) => ({
          ...n,
          bg: i === 0 ? '#ED2460' : 'rgba(237,36,96,.08)',
          fg: i === 0 ? '#FFFFFF' : 'inherit',
        }),
      ),
      services: CARD.fill(CARD.services, [
        { bg: '#ED2460', fg: '#FFFFFF', icBg: 'rgba(255,255,255,.2)', icFg: '#FFFFFF' },
        { bg: '#14141A', fg: '#FFFFFF', icBg: '#3A1A27', icFg: '#FF6B95' },
        { bg: '#FFF5F8', fg: '#1A1A1A', icBg: '#FDE4EC', icFg: '#C8154D' },
        { bg: '#FFF5F8', fg: '#1A1A1A', icBg: '#FDE4EC', icFg: '#C8154D' },
      ]).map((s, i) => ({
        ...s,
        icon: svcIcons[i % svcIcons.length],
        spark: i % 4 < 2 ? W.svg(W.P.spark, 14, 2.2) : W.grad('#ED2460', '#FF8FB1', 14, 'g10s'),
      })),
      projects: CARD.projects,
      reels: CARD.fill(CARD.reels, [
        { bg: 'linear-gradient(160deg,#ED2460,#7A0E33)' },
        { bg: 'linear-gradient(160deg,#2A2A33,#14141A)' },
        { bg: 'linear-gradient(160deg,#C8154D,#14141A)' },
      ]),
      portfolio: CARD.fill(CARD.photos, [
        { r: 2, c: 1, bg: '#FDE4EC' },
        { r: 1, c: 1, bg: '#FFF5F8' },
        { r: 1, c: 1, bg: '#F8CFDC' },
        { r: 1, c: 2, bg: '#FFF5F8' },
        { r: 1, c: 2, bg: '#F8CFDC' },
        { r: 2, c: 1, bg: '#FDE4EC' },
        { r: 1, c: 2, bg: '#FDE4EC' },
      ]),
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
    };
  }
}

export function WebkikSignature(props) {
  const V = useDC(Logic, props);
  const { openChat, closeChat, ...live } = useLive();
  const f = liveFrame(V.frames, live, props);
  const chat = useChat();
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        borderRadius: 0,
        overflow: 'clip',
        background: f?.t?.bg,
        color: f?.t?.text,
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
          height: `${f?.coverT}px`,
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#ED2460 0%,#C8154D 55%,#7A0E33 100%)',
        }}
      >
        <CoverImage />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 2px, transparent 2px 24px)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-70px',
            fontFamily: "'Poppins',sans-serif",
            fontWeight: '800',
            fontSize: '260px',
            lineHeight: '1',
            color: 'rgba(255,255,255,.1)',
            transform: 'rotate(-12deg)',
            pointerEvents: 'none',
          }}
        >
          {'W'}
        </div>
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
              background: 'rgba(20,20,26,.35)',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#fff',
            }}
          >
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
              <ImageSlot id={`t10-logo-${f?.key}`} shape={'circle'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
            </div>
            <span>{CARD.company}</span>
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: V.al?.justify,
          padding: '0 16px',
          marginTop: 'calc(clamp(96px, 28cqi, 110px) / -2)',
        }}
      >
        <div
          style={{
            width: 'clamp(96px, 28cqi, 110px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '4px',
            boxSizing: 'border-box',
            background: f?.t?.bg,
            boxShadow: '0 8px 24px rgba(237,36,96,.25)',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: f?.t?.tint }}>
            <ImageSlot id={`t10-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '8px 16px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: V.al?.justify,
          textAlign: V.al?.text,
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: V.al?.justify, gap: '4px 8px' }}>
          <h1
            style={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0',
              fontFamily: "'Poppins',sans-serif",
              fontWeight: '700',
              fontSize: 'clamp(25px, 7.2cqi, 29px)',
              lineHeight: '1.12',
              letterSpacing: '-0.02em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#ED2460' }}></span>
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
                fontWeight: '700',
                border: '1px solid transparent',
                background: `linear-gradient(${f?.t?.bg},${f?.t?.bg}) padding-box, linear-gradient(135deg,#ED2460,#FF8FB1) border-box`,
              }}
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
        {CARD.roleLine ? <p style={{ margin: '0', fontSize: '14.5px', fontWeight: '500', color: f?.t?.muted }}>{CARD.roleLine}</p> : null}
        {V.bio2 ? (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textWrap: 'pretty',
            }}
          >
            {V.bio2}
          </p>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '44px' }}>
          {V.bio2 ? (
            <a
              href={'#profile'}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              style={{ position: 'relative', fontSize: '14px', fontWeight: '600', color: f?.t?.pinkT }}
              className="dcp-g0"
            >
              {'Read more'}
            </a>
          ) : null}
          {CARD.ai.enabled ? (
            <span
              onClick={openChat}
              role="button"
              style={{
                cursor: 'pointer',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 12px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: `linear-gradient(${f?.t?.bg},${f?.t?.bg}) padding-box, linear-gradient(135deg,#ED2460,#FF8FB1) border-box`,
              }}
              className="dcp-g1"
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '6px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              className="dcp-g2"
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
                  background: f?.t?.tint,
                  color: f?.t?.icon,
                }}
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: f?.t?.muted }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: V.al?.justify, gap: '10px', padding: '10px 16px 0' }}>
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
                border: `1px solid ${f?.t?.line}`,
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
            borderRadius: '14px',
            background: '#ED2460',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(237,36,96,.3)',
          }}
          className="dcp-g3"
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
            borderRadius: '14px',
            background: f?.t?.sec,
            color: f?.t?.secFg,
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-g4"
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          {'Share'}
        </button>
      </div>
      {f?.above ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflow: 'hidden',
              padding: '16px 16px 10px',
              marginTop: '6px',
              borderBottom: `1px solid ${f?.t?.line}`,
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: f?.t?.bg,
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
                    background: n?.bg,
                    color: n?.fg,
                  }}
                  className="dcp-g5"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {!!(CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length) && (
            <div style={{ padding: '22px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'Profile'}</h3>
              <div style={{ padding: '16px', borderRadius: '20px', background: f?.t?.surf }}>
                <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{V.bio}</p>
                {V.stats?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '8px', marginTop: '14px' }}>
                    {(V.stats || []).map((st, $index) => (
                      <React.Fragment key={$index}>
                        <div style={{ padding: '10px 12px', borderRadius: '14px', background: f?.t?.bg }}>
                          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '21px', fontWeight: '700', color: f?.t?.pinkT }}>
                            {st?.v}
                          </div>
                          <div style={{ fontSize: '12.5px', color: f?.t?.muted }}>{st?.l}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {V.skills?.length > 0 && (
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
                            fontWeight: '500',
                            background: f?.t?.bg,
                            border: `1px solid ${f?.t?.line}`,
                          }}
                        >
                          {sk}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {CARD.location || CARD.languages.length ? (
                  <div style={{ marginTop: '12px', fontSize: '14px', color: f?.t?.muted }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <b style={{ color: f?.t?.text }}>{CARD.languages.join(' · ')}</b>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <b style={{ color: f?.t?.text }}>{CARD.location}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 && (
            <div style={{ padding: '28px 0 0' }}>
              <h3 style={{ margin: '0 16px 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>
                {'Services'}
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  padding: '0 16px 4px',
                  scrollPadding: '0 16px',
                }}
              >
                {(V.services || []).map((sv, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      style={{
                        flex: '0 0 72%',
                        scrollSnapAlign: 'start',
                        boxSizing: 'border-box',
                        padding: '16px',
                        borderRadius: '20px',
                        background: sv?.bg,
                        color: sv?.fg,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <span
                        dangerouslySetInnerHTML={sv?.icon}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: sv?.icBg,
                          color: sv?.icFg,
                        }}
                      ></span>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '17px', fontWeight: '700', marginTop: '6px' }}>
                        {sv?.title}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.45', opacity: '.9' }}>{sv?.desc}</div>
                      {sv?.price ? <div style={{ fontSize: '15px', fontWeight: '700' }}>{sv.price}</div> : null}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: '40px',
                          marginTop: 'auto',
                          fontSize: '14px',
                          fontWeight: '700',
                        }}
                      >
                        <span
                          role="button"
                          onClick={sv?.link ? openLink(sv.link) : () => scrollToSection(CARD.showEnquiry ? 'Contact' : 'QR')}
                          style={{ cursor: 'pointer' }}
                        >
                          {sv?.link ? 'View →' : 'Enquire →'}
                        </span>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={openChat}
                            style={{
                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                            className="dcp-g6"
                          >
                            <span dangerouslySetInnerHTML={sv?.spark} style={{ display: 'flex' }}></span>
                            {'Ask AI'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          {CARD.projects.length > 0 && (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'Projects'}</h3>
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
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: '#FFFFFF',
                        border: '1px solid #F4D9E3',
                        color: '#1A1A1A',
                        cursor: p?.url ? 'pointer' : undefined,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          background: 'repeating-linear-gradient(135deg,#FFF5F8 0 10px,#FBE3EB 10px 11px)',
                        }}
                      >
                        <Fill src={p?.image} />
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        {p?.tag ? (
                          <span
                            style={{
                              height: '22px',
                              padding: '0 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              background: '#FDE4EC',
                              color: '#A80F40',
                            }}
                          >
                            {p?.tag}
                          </span>
                        ) : null}
                        <div style={{ fontSize: '14.5px', fontWeight: '700', marginTop: '6px', lineHeight: '1.3' }}>{p?.title}</div>
                        <div style={{ fontSize: '12.5px', color: '#5E5560', marginTop: '2px' }}>{p?.result}</div>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat();
                            }}
                            style={{
                              cursor: 'pointer',
                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#1A1A1A',
                            }}
                            className="dcp-g7"
                          >
                            <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
                            {'Ask AI'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          )}
          {CARD.reels.length > 0 && (
            <div style={{ padding: '28px 0 0' }}>
              <h3 style={{ margin: '0 16px 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'Reels'}</h3>
              <div
                data-wc-reels="1"
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  padding: '0 16px 4px',
                  scrollPadding: '0 16px',
                }}
              >
                {(V.reels || []).map((r, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={r?.kind === 'external' ? openLink(r.href) : undefined}
                      style={{
                        flex: '0 0 42%',
                        scrollSnapAlign: 'start',
                        aspectRatio: '9/16',
                        borderRadius: '18px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.bg,
                        cursor: 'pointer',
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
                          background: 'rgba(20,20,26,.6)',
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
                          color: '#ED2460',
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
                          background: 'linear-gradient(to top, rgba(20,20,26,.85), transparent)',
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
          )}
          {CARD.photos.length > 0 && (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'Portfolio'}</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                  gridAutoRows: 'clamp(56px,17cqi,70px)',
                  gridAutoFlow: 'dense',
                  gap: '6px',
                }}
              >
                {(V.portfolio || []).map((pf, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={openLink(pf?.src)}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        gridRow: `span ${pf?.r}`,
                        gridColumn: `span ${pf?.c}`,
                        borderRadius: '12px',
                        background: pf?.bg,
                      }}
                    >
                      <Fill src={pf?.src} />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          {CARD.showEnquiry && (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'Contact'}</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '20px',
                  background: '#FFF5F8',
                }}
              >
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #F4D9E3' }}
                  placeholderColor={'#5E5560'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '14px',
                    background: '#ED2460',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                />
                {CARD.href.WhatsApp ? (
                  <a
                    href={CARD.href.WhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1A1A1A',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#15803D' }}></span>
                    {'Prefer WhatsApp? Chat now'}
                  </a>
                ) : null}
              </div>
            </div>
          )}
          {CARD.showQr && (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", fontSize: '19px', fontWeight: '700' }}>{'QR code'}</h3>
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '20px 16px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg,#ED2460,#7A0E33)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '-40px',
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: '800',
                    fontSize: '180px',
                    color: 'rgba(255,255,255,.08)',
                    lineHeight: '1',
                  }}
                >
                  {'W'}
                </div>
                <div
                  style={{
                    position: 'relative',
                    width: '168px',
                    height: '168px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    background: '#fff',
                    borderRadius: '18px',
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
                      background: '#ED2460',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: '800',
                    }}
                  >
                    {CARD.initials.charAt(0)}
                  </div>
                </div>
                <div style={{ position: 'relative', alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={downloadQR}
                    style={{
                      cursor: 'pointer',
                      height: '48px',
                      borderRadius: '14px',
                      border: 'none',
                      background: '#14141A',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Download QR'}
                  </button>
                  <button
                    onClick={shareCard}
                    style={{
                      cursor: 'pointer',
                      height: '48px',
                      borderRadius: '14px',
                      border: 'none',
                      background: '#fff',
                      color: '#14141A',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    {'Share card'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <CustomSections
            headStyle={{ fontFamily: "'Poppins',sans-serif" }}
            boxStyle={{ padding: '16px', borderRadius: '20px', background: f?.t?.surf }}
          />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <>
                <div style={{ fontSize: '12.5px', color: f?.t?.muted }}>
                  {'Powered by '}
                  <a href={'/'} style={{ color: f?.t?.text, fontWeight: '700' }}>
                    {'Aicardly'}
                  </a>
                </div>
                <a
                  href={'/register'}
                  style={{
                    display: 'inline-flex',
                    minHeight: '44px',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#C8154D',
                  }}
                >
                  {'Get your own Aicardly card →'}
                </a>
              </>
            ) : null}
          </div>
          {V.barCols > 0 && (
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
                borderTop: '1px solid #F4D9E3',
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
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex', color: b?.c }}></span>
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
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={V.icS?.spark}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 30%, #FF8FB1, #ED2460 60%, #A80F40)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  ></span>
                  {'AI'}
                </span>
              ) : null}
            </div>
          )}
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
                    background: '#14141A',
                    color: '#fff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(20,20,26,.3)',
                  }}
                >
                  {'Ask my AI assistant'}
                </div>
              </>
            ) : null}
            <div
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #FF8FB1, #ED2460 55%, #A80F40)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'g_orbPulse 2.4s ease-out infinite',
                boxShadow: '0 10px 24px rgba(237,36,96,.4)',
              }}
            >
              <span dangerouslySetInnerHTML={V.icS?.sparkL} style={{ display: 'flex' }}></span>
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '-10px',
                  height: '20px',
                  padding: '0 7px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  background: '#14141A',
                  color: '#fff',
                  border: '2px solid #fff',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  letterSpacing: '.04em',
                }}
              >
                {'AI'}
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
              background: 'rgba(20,20,26,.45)',
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
              background: 'radial-gradient(80% 22% at 50% 0%, rgba(237,36,96,.16), transparent 70%), #FFFFFF',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#F0C9D6' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 6px 12px 16px',
                borderBottom: '1px solid #F4D9E3',
              }}
            >
              <div
                dangerouslySetInnerHTML={V.icS?.spark}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #FF8FB1, #ED2460 55%, #A80F40)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              ></div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div
                  style={{ fontFamily: "'Poppins',sans-serif", fontSize: '15.5px', fontWeight: '700' }}
                >{`${CARD.firstName}'s AI Assistant`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5E5560' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }}></span>
                  {'Online · replies instantly'}
                </div>
              </div>

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
                      background: '#FFF5F8',
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
                      borderRadius: '18px 18px 6px 18px',
                      background: '#ED2460',
                      color: '#fff',
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
                      padding: '13px 15px',
                      borderRadius: '18px 18px 18px 6px',
                      background: '#FFF5F8',
                    }}
                  >
                    <span
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ED2460', animation: 'g_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ED2460',
                        animation: 'g_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ED2460',
                        animation: 'g_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '8px 16px 4px' }}>
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
                      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#ED2460,#FF8FB1) border-box',
                    }}
                    className="dcp-g8"
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
                  borderRadius: '14px',
                  background: '#FFF5F8',
                  border: '1px solid #F4D9E3',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px 0 14px',
                  boxSizing: 'border-box',
                }}
              >
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
                    '--wc-ph': '#5E5560',
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
                  borderRadius: '14px',
                  background: '#ED2460',
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
  );
}
