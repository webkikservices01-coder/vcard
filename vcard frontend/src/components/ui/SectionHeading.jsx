const SectionHeading = ({ eyebrow, title, subtitle, center = true }) => (
  <div className={center ? 'text-center mx-auto max-w-2xl' : ''}>
    {eyebrow && (
      <span className="badge-glass mb-4 text-crimson-700">
        <span className="h-1.5 w-1.5 rounded-full bg-magenta-500" />
        {eyebrow}
      </span>
    )}
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance" style={{ color: 'var(--surface-text)' }}>{title}</h2>
    {subtitle && <p className="mt-4 text-lg leading-relaxed text-balance" style={{ color: 'var(--surface-text-2)' }}>{subtitle}</p>}
  </div>
);

export default SectionHeading;
