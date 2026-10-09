import { useState } from 'react';
import { Download } from 'lucide-react';
import ActionDialog from './ActionDialog';
import { downloadUrl } from '../lib/api';

// Download customer data as CSV: asks why first (saved in the audit log with the export).
export default function ExportButton({ path, params = {}, label = 'Export CSV', what = 'this list' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" aria-hidden="true" /> {label}
      </button>
      <ActionDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Export customer data"
        description={`Downloads ${what} with the filters you set, including names, emails and phone numbers. Keep the file safe and delete it when you are done.`}
        confirmLabel="Download"
        reasonLabel="Why do you need it? (saved in the audit log)"
        onSubmit={async ({ reason }) => {
          window.location.href = downloadUrl(path, { ...params, page: undefined, reason });
        }}
      />
    </>
  );
}
