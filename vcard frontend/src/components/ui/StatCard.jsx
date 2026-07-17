import GlassCard from './GlassCard';

const StatCard = ({ label, value, icon, trend, trendUp = true, delay = 0, className = '' }) => (
  <GlassCard
    premium
    hover
    className={`p-6 group relative overflow-hidden ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative flex items-start justify-between">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-crimson-soft text-crimson-700 group-hover:bg-gradient-crimson group-hover:text-white group-hover:shadow-glow-crimson transition-all duration-500">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="relative mt-5 text-3xl font-bold" style={{ color: 'var(--surface-text)' }}>{value}</p>
    <p className="relative mt-1 text-sm" style={{ color: 'var(--surface-text-2)' }}>{label}</p>
  </GlassCard>
);

export default StatCard;
