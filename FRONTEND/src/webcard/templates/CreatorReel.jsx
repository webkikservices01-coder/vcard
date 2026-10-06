import React from 'react';
import W from '../webcard-shared.js';
import { CARD, socialIcon } from '../cardData.js';
import { DCLogic, useDC, useLive, liveFrame, ImageSlot, Fill, CardQR, EnquiryForm, CustomSections, downloadQR, openLink, saveContact, shareCard, ReelMedia, useChat, ChatThread, ChatText, SwipeRow, ChatMic, ServiceSlides, PhotoSlides, TestimonialSlides } from '../dc-runtime.jsx';
import { themeTree } from '../theme/themeTree.js';

class Logic extends DCLogic {
  state = { hl: 0 };
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
    const ic = W.ic,
      s14 = (p) => W.svg(W.P[p], 14, 2);
    const G = 'linear-gradient(90deg,#FF3D77,#FF9A3D)';
    const frames = W.frames({ small: { cover: 112 } }).map((f) => {
      const c = f.cover || 226;
      return { ...f, coverT: c + f.statusH, chipTop: f.statusH + 6 };
    });
    const hl = this.state.hl;
    const svcIcons = [ic.code, ic.mobile, ic.trend, ic.cpu, ic.handshake];
    const services = CARD.services;
    const bar = CARD.barFrom([
      { label: 'Call', icon: ic.phone, c: '#fff' },
      { label: 'WhatsApp', icon: ic.wa, c: '#4ADE80' },
      { label: 'Save', icon: ic.userPlus, c: '#fff' },
    ]);
    return {
      frames,
      ic,
      bio: CARD.bio,
      bio2: CARD.bio,
      skills: CARD.skills,
      spark: W.grad('#FF5C8A', '#FFB06B', 14, 'g7'),
      icS: { volX: s14('volX'), spark: W.svg(W.P.spark, 15, 2.2), sparkXs: W.svg(W.P.spark, 11, 2.6) },
      followers: CARD.followers.map((fo) => ({ ...fo, icon: W.P[fo.kind] ? s14(fo.kind) : socialIcon(fo.kind) })),
      socials: CARD.socialsFrom().map((so, i) => ({ ...so, ring: i < 2 ? G : 'linear-gradient(#333,#333)' })),
      quick: CARD.quickFrom([
        { label: 'Call', icon: ic.phone, c: '#FFFFFF' },
        { label: 'WhatsApp', icon: ic.wa, c: '#4ADE80' },
        { label: 'Email', icon: ic.mail, c: '#FFFFFF' },
        { label: 'Location', icon: ic.pin, c: '#FFFFFF' },
      ]),
      nav: CARD.navFrom(['Videos', 'Profile', 'Services', 'Projects', 'Portfolio', 'Contact', 'QR'].map((label) => ({ label }))).map(
        (n, i) => ({
          ...n,
          bg: i === 0 ? G : '#1A1A1A',
          fg: i === 0 ? '#0D0D0D' : '#E6E6E6',
        }),
      ),
      reels: CARD.fill(CARD.reels, [
        { bg: 'linear-gradient(160deg,#5A1630,#1A0B10)' },
        { bg: 'linear-gradient(160deg,#5A3216,#1A1008)' },
        { bg: 'linear-gradient(160deg,#3D1640,#120A14)' },
        { bg: 'linear-gradient(160deg,#4A1A22,#140B0D)' },
      ]).map((r) => ({ ...r, pIcon: s14(r.platform === 'YouTube' ? 'youtube' : 'instagram') })),
      stats: CARD.stats.filter((s) => !s.fo), // followers have their own row here
      highlights: services.map((sv, i) => ({
        ...sv,
        short: sv.title,
        icon: svcIcons[i % svcIcons.length],
        ring: i === hl ? G : '#3A3A3A',
        fg: i === hl ? '#FFFFFF' : '#B8B8B8',
        pick: () => this.setState({ hl: i }),
      })),
      hl: services[Math.min(hl, services.length - 1)] || null,
      brands: CARD.fill(
        CARD.brands.map((n) => ({ n })),
        [
          { ff: "'Sora',sans-serif", fw: 800, ls: '.12em' },
          { ff: "'Inter',sans-serif", fw: 700, ls: '-.02em' },
          { ff: 'Georgia,serif', fw: 700, ls: '0' },
          { ff: "'Sora',sans-serif", fw: 600, ls: '0' },
          { ff: "'Inter',sans-serif", fw: 800, ls: '.08em' },
        ],
      ),
      projects: CARD.projects.map((p, i) => ({ ...p, span: i === 0 ? 'span 2' : 'span 1', ar: i === 0 ? '16/9' : '1/1' })),
      grid6: CARD.fill(CARD.photos, [
        { bg: '#2A1A20' },
        { bg: '#1F1F1F' },
        { bg: '#2A2118' },
        { bg: '#1F1F1F' },
        { bg: '#2A1A20' },
        { bg: '#221A24' },
      ]),
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
    };
  }
}

export function CreatorReel(props) {
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
        background: '#0D0D0D',
        color: '#FFFFFF',
        fontFamily: "'Inter',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div style={{ position: 'relative', height: `${f?.coverT}px`, overflow: 'hidden', background: '#1A0B10' }}>
        <div
          style={{
            position: 'absolute',
            inset: '-25%',
            background:
              'radial-gradient(35% 40% at 30% 45%, rgba(255,61,119,.65), transparent 70%), radial-gradient(35% 40% at 72% 55%, rgba(255,154,61,.55), transparent 70%)',
            animation: 'c_crDrift 7s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        ></div>
        <ImageSlot
          id={`t7-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Video loop poster (static fallback)'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '.35' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to bottom, rgba(13,13,13,.55) 0%, rgba(13,13,13,.05) 35%, rgba(13,13,13,.7) 78%, #0D0D0D 100%)',
            pointerEvents: 'none',
          }}
        ></div>
        {CARD.company ? (
          <div
            style={{
              position: 'absolute',
              top: `${f?.chipTop}px`,
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '4px 12px 4px 4px',
                borderRadius: '999px',
                background: 'rgba(13,13,13,.6)',
                fontSize: '12.5px',
                fontWeight: '600',
              }}
            >
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
                <ImageSlot id={`t7-logo-${f?.key}`} shape={'circle'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
              </div>
              <span>{CARD.company}</span>
            </div>
            <span
              aria-label={'Muted'}
              dangerouslySetInnerHTML={V.icS?.volX}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(13,13,13,.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            ></span>
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 16px',
          marginTop: '-60px',
        }}
      >
        <div style={{ minWidth: '0', paddingBottom: '6px' }}>
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
                fontFamily: "'Sora',sans-serif",
                fontWeight: '800',
                fontSize: CARD.nameSize('clamp(26px, 7.4cqi, 30px)'),
                lineHeight: '1.08',
                letterSpacing: '-0.02em',
              }}
            >
              {CARD.fullName}
              {/* The verified tick sits right after the last word of the name. */}
              <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '6px', color: '#FF9A3D' }}></span>
            </h1>
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: '0', width: 'clamp(96px, 28cqi, 108px)', aspectRatio: '1' }}>
          <span
            style={{
              position: 'absolute',
              inset: '0',
              borderRadius: '50%',
              background: 'conic-gradient(#FF3D77,#FF9A3D,#FF3D77)',
              animation: 'c_ringSpin 6s linear infinite',
              willChange: 'transform',
            }}
          ></span>
          <div
            style={{
              position: 'absolute',
              inset: '3px',
              borderRadius: '50%',
              background: '#0D0D0D',
              padding: '3px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#222' }}>
              <ImageSlot id={`t7-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
          {CARD.roleLine ? <span style={{ fontSize: '14.5px', fontWeight: '500', color: '#C9C9C9' }}>{CARD.roleLine}</span> : null}
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
                background: 'linear-gradient(#0D0D0D,#0D0D0D) padding-box, linear-gradient(90deg,#FF3D77,#FF9A3D) border-box',
              }}
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'AI-enabled'}
            </span>
          ) : null}
        </div>
        {V.bio2 ? (
          <p
            style={{
              margin: '0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#E6E6E6',
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(V.followers || []).map((fo, $index) => (
            <React.Fragment key={$index}>
              <a
                href={fo?.href || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${fo?.n} on ${fo?.l}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '999px',
                  background: '#1A1A1A',
                  border: '1px solid #2C2C2C',
                  fontSize: '12.5px',
                  color: '#C9C9C9',
                  textDecoration: 'none',
                  cursor: fo?.href ? 'pointer' : 'default',
                }}
              >
                <span dangerouslySetInnerHTML={fo?.icon} style={{ display: 'flex', color: '#fff' }}></span>
                <b style={{ color: '#fff' }}>{fo?.n}</b>
                {fo?.l}
              </a>
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 11px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: '700',
                border: '1px solid transparent',
                background: 'linear-gradient(#0D0D0D,#0D0D0D) padding-box, linear-gradient(90deg,#FF3D77,#FF9A3D) border-box',
              }}
              className="dcp-c0"
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'AI Summary'}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '8px', padding: '12px 16px 0' }}>
        {(V.quick || []).map((q, $index) => (
          <React.Fragment key={$index}>
            <a
              href={q?.href}
              target={q?.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              className="dcp-c2"
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
                  background: '#1A1A1A',
                  color: q?.c,
                }}
              ></span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#B8B8B8' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', padding: '10px 16px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                border: '1.5px solid transparent',
                background: `linear-gradient(#1A1A1A,#1A1A1A) padding-box, ${s?.ring} border-box`,
                boxSizing: 'border-box',
              }}
              className="dcp-c1"
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
            background: 'linear-gradient(90deg,#FF3D77,#FF9A3D)',
            color: '#0D0D0D',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,61,119,.3)',
          }}
          className="dcp-c3"
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
            border: '1px solid #3A3A3A',
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-c4"
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
              borderBottom: '1px solid #1F1F1F',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#0D0D0D',
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
                  className="dcp-c5"
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '20px 0 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ margin: '0', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Featured Videos'}</h3>
              </div>
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
                      role="button"
                      style={{
                        cursor: 'pointer',
                        flex: '0 0 56%',
                        scrollSnapAlign: 'start',
                        aspectRatio: '9/16',
                        borderRadius: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: r?.bg,
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
                          gap: '4px',
                          borderRadius: '999px',
                          background: 'rgba(0,0,0,.6)',
                          fontSize: '11.5px',
                          fontWeight: '700',
                        }}
                      >
                        <span dangerouslySetInnerHTML={r?.pIcon} style={{ display: 'flex' }}></span>
                        {r?.platform}
                      </span>
                      <span
                        dangerouslySetInnerHTML={V.ic?.play}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%,-50%)',
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,.95)',
                          color: '#0D0D0D',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      ></span>
                      <div
                        style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          padding: '36px 12px 12px',
                          background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent)',
                        }}
                      >
                        {r?.title ? <div style={{ fontSize: '14px', fontWeight: '700' }}>{r.title}</div> : null}
                        {r?.views ? (
                          <div style={{ fontSize: '12.5px', color: '#D6D6D6' }}>
                            {r.views}
                            {' views'}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Profile'}</h3>
              <div style={{ padding: '16px', borderRadius: '20px', background: '#161616', border: '1px solid #242424' }}>
                {V.bio ? <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', color: '#E6E6E6' }}>{V.bio}</p> : null}
                {V.stats?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '8px', marginTop: '14px' }}>
                    {(V.stats || []).map((st, $index) => (
                      <React.Fragment key={$index}>
                        <div style={{ padding: '10px 12px', borderRadius: '14px', background: '#0D0D0D' }}>
                          <div
                            style={{
                              fontFamily: "'Sora',sans-serif",
                              fontSize: '21px',
                              fontWeight: '800',
                              background: 'linear-gradient(90deg,#FF5C8A,#FFB06B)',
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent',
                            }}
                          >
                            {st?.v}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#B8B8B8' }}>{st?.l}</div>
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
                            background: '#222',
                            color: '#E6E6E6',
                          }}
                        >
                          {sk}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                {CARD.location || CARD.languages.length ? (
                  <div style={{ marginTop: '12px', fontSize: '14px', color: '#B8B8B8' }}>
                    {CARD.languages.length ? (
                      <>
                        {'Speaks '}
                        <b style={{ color: '#fff' }}>{CARD.languages.join(' · ')}</b>
                        {CARD.location ? ' · ' : ''}
                      </>
                    ) : null}
                    {CARD.location ? (
                      <>
                        {'Based in '}
                        <b style={{ color: '#fff' }}>{CARD.location}</b>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.services.length > 0 ? (
            <div style={{ padding: '28px 0 0' }}>
              <h3 style={{ margin: '0 16px 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Services'}</h3>
              <div style={{ padding: '0 16px' }}>
                <ServiceSlides items={CARD.services} />
              </div>
            </div>
          ) : null}
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '28px 0 0' }}>
              <h3 style={{ margin: '0 16px 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Testimonials'}</h3>
              <div style={{ padding: '0 16px' }}>
                <TestimonialSlides items={CARD.testimonials} />
              </div>
            </div>
          ) : null}
          {V.brands?.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>
                {'Brand collaborations'}
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflow: 'hidden',
                  WebkitMaskImage: 'linear-gradient(90deg,#000 80%,transparent)',
                  maskImage: 'linear-gradient(90deg,#000 80%,transparent)',
                }}
              >
                {(V.brands || []).map((b, $index) => (
                  <React.Fragment key={$index}>
                    <span
                      style={{
                        flexShrink: '0',
                        height: '48px',
                        padding: '0 18px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '12px',
                        background: '#161616',
                        border: '1px solid #242424',
                        color: '#C9C9C9',
                        fontFamily: b?.ff,
                        fontSize: '15px',
                        fontWeight: b?.fw,
                        letterSpacing: b?.ls,
                      }}
                    >
                      {b?.n}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Projects'}</h3>
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
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: '#161616',
                        border: '1px solid #242424',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          aspectRatio: p?.ar,
                          background: 'repeating-linear-gradient(135deg,#1C1C1C 0 10px,#232323 10px 11px)',
                        }}
                      >
                        <Fill src={p?.image} alt={p?.title} />
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        {p?.tag ? <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#FFB38A' }}>{p?.tag}</div> : null}
                        <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '2px' }}>{p?.title}</div>
                        <div style={{ fontSize: '13px', color: '#C9C9C9' }}>{p?.result}</div>
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
                              marginTop: '6px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                            }}
                            className="dcp-c9"
                          >
                            <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
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
          {CARD.photos.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Portfolio'}</h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'Contact'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <EnquiryForm
                  fieldStyle={{
                    height: '56px',
                    borderRadius: '16px',
                    background: '#161616',
                    border: '1px solid #2C2C2C',
                  }}
                  placeholderColor={'#A8A8A8'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg,#FF3D77,#FF9A3D)',
                    color: '#0D0D0D',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                  buttonLabel={'Send message'}
                  messageHeight="104px"
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
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#4ADE80' }}></span>
                    {'Prefer WhatsApp? DM me'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'Sora',sans-serif", fontSize: '20px', fontWeight: '700' }}>{'QR code'}</h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '20px 16px',
                  borderRadius: '24px',
                  background: 'radial-gradient(70% 60% at 50% 0%, rgba(255,61,119,.22), transparent), #161616',
                  border: '1px solid #242424',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '172px',
                    height: '172px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    background: '#fff',
                    borderRadius: '20px',
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
                      background: 'linear-gradient(135deg,#FF3D77,#FF9A3D)',
                    }}
                  ></div>
                </div>
                <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '48px',
                      borderRadius: '999px',
                      border: '1px solid #3A3A3A',
                      background: '#0D0D0D',
                      color: '#fff',
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
                      background: '#fff',
                      color: '#0D0D0D',
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
          <CustomSections headStyle={{ fontFamily: "'Sora',sans-serif" }} />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12.5px', color: '#A8A8A8' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#fff', fontWeight: '600' }}>
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
                  color: '#FFB38A',
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
                background: 'rgba(13,13,13,.97)',
                borderTop: '1px solid #222',
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
                      background: 'linear-gradient(135deg,#FF3D77,#FF9A3D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0D0D0D',
                    }}
                  ></span>
                  {'My AI'}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            {f?.tip ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    bottom: '66px',
                    width: 'max-content',
                    padding: '10px 12px',
                    borderRadius: '16px 16px 4px 16px',
                    background: '#fff',
                    color: '#0D0D0D',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(0,0,0,.4)',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <span
              style={{
                height: '32px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '999px',
                background: '#fff',
                color: '#0D0D0D',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 6px 18px rgba(0,0,0,.35)',
              }}
            >
              {'Chat with my AI'}
            </span>
            <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: '0' }}>
              <span
                style={{
                  position: 'absolute',
                  inset: '0',
                  borderRadius: '50%',
                  background: 'conic-gradient(#FF3D77,#FF9A3D,#FF3D77)',
                  animation: 'c_ringSpin 5s linear infinite',
                  willChange: 'transform',
                }}
              ></span>
              <span
                style={{
                  position: 'absolute',
                  inset: '3px',
                  borderRadius: '50%',
                  background: '#0D0D0D',
                  padding: '2px',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#2A2A2A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Sora',sans-serif",
                    fontSize: '14px',
                    fontWeight: '800',
                  }}
                >
                  {CARD.initials}
                </span>
              </span>
              <span
                dangerouslySetInnerHTML={V.icS?.sparkXs}
                style={{
                  position: 'absolute',
                  right: '-2px',
                  bottom: '-2px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#FF3D77,#FF9A3D)',
                  border: '2px solid #0D0D0D',
                  color: '#0D0D0D',
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
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'radial-gradient(70% 22% at 50% 0%, rgba(255,61,119,.25), transparent 70%), #121212',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <span style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#3A3A3A' }}></span>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px 12px 16px', borderBottom: '1px solid #222' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  padding: '2px',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg,#FF3D77,#FF9A3D)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #121212',
                    boxSizing: 'border-box',
                    background: '#2A2A2A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Sora',sans-serif",
                    fontSize: '13px',
                    fontWeight: '800',
                  }}
                >
                  {CARD.initials}
                </div>
              </div>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '15.5px', fontWeight: '700' }}>{`${CARD.firstName}'s AI`}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#B8B8B8' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }}></span>
                  {`Talks like ${CARD.firstName} · online`}
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
                      borderRadius: '20px 20px 20px 6px',
                      background: '#222',
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
                      borderRadius: '20px 20px 6px 20px',
                      background: 'linear-gradient(90deg,#FF3D77,#FF9A3D)',
                      color: '#0D0D0D',
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
                      borderRadius: '20px 20px 20px 6px',
                      background: '#222',
                    }}
                  >
                    <span
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF9A3D', animation: 'c_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#FF9A3D',
                        animation: 'c_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#FF9A3D',
                        animation: 'c_dotB 1.2s .3s infinite',
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
                      background: 'linear-gradient(#121212,#121212) padding-box, linear-gradient(90deg,#FF3D77,#FF9A3D) border-box',
                    }}
                    className="dcp-c10"
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
                  background: '#1F1F1F',
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
                  placeholder={`Message ${CARD.firstName}'s AI…`}
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
                    '--wc-ph': '#9A9A9A',
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
                  background: 'linear-gradient(135deg,#FF3D77,#FF9A3D)',
                  color: '#0D0D0D',
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
