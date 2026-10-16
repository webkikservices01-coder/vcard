// Server-side render of a public card (built by scripts/build-card-ssr.mjs into BACKEND/ssr and run
// by the backend's /api/og/:username?body=1). public/og.php puts this HTML on the page, so the card
// shows before the app's JavaScript has loaded; the app then draws the same card and takes over
// (src/pages/PublicVcard.jsx removes this copy once its own is on screen).
// First: the stand-in browser the card code reads (see that file).
import './ssr-env.js';
import { renderToString } from 'react-dom/server';
import { prerender } from 'react-dom/static';
import WebCard, { nativeModeOf, TEMPLATES } from './webcard/WebCard.jsx';
import { DEMO_PAYLOAD } from './webcard/cardData.js';
import { getVideoRoomUrl } from './utils/videoRoom.js';

// The card exactly as PublicVcard draws it (without the call / Calendly overlays, which only open
// on a tap).
function Card({ data, aiPersona }) {
  const saved = data.card.themeOptions || {};
  const look = { template: data.card.theme, palette: saved.palette || 0, mode: saved.mode || '', counter: saved.counter !== false };
  return (
    <div style={{ minHeight: '100dvh', background: (look.mode || nativeModeOf(look.template)) === 'dark' ? '#050507' : '#E7E7EA' }}>
      <WebCard
        template={look.template}
        palette={look.palette}
        mode={look.mode || undefined}
        counter={look.counter}
        data={data}
        aiPersona={aiPersona}
        videoRoomUrl={getVideoRoomUrl(data.card._id)}
        share
      />
    </div>
  );
}

// The designs are separate files (React.lazy); render each once so they are loaded, after which
// renderToString draws any card in one synchronous step (no other request can interleave).
let ready = null;
export function prepare() {
  ready ||= Promise.all(
    TEMPLATES.map(async (t) => {
      const { prelude } = await prerender(<Card data={{ ...DEMO_PAYLOAD, card: { ...DEMO_PAYLOAD.card, theme: t.id } }} aiPersona={null} />);
      const reader = prelude.getReader();
      while (!(await reader.read()).done) {
        /* drain */
      }
    }),
  );
  return ready;
}

export async function renderCard(data, aiPersona) {
  await prepare();
  return renderToString(<Card data={data} aiPersona={aiPersona || null} />);
}
