import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const WebCard = lazy(() => import('../webcard/WebCard'));
const API = import.meta.env.VITE_API_URL;

// The owner's real card (their template, palette and sections) in a phone frame, with the
// profile form's unsaved edits (name, role, bio, photo, banner) laid over it as they type.
// look: { template, palette, mode } to preview a look that is not saved yet.
const LiveCardPreview = ({ username, overrides = {}, look = null, height = 600 }) => {
  const [payload, setPayload] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!username) return;
    let alive = true;
    const load = () =>
      axios
        .get(`${API}/api/vcard/public/${username}`)
        .then((r) => alive && (setPayload(r.data), setFailed(false)))
        .catch(() => alive && setFailed(true));
    load();
    // Any save anywhere in the dashboard (POST/PUT/PATCH/DELETE) refreshes the preview.
    let timer;
    const reload = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 700);
    };
    const hook = axios.interceptors.response.use((res) => {
      const method = (res.config?.method || 'get').toLowerCase();
      if (method !== 'get' && !/\/api\/(ai|vcard\/public)\//.test(res.config?.url || '')) reload();
      return res;
    });
    window.addEventListener('vcard:data-changed', reload);
    return () => {
      alive = false;
      clearTimeout(timer);
      axios.interceptors.response.eject(hook);
      window.removeEventListener('vcard:data-changed', reload);
    };
  }, [username]);

  const { name, designation, bio, profilePic, bannerImage } = overrides;
  const data = useMemo(() => {
    if (!payload) return null;
    const card = payload.card || {};
    const pi = card.personalInfo || {};
    return {
      ...payload,
      card: {
        ...card,
        personalInfo: {
          ...pi,
          name: name ?? pi.name,
          designation: designation ?? pi.designation,
          bio: bio ?? pi.bio,
          profilePic: profilePic ?? pi.profilePic,
          bannerImage: bannerImage ?? pi.bannerImage,
        },
      },
    };
  }, [payload, name, designation, bio, profilePic, bannerImage]);

  const spinner = (
    <div className="grid h-full place-items-center">
      <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#E70C65]/25 border-t-[#E70C65]" />
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[2.2rem] border-[6px] border-slate-900 bg-slate-900 p-0 shadow-2xl">
      <div
        className="relative overflow-y-auto overflow-x-hidden rounded-[1.8rem] bg-white"
        // translateZ keeps the templates' fixed bars and sheets inside the frame.
        style={{ height, transform: 'translateZ(0)', scrollbarWidth: 'none' }}
      >
        {!username || failed ? (
          <div className="grid h-full place-items-center p-6 text-center text-xs text-slate-500">
            {username ? 'Preview could not load. Save your card, then refresh.' : 'Set a card username and save to see your live card here.'}
          </div>
        ) : !data ? (
          spinner
        ) : (
          <Suspense fallback={spinner}>
            <WebCard
              template={look?.template || data.card.theme}
              palette={look ? look.palette : undefined}
              mode={look ? look.mode : undefined}
              data={data}
              share
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default LiveCardPreview;
