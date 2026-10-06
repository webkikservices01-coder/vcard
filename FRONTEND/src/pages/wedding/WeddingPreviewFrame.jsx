import { useEffect, useState } from 'react';
import { WeddingInvite } from '../../wedding/WeddingInvite';
import { inviteToTemplate } from '../../wedding/fromInvite';

// /wedding-preview: shown in an iframe next to the dashboard editor. The editor posts the
// form as the couple types ({ type: 'wedding-draft', doc }); nothing is sent anywhere.
export default function WeddingPreviewFrame() {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'wedding-draft') return;
      setDoc(e.data.doc);
    };
    window.addEventListener('message', onMsg);
    window.parent?.postMessage({ type: 'wedding-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const built = doc ? inviteToTemplate(doc, true) : null;
  if (!built) return <div style={{ minHeight: '100vh', background: '#1b0410' }} />;
  // A new key when the design changes, so each template starts from its top.
  return <WeddingInvite key={doc.template} template={built.template} extras={built.extras} />;
}
