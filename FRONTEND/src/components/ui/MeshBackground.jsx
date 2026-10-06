// Ambient blurred gradient blobs — reused behind hero/panel sections for the "premium mesh" backdrop.
// A slow-rotating conic "aurora" wash sits behind everything for extra depth. Pass `fixed` to pin it
// to the viewport (for a persistent app-wide ambient layer) instead of the nearest positioned
// ancestor. Pass `rich` to layer in the grain texture + bottom wave paths used behind full-page
// marketing/auth surfaces (heavier, so left off by default for small in-card usages).
//
// Built to stay light on laptops (MacBook / Safari hung on the old version): the blobs are soft
// radial gradients (no CSS blur filter, which had to be redrawn every frame), only transform and
// opacity move (GPU-only), and the slow drift steps a few times a second instead of 60, so the
// glass cards drawn over it don't have to re-blur constantly. It looks the same.
const MeshBackground = ({ className = '', fixed = false, rich = false }) => (
  <div className={`mesh-bg ${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none ${className}`}>
    <div
      className="mesh-wash absolute -inset-1/4"
      style={{ background: 'conic-gradient(from 0deg at 50% 50%, var(--mesh-a), var(--mesh-c), var(--mesh-b), var(--mesh-a))', opacity: 0.07 }}
    />
    <div
      className="mesh-blob mesh-blob-a absolute -top-40 -left-32 w-[28rem] h-[28rem]"
      style={{ background: 'radial-gradient(circle closest-side, var(--mesh-a), color-mix(in srgb, var(--mesh-a) 45%, transparent) 45%, transparent 100%)' }}
    />
    <div
      className="mesh-blob mesh-blob-b absolute bottom-0 right-0 w-[32rem] h-[32rem]"
      style={{ background: 'radial-gradient(circle closest-side, var(--mesh-b), color-mix(in srgb, var(--mesh-b) 45%, transparent) 45%, transparent 100%)' }}
    />
    <div
      className="mesh-blob mesh-blob-c absolute top-1/3 right-1/4 w-[24rem] h-[24rem]"
      style={{ background: 'radial-gradient(circle closest-side, var(--mesh-c), color-mix(in srgb, var(--mesh-c) 45%, transparent) 45%, transparent 100%)' }}
    />
    <div
      className="absolute inset-0"
      style={{ backgroundImage: 'radial-gradient(circle, var(--surface-text) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.06 }}
    />
    {rich && (
      <>
        <svg
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-[0.05]"
          width="900" height="400" viewBox="0 0 900 400" fill="none" preserveAspectRatio="none"
        >
          <path d="M0 320 C 150 280, 300 360, 450 300 S 750 260, 900 300 L 900 400 L 0 400 Z" fill="var(--mesh-b)" />
          <path d="M0 350 C 200 320, 350 380, 500 340 S 800 300, 900 340 L 900 400 L 0 400 Z" fill="var(--mesh-a)" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 grain opacity-[0.03] mix-blend-overlay" />
      </>
    )}
  </div>
);

export default MeshBackground;
