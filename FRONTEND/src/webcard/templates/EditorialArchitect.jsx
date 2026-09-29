import React from 'react';
import W from '../webcard-shared.js';
import { CARD } from '../cardData.js';
import {
  DCLogic,
  useDC,
  useLive,
  liveFrame,
  ImageSlot,
  Fill,
  CardQR,
  EnquiryForm,
  CustomSections,
  downloadQR,
  openLink,
  saveContact,
  shareCard,
  scrollToSection,
  enquire,
  ReelMedia,
  useChat,
  ChatThread,
  ChatText,
  SwipeRow,
} from '../dc-runtime.jsx';

class Logic extends DCLogic {
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
    const frames = W.frames({ small: { cover: 104, tabBottom: 476 } }).map((f) => ({
      ...f,
      cover: f.cover || 232,
      tabBottom: f.tabBottom || (f.rest ? 120 : 620),
    }));
    const tones = ['#CFC6B8', '#B9AE9E', '#DDD5C9', '#A99F90', '#C6BBAA', '#E2DBD0'];
    const two = (i) => String(i + 1).padStart(2, '0');
    const bar = CARD.barFrom([
      { label: 'Call', icon: ic.phone },
      { label: 'WhatsApp', icon: ic.wa },
      { label: 'Save', icon: ic.userPlus },
    ]);
    return {
      frames,
      ic,
      bio: CARD.bio,
      bio2: CARD.bio,
      skillsLine: CARD.skills.join(', '),
      spark: W.grad('#B5573B', '#D9A35E', 14, 'g9'),
      icS: { badge: W.svg(W.P.badge, 14, 2) },
      quick: CARD.quickFrom([
        { label: 'Call', icon: ic.phone },
        { label: 'WhatsApp', icon: ic.wa },
        { label: 'Email', icon: ic.mail },
        { key: 'Location', label: 'Studio', icon: ic.pin },
      ]),
      socials: CARD.socialsFrom(),
      nav: CARD.navFrom(['Portfolio', 'Profile', 'Services', 'Projects', 'Reels', 'Contact', 'QR'].map((label) => ({ label }))).map(
        (n, i) => ({
          ...n,
          fg: i === 0 ? '#A14A30' : '#5E5850',
          line: i === 0 ? 'inset 0 -2px 0 #B5573B' : 'none',
        }),
      ),
      masonry: CARD.fill(
        CARD.photos,
        [
          { c: '1 / span 4', r: 'span 5' },
          { c: '5 / span 2', r: 'span 3' },
          { c: '5 / span 2', r: 'span 4' },
          { c: '1 / span 2', r: 'span 3' },
          { c: '3 / span 2', r: 'span 2' },
          { c: '3 / span 4', r: 'span 3' },
        ].map((m, i) => ({ ...m, bg: tones[i] })),
      ).map((m, i) => ({ ...m, n: two(i) })),
      stats: CARD.stats,
      services: CARD.services.map((sv, i) => ({ ...sv, n: two(i) })),
      projects: CARD.projects.map((p, i) => ({
        ...p,
        fig: 'Fig. ' + two(i),
        ar: ['4/5', '3/2', '1/1'][i % 3],
        m: ['0', '0 16px', '0 0 0 64px'][i % 3],
        bg: tones[(i + 1) % tones.length],
      })),
      reels: CARD.reels,
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
    };
  }
}

export function EditorialArchitect(props) {
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
        background: '#F4F1EC',
        color: '#1C1C1C',
        fontFamily: "'Inter',sans-serif",
        containerType: 'inline-size',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}
    >
      <div
        style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
        }}
      >
        {CARD.company ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '22px', height: '22px', overflow: 'hidden', background: '#E4DED4', borderRadius: '2px' }}>
              <ImageSlot id={`t9-logo-${f?.key}`} shape={'rect'} placeholder={'Logo'} style={{ width: '100%', height: '100%' }} />
            </span>
            {CARD.company}
          </span>
        ) : null}
        <span style={{ color: '#5E5850' }}>{'Vol. 01'}</span>
      </div>
      <div
        style={{ position: 'relative', height: `${f?.cover}px`, overflow: 'hidden', background: 'linear-gradient(160deg,#CFC6B8,#A99F90)' }}
      >
        <ImageSlot
          id={`t9-cover-${f?.key}`}
          shape={'rect'}
          placeholder={'Architectural cover image'}
          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
        />
        {CARD.location ? (
          <span
            style={{
              position: 'absolute',
              left: '16px',
              bottom: '10px',
              fontSize: '11px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#1C1C1C',
              background: '#F4F1EC',
              padding: '3px 8px',
              pointerEvents: 'none',
            }}
          >
            {'Fig. 00 — ' + CARD.location}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '0 16px' }}>
        <h1
          style={{
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: '14px 0 0',
            minWidth: '0',
            fontFamily: "'DM Serif Display',serif",
            fontWeight: '400',
            fontSize: 'clamp(40px, 12cqi, 50px)',
            lineHeight: '.95',
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
          <span style={{ color: '#B5573B' }}>{'.'}</span>
        </h1>
        <div
          style={{
            flexShrink: '0',
            width: '96px',
            aspectRatio: '1',
            marginTop: '-48px',
            position: 'relative',
            zIndex: 1,
            borderRadius: '50%',
            padding: '3px',
            boxSizing: 'border-box',
            background: '#F4F1EC',
            boxShadow: '0 0 0 1px #1C1C1C',
          }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#E4DED4' }}>
            <ImageSlot id={`t9-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 10px' }}>
          {CARD.roleLine ? (
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '.16em', textTransform: 'uppercase' }}>
              {[CARD.role, CARD.company].filter(Boolean).join(' — ')}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '24px',
              padding: '0 8px',
              border: '1px solid #1C1C1C',
              borderRadius: '2px',
              fontSize: '11.5px',
              fontWeight: '600',
            }}
          >
            <span dangerouslySetInnerHTML={V.icS?.badge} style={{ display: 'flex' }}></span>
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
                borderRadius: '2px',
                fontSize: '11.5px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#F4F1EC,#F4F1EC) padding-box, linear-gradient(90deg,#B5573B,#D9A35E) border-box',
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
              margin: '2px 0 0',
              fontSize: '16px',
              lineHeight: '1.55',
              color: '#3A3632',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minHeight: '40px' }}>
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{
                position: 'relative',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                textDecorationColor: '#B5573B',
              }}
              className="dcp-e0"
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
                padding: '0 10px',
                borderRadius: '2px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid transparent',
                background: 'linear-gradient(#F4F1EC,#F4F1EC) padding-box, linear-gradient(90deg,#B5573B,#D9A35E) border-box',
              }}
              className="dcp-e1"
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
                  border: '1px solid #1C1C1C',
                  boxSizing: 'border-box',
                }}
                className="dcp-e2"
              ></span>
              <span style={{ fontSize: '12px', color: '#5E5850' }}>{q?.label}</span>
            </a>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px 0' }}>
        {(V.socials || []).map((s, $index) => (
          <React.Fragment key={$index}>
            <a
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.name}
              dangerouslySetInnerHTML={s?.icon}
              style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ></a>
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)',
          gap: '12px',
          padding: '8px 16px 0',
          alignItems: 'center',
        }}
      >
        <button
          onClick={saveContact}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            borderRadius: '2px',
            background: '#B5573B',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          className="dcp-e3"
        >
          <span dangerouslySetInnerHTML={V.ic?.userPlus} style={{ display: 'flex' }}></span>
          {'Save Contact'}
        </button>
        <a
          href={'#'}
          onClick={shareCard}
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'underline',
            textUnderlineOffset: '5px',
            textDecorationThickness: '1px',
            cursor: 'pointer',
          }}
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          {'Share card'}
        </a>
      </div>
      {f?.above ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              overflow: 'hidden',
              padding: '0 16px',
              marginTop: '18px',
              borderTop: '1px solid #1C1C1C',
              borderBottom: '1px solid #D9D2C7',
              position: 'sticky',
              top: '0',
              zIndex: '4',
              background: '#F4F1EC',
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
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: n?.fg,
                    boxShadow: n?.line,
                  }}
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.photos.length > 0 ? (
            <div style={{ padding: '24px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: '0', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>
                  {'Selected '}
                  <i>{'work'}</i>
                </h3>
                <span style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#5E5850' }}>
                  {CARD.photos.length + (CARD.photos.length === 1 ? ' image' : ' images')}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6,minmax(0,1fr))',
                  gridAutoRows: 'clamp(30px, 9.5cqi, 38px)',
                  gap: '6px',
                }}
              >
                {(V.masonry || []).map((m, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={openLink(m?.src)}
                      role="button"
                      style={{
                        gridColumn: m?.c,
                        gridRow: m?.r,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: m?.bg,
                      }}
                    >
                      <Fill src={m?.src} />
                      <span
                        style={{
                          position: 'absolute',
                          left: '6px',
                          bottom: '5px',
                          fontSize: '10.5px',
                          letterSpacing: '.1em',
                          color: '#1C1C1C',
                          background: '#F4F1EC',
                          padding: '1px 5px',
                        }}
                      >
                        {m?.n}
                      </span>
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
            <div style={{ padding: '32px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>
                {'Profile'}
              </h3>

              {V.bio ? <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.7', color: '#3A3632' }}>{V.bio}</p> : null}
              {V.stats?.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    marginTop: '20px',
                    borderTop: '1px solid #1C1C1C',
                  }}
                >
                  {(V.stats || []).map((st, $index) => (
                    <React.Fragment key={$index}>
                      <div style={{ padding: '12px 0 0' }}>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '34px', lineHeight: '1' }}>{st?.v}</div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            letterSpacing: '.14em',
                            textTransform: 'uppercase',
                            color: '#5E5850',
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
              {V.skillsLine || CARD.location || CARD.languages.length ? (
                <div style={{ marginTop: '18px', fontSize: '14px', lineHeight: '1.8', color: '#3A3632' }}>
                  {V.skillsLine ? (
                    <>
                      <b style={{ color: '#1C1C1C' }}>{'Tools'}</b>
                      {' — '}
                      {V.skillsLine}
                    </>
                  ) : null}
                  {V.skillsLine && (CARD.languages.length || CARD.location) ? <br /> : null}
                  {CARD.languages.length ? (
                    <>
                      <b style={{ color: '#1C1C1C' }}>{'Languages'}</b>
                      {' — ' + CARD.languages.join(', ')}
                      {CARD.location ? <br /> : null}
                    </>
                  ) : null}
                  {CARD.location ? (
                    <>
                      <b style={{ color: '#1C1C1C' }}>{'Based in'}</b>
                      {' — ' + CARD.location}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {CARD.services.length > 0 ? (
            <div style={{ padding: '36px 16px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>
                {'Services'}
              </h3>
              {(V.services || []).map((sv, $index) => (
                <React.Fragment key={$index}>
                  <div style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: '1px solid #D9D2C7' }}>
                    <span
                      style={{
                        width: '28px',
                        flexShrink: '0',
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '.1em',
                        color: '#A14A30',
                        paddingTop: '6px',
                      }}
                    >
                      {sv?.n}
                    </span>
                    <div style={{ flex: '1', minWidth: '0' }}>
                      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '22px' }}>{sv?.title}</div>
                      <div style={{ fontSize: '14.5px', lineHeight: '1.5', color: '#5E5850' }}>{sv?.desc}</div>
                      <div style={{ display: 'flex', gap: '18px', marginTop: '6px', fontSize: '13.5px', fontWeight: '600' }}>
                        <a
                          role="button"
                          onClick={enquire(sv)}
                          href={'#contact'}
                          style={{
                            position: 'relative',
                            minHeight: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px',
                          }}
                          className="dcp-e4"
                        >
                          {'Enquire'}
                        </a>
                        {CARD.ai.enabled ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat();
                            }}
                            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#A14A30' }}
                            className="dcp-e5"
                          >
                            {'Ask AI ✦'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '36px 0 0' }}>
              <h3 style={{ margin: '0 16px 14px', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>
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
                        marginBottom: '28px',
                      }}
                    >
                      <div style={{ position: 'relative', aspectRatio: p?.ar, margin: 0, background: p?.bg }}>
                        <ImageSlot
                          id={`t9-proj-${f?.key}-${$index}`}
                          shape={'rect'}
                          placeholder={'Project spread image'}
                          style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
                        />
                      </div>
                      <div style={{ padding: '10px 16px 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px' }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '600',
                            letterSpacing: '.14em',
                            textTransform: 'uppercase',
                            color: '#A14A30',
                            paddingTop: '6px',
                          }}
                        >
                          {p?.fig}
                        </span>
                        <div>
                          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '26px', lineHeight: '1.1' }}>{p?.title}</div>
                          {p?.tag ? (
                            <div
                              style={{
                                fontSize: '12px',
                                letterSpacing: '.14em',
                                textTransform: 'uppercase',
                                color: '#5E5850',
                                marginTop: '4px',
                              }}
                            >
                              {p?.tag}
                            </div>
                          ) : null}
                          <p style={{ margin: '8px 0 0', fontSize: '15px', lineHeight: '1.6', color: '#3A3632' }}>{p?.result}</p>
                          <div style={{ display: 'flex', gap: '18px', fontSize: '13.5px', fontWeight: '600' }}>
                            {p?.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  minHeight: '40px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '4px',
                                }}
                              >
                                {'View project →'}
                              </a>
                            ) : null}
                            {CARD.ai.enabled ? (
                              <span
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChat();
                                }}
                                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', color: '#A14A30' }}
                                className="dcp-e6"
                              >
                                {'Ask AI ✦'}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '8px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>{'Reels'}</h3>
              <div
                data-wc-reels="1"
                style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', marginRight: '-16px' }}
              >
                {(V.reels || []).map((r, $index) => (
                  <React.Fragment key={$index}>
                    <div
                      onClick={r?.kind === 'external' ? openLink(r.href) : undefined}
                      role="button"
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', flex: '0 0 42%' }}
                    >
                      <div
                        style={{
                          aspectRatio: '9/16',
                          position: 'relative',
                          background: 'linear-gradient(160deg,#B8AE9F,#7E7466)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <ReelMedia reel={r} index={$index} />
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
                            background: '#F4F1EC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        ></span>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', marginTop: '6px' }}>{r?.title}</div>
                      <div style={{ fontSize: '12px', color: '#5E5850' }}>{r?.platform}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '36px 16px 0' }}>
              <h3 style={{ margin: '0 0 4px', fontFamily: "'DM Serif Display',serif", fontWeight: '400', fontSize: '28px' }}>
                {'Contact'}
              </h3>
              <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#5E5850' }}>{'Commissions and collaborations.'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <EnquiryForm
                  fieldStyle={{ height: '56px', borderBottom: '1px solid #1C1C1C' }}
                  placeholderColor={'#5E5850'}
                  buttonStyle={{
                    marginTop: '14px',
                    height: '48px',
                    border: 'none',
                    borderRadius: '2px',
                    background: '#1C1C1C',
                    color: '#F4F1EC',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                  buttonLabel={'Send enquiry'}
                  messageHeight="92px"
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
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex' }}></span>
                    {'Prefer WhatsApp?'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '28px 16px 0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #1C1C1C' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '136px',
                    height: '136px',
                    flexShrink: '0',
                    padding: '10px',
                    boxSizing: 'border-box',
                    background: '#FFFFFF',
                  }}
                >
                  <CardQR style={{ width: '100%', height: '100%' }} />
                </div>
                <div style={{ flex: '1', minWidth: '0' }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '24px', lineHeight: '1.1' }}>
                    {'Keep this '}
                    <i>{'card'}</i>
                  </div>
                  <div style={{ fontSize: '13px', color: '#5E5850', margin: '4px 0 8px' }}>{CARD.cardUrl.replace(/^https?:\/\//, '')}</div>
                  <button
                    onClick={shareCard}
                    role="button"
                    style={{
                      width: '100%',
                      height: '44px',
                      border: 'none',
                      borderRadius: '2px',
                      background: '#B5573B',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {'Share card'}
                  </button>
                  <a
                    onClick={downloadQR}
                    role="button"
                    href={'#'}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      minHeight: '40px',
                      alignItems: 'center',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                    className="dcp-e7"
                  >
                    {'Download QR'}
                  </a>
                </div>
              </div>
            </div>
          ) : null}
          <CustomSections headStyle={{ fontFamily: "'DM Serif Display',serif" }} />
          <div style={{ padding: '32px 16px 110px', textAlign: 'center' }}>
            {CARD.branding ? (
              <div style={{ fontSize: '11.5px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#5E5850' }}>
                {'Powered by '}
                <a href={'/'} style={{ color: '#1C1C1C', fontWeight: '600' }}>
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
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: '18px',
                  fontStyle: 'italic',
                  color: '#A14A30',
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
                background: 'rgba(244,241,236,.97)',
                borderTop: '1px solid #1C1C1C',
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
                      letterSpacing: '.06em',
                    }}
                  >
                    <span dangerouslySetInnerHTML={b?.icon} style={{ display: 'flex' }}></span>
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
                    letterSpacing: '.06em',
                    color: '#A14A30',
                  }}
                  className="dcp-e8"
                >
                  <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: '19px', lineHeight: '22px' }}>{'✦'}</span>
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
              right: 'max(0px, calc((var(--wc-vw, 100vw) - 480px) / 2))',
              bottom: `${f?.tabBottom}px`,
              zIndex: '6',
              cursor: 'pointer',
            }}
          >
            {f?.tip ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    right: '48px',
                    top: '28px',
                    width: 'max-content',
                    padding: '9px 12px',
                    background: '#1C1C1C',
                    color: '#F4F1EC',
                    fontSize: '13.5px',
                    fontWeight: '500',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              style={{
                width: '40px',
                height: '104px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1C1C1C',
                color: '#F4F1EC',
                borderRadius: '2px 0 0 2px',
                boxShadow: '-4px 6px 18px rgba(28,28,28,.2)',
              }}
            >
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: '18px',
                  letterSpacing: '.04em',
                }}
              >
                {'Ask '}
                <span style={{ color: '#E08A6C' }}>{'✦'}</span>
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
              background: 'rgba(28,28,28,.4)',
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
              top: '0',
              right: 'max(0px, calc((100vw - 480px) / 2))',
              bottom: '0',
              width: '90%',
              zIndex: '41',
              display: 'flex',
              flexDirection: 'column',
              background: '#F4F1EC',
              borderLeft: '1px solid #1C1C1C',
              boxShadow: '-20px 0 40px rgba(28,28,28,.2)',
              maxWidth: '432px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-40px',
                top: '40%',
                width: '40px',
                height: '104px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1C1C1C',
                color: '#F4F1EC',
                borderRadius: '2px 0 0 2px',
              }}
            >
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: '18px',
                }}
              >
                {'Close ✕'}
              </span>
            </div>
            <div style={{ height: `${f?.statusH}px` }}></div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 6px 14px 18px',
                borderBottom: '1px solid #1C1C1C',
              }}
            >
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '.18em', textTransform: 'uppercase', color: '#A14A30' }}>
                  {'Ask ✦'}
                </div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '26px', lineHeight: '1.1', marginTop: '2px' }}>
                  {`${CARD.firstName}'s AI Assistant`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5E5850', marginTop: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3D7A4F' }}></span>
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
                padding: '16px 18px',
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
                    style={{ alignSelf: 'flex-start', maxWidth: '90%', fontSize: '15.5px', lineHeight: '1.55', color: '#1C1C1C' }}
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
                      background: '#1C1C1C',
                      color: '#F4F1EC',
                      fontSize: '15px',
                      lineHeight: '1.45',
                    }}
                  >
                    {text}
                  </div>
                )}
                typing={
                  <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '5px', padding: '6px 0' }}>
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B5573B', animation: 'e_dotB 1.2s infinite' }}
                    ></span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#B5573B',
                        animation: 'e_dotB 1.2s .15s infinite',
                      }}
                    ></span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#B5573B',
                        animation: 'e_dotB 1.2s .3s infinite',
                      }}
                    ></span>
                  </div>
                }
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '8px 18px 4px' }}>
              {chat.chips.map((c, $index) => (
                <React.Fragment key={$index}>
                  <span
                    role="button"
                    onClick={() => chat.send(c)}
                    style={{
                      flexShrink: '0',
                      height: '38px',
                      position: 'relative',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #1C1C1C',
                      borderRadius: '2px',
                      fontSize: '13.5px',
                    }}
                    className="dcp-e9"
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px 30px 18px' }}>
              <div style={{ flex: '1', height: '48px', borderBottom: '1px solid #1C1C1C', display: 'flex', alignItems: 'center' }}>
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={'Write a question…'}
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
                    '--wc-ph': '#5E5850',
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
                  borderRadius: '2px',
                  background: '#B5573B',
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
