import { Eye } from 'lucide-react';
import GlassCard from './GlassCard';

// Signature "banner + overlapping avatar" card-tile shape: gradient banner with a
// decorative radial shine, an initials/photo avatar overlapping the banner, name/subtitle,
// and a bottom row with a live/draft status pill + view count. Trailing content (actions,
// links) is passed as `footer` so callers keep control of their own per-item actions.
const VcardTile = ({ name, subtitle, avatarUrl, viewCount = 0, live = true, footer, className = '', ...props }) => (
  <GlassCard premium hover className={`overflow-hidden flex flex-col ${className}`} {...props}>
    <div className="relative h-20 bg-gradient-crimson">
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.35) 0%, transparent 60%)' }}
      />
    </div>
    <div className="px-5 pb-5 flex-1 flex flex-col">
      <div className="-mt-10 mb-3 w-16 h-16 rounded-2xl border-4 overflow-hidden shrink-0 flex items-center justify-center text-white text-xl font-bold bg-gradient-crimson shadow-glow-crimson"
        style={{ borderColor: 'var(--surface-1)' }}>
        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() || 'V')}
      </div>
      <p className="text-sm font-bold truncate" style={{ color: 'var(--surface-text)' }}>{name || 'Unnamed Card'}</p>
      {subtitle && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--surface-text-2)' }}>{subtitle}</p>}

      <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {live ? 'Live' : 'Draft'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {viewCount} views
        </span>
      </div>

      {footer && (
        <div className="mt-auto pt-3 flex items-center justify-end gap-1" style={{ borderTop: '1px solid var(--surface-border)' }}>
          {footer}
        </div>
      )}
    </div>
  </GlassCard>
);

export default VcardTile;
