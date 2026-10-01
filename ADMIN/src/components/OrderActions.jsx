import { useState } from 'react';
import { RefreshCw, Send, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button, useToast } from './ui';

// Resend link / regenerate an expired link / resend the delivered card, for one card order.
export default function OrderActions({ order, onDone }) {
  const { can } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState('');
  if (!can('payments.resend')) return null;

  const run = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(action);
    try {
      const res = await api(`/payments/card-orders/${order.id}/${action}`, { method: 'POST' });
      toast(res.msg || 'Done.');
      onDone?.();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  const expiredOrClosed = ['EXPIRED', 'FAILED', 'CANCELLED'].includes(order.status);
  return (
    <div className="flex flex-wrap justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {order.status === 'PENDING_PAYMENT' && (
        <Button size="sm" variant="secondary" loading={busy === 'resend-link'} onClick={() => run('resend-link', `Send the payment link again to ${order.email}${order.phone ? ` and ${order.phone}` : ''}?`)}>
          <Send className="h-3.5 w-3.5" /> Resend link
        </Button>
      )}
      {expiredOrClosed && (
        <Button size="sm" variant="secondary" loading={busy === 'regenerate'} onClick={() => run('regenerate', 'Create a new 24-hour payment link and send it by email + WhatsApp?')}>
          <RefreshCw className="h-3.5 w-3.5" /> New link
        </Button>
      )}
      {order.status === 'PAID' && (
        <Button size="sm" variant="secondary" loading={busy === 'resend-card'} onClick={() => run('resend-card', `Send the card again on WhatsApp${order.phone ? ` (${order.phone})` : ''} and email?`)}>
          <FileText className="h-3.5 w-3.5" /> Resend card
        </Button>
      )}
    </div>
  );
}
