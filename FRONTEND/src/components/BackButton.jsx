import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Back to the previous page, or the homepage when this page was opened directly.
export default function BackButton({ className = '', label = 'Back' }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/');
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition hover:-translate-x-0.5 cursor-pointer ${className}`}
      style={{ borderColor: 'var(--surface-border, rgba(0,0,0,.12))', color: 'var(--surface-text, #1a1a1a)', background: 'color-mix(in srgb, var(--surface-1, #fff) 70%, transparent)' }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
