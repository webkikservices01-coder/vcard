import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WeddingInvite } from '../../wedding/WeddingInvite';
import { inviteToTemplate } from '../../wedding/fromInvite';
import { occasionOf, namesLine } from '../../wedding/data/occasions';

const API = import.meta.env.VITE_API_URL;

// /invite/<link>: a couple's published wedding invitation.
export default function InvitePage() {
  const { link = '' } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    fetch(`${API}/api/wedding/public/${encodeURIComponent(link.toLowerCase())}`)
      .then(async (r) => (r.ok ? { doc: await r.json() } : { missing: true }))
      .catch(() => ({ error: true }))
      .then((s) => alive && setState(s));
    fetch(`${API}/api/wedding/public/${encodeURIComponent(link.toLowerCase())}/view`, { method: 'POST' }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [link]);

  const built = state.doc ? inviteToTemplate(state.doc) : null;
  useEffect(() => {
    if (built) {
      const o = occasionOf(built.template);
      document.title = o.rsvp ? `${namesLine(built.template)} – ${o.label} Invitation` : `${built.template.script} from ${built.template.couple.one}`;
    }
  }, [built]);

  if (state.loading)
    return (
      <div className="grid min-h-screen place-items-center" style={{ background: '#1b0410', color: '#f6d97e' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" aria-label="Loading the invitation" />
      </div>
    );
  if (!built)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center" style={{ background: 'var(--surface-bg)', color: 'var(--surface-text)' }}>
        <div>
          <h1 className="text-3xl font-bold">{state.error ? 'Could not load the invitation' : 'Invitation not found'}</h1>
          <p className="mt-3" style={{ color: 'var(--surface-text-2)' }}>
            {state.error ? 'Please check your internet and try again.' : 'This link may be wrong, or the couple has taken the invitation down.'}
          </p>
          <Link to="/invites" className="mt-6 inline-block rounded-full bg-[#E70C65] px-6 py-3 text-sm font-semibold text-white">
            Make your own digital invite
          </Link>
        </div>
      </div>
    );
  return <WeddingInvite template={built.template} extras={built.extras} />;
}
