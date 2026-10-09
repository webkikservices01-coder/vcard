import { useState } from 'react';
import { Button, Field, Modal, Textarea, Input } from './ui';

// Dialog for an admin action: optional extra fields, a reason (saved in the audit log) and, for
// destructive actions, a word the admin must type to confirm.
export default function ActionDialog({ open, onClose, title, description, confirmLabel = 'Confirm', danger, reasonRequired = true, reasonLabel = 'Reason (saved in the audit log)', confirmText, children, onSubmit, canSubmit = true }) {
  const [reason, setReason] = useState('');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    if (busy) return;
    setReason('');
    setTyped('');
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit({ reason: reason.trim() });
      setReason('');
      setTyped('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reasonOk = !reasonRequired || reason.trim().length >= 3;
  const typedOk = !confirmText || typed.trim().toLowerCase() === String(confirmText).toLowerCase();

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={submit} loading={busy} disabled={!reasonOk || !typedOk || !canSubmit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {description && <p className="text-sm text-slate-600">{description}</p>}
        {children}
        <Field label={reasonRequired || /optional/i.test(reasonLabel) ? reasonLabel : `${reasonLabel} (optional)`}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="e.g. Customer asked on WhatsApp" />
        </Field>
        {confirmText && (
          <Field label={`Type ${confirmText} to confirm`}>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </Field>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
