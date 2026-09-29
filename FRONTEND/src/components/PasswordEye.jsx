import { Eye, EyeOff } from 'lucide-react';

// Show / hide toggle placed inside a `relative` wrapper, over the input's right padding.
export default function PasswordEye({ shown, onToggle, className = '' }) {
  const Icon = shown ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      title={shown ? 'Hide password' : 'Show password'}
      className={`absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg opacity-60 transition hover:opacity-100 ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
