import { useState } from 'react';
import Button from '../ui/Button';
import { LEAD_FORM_FIELDS } from './config';

const EMPTY = LEAD_FORM_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {});

const LeadForm = ({ onSubmit, submitting, error }) => {
  const [values, setValues] = useState(EMPTY);
  const set = (key) => (e) => setValues(v => ({ ...v, [key]: e.target.value }));

  const canSubmit = values.name.trim() && (values.email.trim() || values.phone.trim());

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(values); }}
      className="space-y-2.5 px-3 pb-3 pt-1"
    >
      {/* Honeypot — hidden from real visitors, only bots fill it in. */}
      <input type="text" name="website" value={values.website || ''} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {LEAD_FORM_FIELDS.map(f => (
        <div key={f.key}>
          {f.type === 'textarea' ? (
            <textarea
              rows={2}
              placeholder={f.label + (f.required ? '' : ' (optional)')}
              value={values[f.key]}
              onChange={set(f.key)}
              className="input-premium resize-none text-sm"
            />
          ) : (
            <input
              type={f.type}
              placeholder={f.label + (f.required ? '' : ' (optional)')}
              value={values[f.key]}
              onChange={set(f.key)}
              className="input-premium text-sm"
            />
          )}
        </div>
      ))}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" variant="primary" size="sm" disabled={!canSubmit} loading={submitting} fullWidth>
        Send my details
      </Button>
      <p className="text-center text-[11px]" style={{ color: 'var(--surface-text-2)' }}>
        Please share your email or phone so we can reach you.
      </p>
    </form>
  );
};

export default LeadForm;
