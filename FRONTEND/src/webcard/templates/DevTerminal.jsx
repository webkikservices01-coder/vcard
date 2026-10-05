import React from 'react';
import W from '../webcard-shared.js';
import { CARD } from '../cardData.js';
import { DCLogic, useDC, useLive, liveFrame, ImageSlot, CoverImage, CardQR, EnquiryForm, CustomSections, downloadQR, openLink, saveContact, shareCard, scrollToSection, ReelMedia, useChat, ChatThread, ChatText, SwipeRow, ChatMic, ServiceSlides, PhotoSlides, TestimonialSlides } from '../dc-runtime.jsx';
import { themeTree } from '../theme/themeTree.js';

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
  contrib() {
    if (this._c) return this._c;
    const C = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'];
    let s = 11;
    const out = [];
    for (let i = 0; i < 7 * 26; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      out.push(C[r < 0.28 ? 0 : r < 0.55 ? 1 : r < 0.78 ? 2 : r < 0.93 ? 3 : 4]);
    }
    return (this._c = out);
  }
  renderVals() {
    const W = window.WC;
    if (!W) return {};
    const ic = W.ic,
      s14 = (p) => W.svg(W.P[p], 15, 1.9);
    const frames = W.frames({ small: { cover: 118, codeTop: 30, typeBottom: 60 } }).map((f) => {
      const c = f.cover || 210;
      return { ...f, coverT: c + f.statusH, chipTop: f.statusH + 6, codeTop: f.codeTop || f.statusH + 44, typeBottom: f.typeBottom || 64 };
    });
    const ident = (CARD.slug || CARD.firstName || 'me')
      .toLowerCase()
      .replace(/[^a-z0-9_$]/g, '_')
      .replace(/^[0-9]/, '_$&');
    const kebab = (v) =>
      (v || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const bar = CARD.barFrom([
      { key: 'Call', label: 'call', icon: ic.phone, c: '#58A6FF' },
      { key: 'WhatsApp', label: 'whatsapp', icon: ic.wa, c: '#3FB950' },
      { key: 'Save', label: 'save', icon: ic.userPlus, c: '#E6EDF3' },
    ]);
    return {
      frames,
      ic,
      bio: CARD.bio,
      bio2: CARD.bio,
      skills: CARD.skills,
      ident,
      spark: W.grad('#3FB950', '#58A6FF', 14, 'g8'),
      icS: { repo: s14('repo'), star: s14('star'), fork: s14('fork'), ext: W.svg(W.P.ext, 13, 2) },
      codeBg:
        'const ' +
        ident +
        ' = {\n' +
        (CARD.role ? "  role: '" + kebab(CARD.role) + "',\n" : '') +
        (CARD.company ? "  org: '" + kebab(CARD.company) + "',\n" : '') +
        "  ship: () => deploy('prod'),\n};\nexport default " +
        ident +
        ';',
      quick: CARD.quickFrom([
        { key: 'Call', label: 'call', icon: ic.phone, c: '#58A6FF' },
        { key: 'WhatsApp', label: 'whatsapp', icon: ic.wa, c: '#3FB950' },
        { key: 'Email', label: 'email', icon: ic.mail, c: '#58A6FF' },
        { key: 'Location', label: 'map', icon: ic.pin, c: '#58A6FF' },
      ]),
      socials: CARD.socialsFrom(),
      nav: CARD.navFrom(
        [
          ['Profile', 'profile.md'],
          ['Services', 'services.ts'],
          ['Projects', 'projects/'],
          ['Videos', 'videos.mp4'],
          ['Portfolio', 'portfolio/'],
          ['Contact', 'contact.sh'],
          ['QR', 'qr.png'],
        ].map(([key, label]) => ({ key, label })),
      ).map((n, i) => ({
        ...n,
        bg: i === 0 ? '#0D1117' : 'transparent',
        fg: i === 0 ? '#E6EDF3' : '#8B949E',
        sh: i === 0 ? 'inset 0 2px 0 #3FB950' : 'none',
      })),
      stats: CARD.stats,
      contrib: [],
      services: CARD.services.map((sv, i) => ({
        ...sv,
        icon: [ic.code, ic.mobile, ic.trend, ic.cpu][i % 4],
        n: '// ' + String(i + 1).padStart(2, '0'),
      })),
      projects: CARD.projects.map((p) => ({
        ...p,
        repo: ident + '/' + kebab(p.title),
        host: p.pdf ? 'document.pdf' : p.url ? p.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
      })),
      reels: CARD.reels.map((r, i) => ({ ...r, file: 'reel_' + String(i + 1).padStart(2, '0') + '.mp4' })),
      grid6: CARD.photos,
      bar,
      barCols: bar.length + (CARD.ai.enabled ? 1 : 0),
    };
  }
}

export function DevTerminal(props) {
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
        background: '#0D1117',
        color: '#E6EDF3',
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
          backgroundColor: '#0D1117',
          backgroundImage:
            'linear-gradient(rgba(88,166,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        <CoverImage style={{ opacity: 0.55 }} />
        <div
          style={{
            position: 'absolute',
            top: `${f?.codeTop}px`,
            left: '16px',
            right: '16px',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '11.5px',
            lineHeight: '1.7',
            color: '#3B4452',
            whiteSpace: 'pre',
            overflow: 'hidden',
          }}
        >
          {V.codeBg}
        </div>
        <div
          style={{
            position: 'absolute',
            left: '0',
            right: '0',
            bottom: '0',
            height: '60%',
            background: 'linear-gradient(to bottom, rgba(13,17,23,0), #0D1117)',
          }}
        ></div>
        {CARD.company ? (
          <div
            style={{
              position: 'absolute',
              top: `${f?.chipTop}px`,
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 10px 4px 4px',
              borderRadius: '8px',
              background: '#161B22',
              border: '1px solid #30363D',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '12px',
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden', background: '#E6EDF3' }}>
              <ImageSlot
                id={`t8-logo-${f?.key}`}
                shape={'rounded'}
                radius={'6'}
                placeholder={'Logo'}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <span>{CARD.company.toLowerCase().replace(/\s+/g, '-')}</span>
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            right: '16px',
            bottom: `${f?.typeBottom}px`,
            display: 'flex',
            alignItems: 'center',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '13.5px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: '#3FB950' }}>
            {V.ident + '@' + (CARD.company ? CARD.company.toLowerCase().replace(/[^a-z0-9]+/g, '') : 'webcard')}
          </span>
          <span style={{ color: '#8B949E' }}>{':'}</span>
          <span style={{ color: '#58A6FF' }}>{'~'}</span>
          <span style={{ color: '#8B949E' }}>{'$ '}</span>
          <span
            style={{ display: 'inline-block', overflow: 'hidden', width: '0', animation: 'd_typ 5s steps(27) infinite', color: '#E6EDF3' }}
          >
            {'ship clean, scalable code.'}
          </span>
          <span style={{ width: '8px', height: '16px', background: '#3FB950', animation: 'd_blink 1s steps(1) infinite' }}></span>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          padding: '0 16px',
          marginTop: 'calc(clamp(92px, 26cqi, 104px) / -2)',
        }}
      >
        <div
          style={{
            width: 'clamp(92px, 26cqi, 104px)',
            aspectRatio: '1',
            borderRadius: '50%',
            padding: '3px',
            boxSizing: 'border-box',
            background: '#3FB950',
            flexShrink: '0',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #0D1117',
              boxSizing: 'border-box',
              background: '#161B22',
            }}
          >
            <ImageSlot id={`t8-av-${f?.key}`} shape={'circle'} placeholder={'Photo'} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
          <h1
            style={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0',
              fontFamily: "'JetBrains Mono',monospace",
              fontWeight: '700',
              fontSize: 'clamp(24px, 6.8cqi, 28px)',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
            }}
          >
            {CARD.fullName}
          </h1>
          <span dangerouslySetInnerHTML={V.ic?.badge} style={{ display: 'flex', color: '#58A6FF' }}></span>
          {CARD.ai.enabled ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
                padding: '0 8px',
                borderRadius: '6px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '11.5px',
                border: '1px solid transparent',
                background: 'linear-gradient(#0D1117,#0D1117) padding-box, linear-gradient(90deg,#3FB950,#58A6FF) border-box',
              }}
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'ai_enabled'}
            </span>
          ) : null}
        </div>
        {CARD.roleLine ? (
          <p style={{ margin: '0', fontSize: '14.5px', color: '#8B949E' }}>
            {CARD.role}
            {CARD.company ? (
              <>
                {CARD.role ? ' ' : ''}
                <span style={{ color: '#58A6FF' }}>{'@'}</span>
                {' ' + CARD.company}
              </>
            ) : null}
          </p>
        ) : null}
        {V.bio2 ? (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#C9D1D9',
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
          {CARD.bio ? (
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('Profile');
              }}
              href={'#profile'}
              style={{ position: 'relative', fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#58A6FF' }}
              className="dcp-d0"
            >
              {'read_more()'}
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
                borderRadius: '6px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '12.5px',
                border: '1px solid transparent',
                background: 'linear-gradient(#0D1117,#0D1117) padding-box, linear-gradient(90deg,#3FB950,#58A6FF) border-box',
              }}
              className="dcp-d1"
            >
              <span dangerouslySetInnerHTML={V.spark} style={{ display: 'flex' }}></span>
              {'ai --summary'}
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
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#161B22',
                  border: '1px solid #30363D',
                  color: q?.c,
                  boxSizing: 'border-box',
                }}
                className="dcp-d2"
              ></span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: '#8B949E' }}>{q?.label}</span>
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
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E6EDF3',
                border: '1px solid #30363D',
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
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            borderRadius: '8px',
            background: '#3FB950',
            color: '#0D1117',
            cursor: 'pointer',
          }}
          className="dcp-d3"
        >
          <span dangerouslySetInnerHTML={V.ic?.userPlus} style={{ display: 'flex' }}></span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.15' }}>
            <span style={{ fontSize: '15px', fontWeight: '700' }}>{'Save Contact'}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', fontWeight: '500', opacity: '.8' }}>
              {'save_contact()'}
            </span>
          </span>
        </button>
        <button
          onClick={shareCard}
          style={{
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '8px',
            border: '1px solid #30363D',
            background: '#161B22',
            color: '#E6EDF3',
            cursor: 'pointer',
          }}
          className="dcp-d4"
        >
          <span dangerouslySetInnerHTML={V.ic?.share} style={{ display: 'flex' }}></span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.15' }}>
            <span style={{ fontSize: '15px', fontWeight: '600' }}>{'Share'}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8B949E' }}>{'share()'}</span>
          </span>
        </button>
      </div>
      {f?.above ? (
        <>
          <div
            style={{
              display: 'flex',
              overflow: 'hidden',
              marginTop: '18px',
              background: '#0D1117',
              borderTop: '1px solid #30363D',
              borderBottom: '1px solid #30363D',
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
                    height: '44px',
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '13px',
                    background: n?.bg,
                    color: n?.fg,
                    boxShadow: n?.sh,
                    borderRight: '1px solid #30363D',
                  }}
                >
                  {n?.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          {CARD.bio || CARD.location || CARD.languages.length || CARD.skills.length || CARD.stats.length || CARD.experience.length ? (
            <div style={{ padding: '20px 16px 0' }}>
              <div style={{ borderRadius: '8px', border: '1px solid #30363D', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 14px',
                    background: '#161B22',
                    borderBottom: '1px solid #30363D',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  <span dangerouslySetInnerHTML={V.icS?.repo} style={{ display: 'flex', color: '#8B949E' }}></span>
                  {'README.md'}
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                    {'# Profile'}
                  </h3>
                  {V.bio ? <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.6', color: '#C9D1D9' }}>{V.bio}</p> : null}
                  {V.stats?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '8px', marginTop: '14px' }}>
                      {(V.stats || []).map((st, $index) => (
                        <React.Fragment key={$index}>
                          <div style={{ padding: '10px', borderRadius: '8px', background: '#161B22', border: '1px solid #30363D' }}>
                            <div
                              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '20px', fontWeight: '700', color: '#3FB950' }}
                            >
                              {st?.v}
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: '#8B949E' }}>{st?.l}</div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : null}
                  {V.contrib?.length > 0 ? (
                    <div style={{ marginTop: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: '12px',
                          color: '#8B949E',
                          marginBottom: '8px',
                        }}
                      >
                        <span>{'1,284 contributions · last 6 months'}</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateRows: 'repeat(7, 9px)',
                          gridAutoFlow: 'column',
                          gridAutoColumns: '9px',
                          gap: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        {(V.contrib || []).map((c, $index) => (
                          <React.Fragment key={$index}>
                            <span style={{ borderRadius: '2px', background: c }}></span>
                          </React.Fragment>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '3px',
                          marginTop: '6px',
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: '11px',
                          color: '#8B949E',
                        }}
                      >
                        {'less '}
                        <span
                          style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#161B22', border: '1px solid #30363D' }}
                        ></span>
                        <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#0E4429' }}></span>
                        <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#006D32' }}></span>
                        <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#26A641' }}></span>
                        <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#39D353' }}></span>
                        {' more'}
                      </div>
                    </div>
                  ) : null}
                  {V.skills?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                      {(V.skills || []).map((sk, $index) => (
                        <React.Fragment key={$index}>
                          <span
                            style={{
                              height: '28px',
                              padding: '0 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '999px',
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: '12.5px',
                              background: 'rgba(88,166,255,.12)',
                              color: '#79C0FF',
                            }}
                          >
                            {sk}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : null}
                  {CARD.location || CARD.languages.length ? (
                    <div style={{ marginTop: '12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#8B949E' }}>
                      {CARD.languages.length ? (
                        <>
                          {'lang: '}
                          <span style={{ color: '#E6EDF3' }}>{JSON.stringify(CARD.languages)}</span>
                          {CARD.location ? ' · ' : ''}
                        </>
                      ) : null}
                      {CARD.location ? (
                        <>
                          {'loc: '}
                          <span style={{ color: '#E6EDF3' }}>{JSON.stringify(CARD.location)}</span>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {f?.rest ? (
        <>
          {CARD.services.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
                {'Services'}
              </h3>
              <ServiceSlides items={CARD.services} />
            </div>
          ) : null}
          {CARD.testimonials.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
                {'Testimonials'}
              </h3>
              <TestimonialSlides items={CARD.testimonials} />
            </div>
          ) : null}
          {CARD.projects.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
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
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid #30363D',
                        background: '#0D1117',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span dangerouslySetInnerHTML={V.icS?.repo} style={{ display: 'flex', color: '#8B949E' }}></span>
                        <span
                          style={{
                            flex: '1',
                            minWidth: '0',
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#58A6FF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p?.repo}
                        </span>
                        <span
                          style={{
                            height: '22px',
                            padding: '0 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '999px',
                            border: '1px solid #30363D',
                            fontSize: '11.5px',
                            color: '#8B949E',
                          }}
                        >
                          {'Public'}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '8px' }}>{p?.title}</div>
                      <div style={{ fontSize: '13.5px', color: '#8B949E', marginTop: '2px' }}>{p?.result}</div>
                      {p?.url ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginTop: '10px',
                            fontSize: '12.5px',
                            color: '#8B949E',
                          }}
                        >
                          <span style={{ minWidth: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.host}
                          </span>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              marginLeft: 'auto',
                              minHeight: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: "'JetBrains Mono',monospace",
                              fontWeight: '700',
                              color: '#3FB950',
                            }}
                          >
                            {'live'}
                            <span dangerouslySetInnerHTML={V.icS?.ext} style={{ display: 'flex' }}></span>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </React.Fragment>
                ))}
              </SwipeRow>
            </div>
          ) : null}
          {CARD.reels.length > 0 ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
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
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(160deg,#1C2430,#0D1117)',
                        border: '1px solid #30363D',
                      }}
                    >
                      <ReelMedia reel={r} index={$index} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: '11px',
                          color: '#8B949E',
                        }}
                      >
                        {r?.file}
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
                          background: '#3FB950',
                          color: '#0D1117',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      ></span>
                      <span
                        style={{ position: 'absolute', left: '10px', right: '10px', bottom: '10px', fontSize: '13px', fontWeight: '600' }}
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
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
                {'Portfolio'}
              </h3>
              <PhotoSlides items={CARD.photos} />
            </div>
          ) : null}
          {CARD.showEnquiry ? (
            <div style={{ padding: '28px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
                {'Contact'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <EnquiryForm
                  fieldStyle={{
                    height: '56px',
                    borderRadius: '8px',
                    background: '#0D1117',
                    border: '1px solid #30363D',
                  }}
                  placeholderColor={'#8B949E'}
                  buttonStyle={{
                    height: '48px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#3FB950',
                    color: '#0D1117',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                  buttonLabel={'Send message '}
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
                    }}
                  >
                    <span dangerouslySetInnerHTML={V.ic?.wa} style={{ display: 'flex', color: '#3FB950' }}></span>
                    {'Prefer WhatsApp? Ping me'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {CARD.showQr ? (
            <div style={{ padding: '24px 16px 0' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: '700' }}>
                <span style={{ color: '#8B949E' }}>{'## '}</span>
                {'QR'}
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#161B22',
                  border: '1px solid #30363D',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '124px',
                    height: '124px',
                    flexShrink: '0',
                    padding: '8px',
                    boxSizing: 'border-box',
                    background: '#E6EDF3',
                    borderRadius: '6px',
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
                      border: '2px solid #E6EDF3',
                      background: '#0D1117',
                      color: '#3FB950',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '11px',
                      fontWeight: '700',
                    }}
                  >
                    {'>_'}
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '12.5px',
                      color: '#8B949E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {CARD.cardUrl.replace(/^https?:\/\//, '')}
                  </div>
                  <button
                    onClick={downloadQR}
                    role="button"
                    style={{
                      height: '44px',
                      borderRadius: '8px',
                      border: '1px solid #30363D',
                      background: '#0D1117',
                      color: '#E6EDF3',
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
                      borderRadius: '8px',
                      border: 'none',
                      background: '#E6EDF3',
                      color: '#0D1117',
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
          <CustomSections headStyle={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px' }} />
          <div style={{ padding: '28px 16px 110px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}>
            {CARD.branding ? (
              <div style={{ fontSize: '12px', color: '#8B949E' }}>
                {'// powered by '}
                <a href={'/'} style={{ color: '#E6EDF3' }}>
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
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#58A6FF',
                }}
              >
                {'$ get --own-ai-webcard →'}
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
                background: 'rgba(13,17,23,.97)',
                borderTop: '1px solid #30363D',
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
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '11px',
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
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '11px',
                  }}
                >
                  <span
                    style={{ height: '22px', display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: '700', color: '#3FB950' }}
                  >
                    {'>_'}
                  </span>
                  {'ai'}
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
                    bottom: '64px',
                    width: 'max-content',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#161B22',
                    border: '1px solid #3FB950',
                    fontSize: '13.5px',
                    boxShadow: '0 10px 30px rgba(0,0,0,.4)',
                  }}
                >
                  {`Ask me anything about ${CARD.firstName} 👋`}
                </div>
              </>
            ) : null}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: '#161B22',
                border: '1px solid #3FB950',
                boxShadow: '0 0 0 4px rgba(63,185,80,.12), 0 10px 24px rgba(0,0,0,.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '18px',
                fontWeight: '700',
                color: '#3FB950',
              }}
            >
              {'>'}
              <span
                style={{ width: '9px', height: '3px', marginTop: '12px', background: '#3FB950', animation: 'd_blink 1s steps(1) infinite' }}
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
              background: 'rgba(1,4,9,.65)',
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
              borderRadius: '14px 14px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#010409',
              borderTop: '1px solid #30363D',
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px', background: '#161B22' }}>
              <span style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#30363D' }}></span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 6px 8px 14px',
                background: '#161B22',
                borderBottom: '1px solid #30363D',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F85149' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#D29922' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#3FB950' }}></span>
              </div>
              <div style={{ flex: '1', minWidth: '0', textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13.5px', fontWeight: '700' }}>
                  {`${CARD.firstName}'s AI Assistant`}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '11.5px',
                    color: '#8B949E',
                  }}
                >
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3FB950' }}></span>
                  {'online · zsh'}
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
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '13.5px',
                lineHeight: '1.55',
              }}
            >
              <div style={{ color: '#8B949E' }}>{'Last login: today · ' + CARD.cardUrl.replace(/^https?:\/\//, '')}</div>
              <ChatThread
                chat={chat}
                bot={(text, i) => (
                  <div key={i} style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', color: '#C9D1D9' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#3FB950' }}>{'ai ▸ '}</span>
                    <ChatText text={text} />
                  </div>
                )}
                user={(text, i) => (
                  <div key={i}>
                    <span style={{ color: '#3FB950' }}>{'visitor@card'}</span>
                    <span style={{ color: '#8B949E' }}>{':'}</span>
                    <span style={{ color: '#58A6FF' }}>{'~'}</span>
                    <span style={{ color: '#8B949E' }}>{'$ '}</span>
                    {text}
                  </div>
                )}
                typing={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3FB950' }}>
                    {'ai ▸ '}
                    <span style={{ color: '#8B949E' }}>{'thinking'}</span>
                    <span style={{ width: '8px', height: '15px', background: '#3FB950', animation: 'd_blink 1s steps(1) infinite' }}></span>
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
                      height: '36px',
                      position: 'relative',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                      border: '1px solid #30363D',
                      background: '#161B22',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '13px',
                      color: '#79C0FF',
                    }}
                    className="dcp-d7"
                  >
                    {'--' +
                      c
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 30px' }}>
              <div
                style={{
                  flex: '1',
                  height: '48px',
                  borderRadius: '8px',
                  border: '1px solid #30363D',
                  background: '#0D1117',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px 0 12px',
                  boxSizing: 'border-box',
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                <span style={{ color: '#3FB950', marginRight: '8px' }}>{'$'}</span>
                <ChatMic chat={chat} />
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={chat.onKeyDown}
                  placeholder={'ask anything…'}
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
                    fontSize: '15px',
                    '--wc-ph': '#6E7681',
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
                  borderRadius: '8px',
                  background: '#3FB950',
                  color: '#0D1117',
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
