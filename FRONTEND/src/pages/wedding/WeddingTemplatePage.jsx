import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getTemplate } from '../../wedding/data/templates';
import { WeddingInvite } from '../../wedding/WeddingInvite';
import { occasionOf } from '../../wedding/data/occasions';
import NotFound from '../NotFound';

// /invites/<template> (and /wedding/<template>): the design with its sample details, and a button to use it.
export default function WeddingTemplatePage() {
  const { slug } = useParams();
  const template = getTemplate(slug || '');
  useEffect(() => {
    if (template) document.title = `${template.name} – ${occasionOf(template).label} ${occasionOf(template).rsvp ? 'Invitation' : 'Greeting'} Design | Aicardly`;
  }, [template]);
  if (!template) return <NotFound />;
  let signedIn = false;
  try {
    signedIn = !!localStorage.getItem('token');
  } catch {
    /* storage blocked */
  }
  return (
    <div className="relative">
      <div className="fixed bottom-3 left-1/2 z-[9000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 p-1.5 shadow-2xl backdrop-blur-md">
        <Link to={`/invites${template.occasion ? `?occasion=${template.occasion}` : ''}`} className="rounded-full px-4 py-2 text-xs font-semibold text-white/85 hover:text-white">
          ← All designs
        </Link>
        <Link to={signedIn ? `/dashboard/invites?template=${template.slug}` : '/register'} className="rounded-full bg-[#E70C65] px-5 py-2 text-xs font-semibold text-white">
          Use this design
        </Link>
      </div>
      <WeddingInvite template={template} extras={{ preview: true, playOpening: true }} />
    </div>
  );
}
