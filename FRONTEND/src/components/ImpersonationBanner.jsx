import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { getImpersonating, exitImpersonation } from '../utils/impersonation';

// "Sign in as user" (admin) outside the dashboard — onboarding, a card page, … — so the way
// back is always on screen. The dashboard shows its own full-width banner.
export default function ImpersonationBanner() {
  const { pathname } = useLocation();
  const [who, setWho] = useState(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read after mount (the homepage is prerendered)
    setWho(getImpersonating());
  }, [pathname]);
  if (!who || pathname.startsWith('/dashboard')) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[9999] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-2xl"
      style={{ background: 'linear-gradient(90deg,#be123c,#db2777)' }}
    >
      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">Admin view: {who.name}</span>
      <button type="button" onClick={exitImpersonation} className="shrink-0 rounded-full bg-white/20 px-3 py-1 hover:bg-white/30">
        Exit
      </button>
    </div>
  );
}
