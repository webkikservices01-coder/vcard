// Icon-in-input form field helper: label above, icon absolutely positioned inside the input.
const Field = ({ icon, label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{label}</span>
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--surface-text-2)' }}>{icon}</span>
      {children}
    </div>
  </label>
);

export default Field;
