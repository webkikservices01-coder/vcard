import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Megaphone, X } from 'lucide-react';
import { useSiteSettings } from '../utils/siteSettings';
import { ALLOWED_PATHS } from './platformChat/config';

// The announcement the team sets in the admin panel (Settings → Website → Announcement strip):
// a small note at the bottom-left of the public pages. Visitors can close it (for this visit).
export default function SiteAnnouncement() {
  const site = useSiteSettings();
  const { pathname } = useLocation();
  const a = site?.announcement;
  const key = a ? `aicardly-announce-${a.text}` : '';
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem('aicardly-announce-closed') || '';
    } catch {
      return '';
    }
  });
  if (!a?.text || closed === key || !ALLOWED_PATHS.includes(pathname)) return null;
  const close = () => {
    setClosed(key);
    try {
      sessionStorage.setItem('aicardly-announce-closed', key);
    } catch {
      /* storage blocked */
    }
  };
  const text = <span className="min-w-0">{a.text}</span>;
  const linkCls = 'flex min-w-0 items-center gap-2 font-semibold underline-offset-2 hover:underline';
  return (
    <div className="fixed bottom-4 left-3 z-[140] flex max-w-[calc(100vw-96px)] items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] py-2.5 pl-3.5 pr-2 text-[13px] leading-snug text-white shadow-xl shadow-[#E70C65]/30 sm:left-6 sm:max-w-md" role="status">
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
      {a.link ? (
        /^https:\/\//.test(a.link) ? <a href={a.link} target="_blank" rel="noopener noreferrer" className={linkCls}>{text}</a> : <Link to={a.link} className={linkCls}>{text}</Link>
      ) : text}
      <button type="button" onClick={close} className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-white/15" aria-label="Close the announcement">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
