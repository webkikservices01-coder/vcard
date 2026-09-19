import { motion } from 'framer-motion';

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'AI';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DynamicCyberCard3D({
  name = "SHUBHAM KHURANA",
  designation = "FOUNDER & CEO",
  slug = "shubham",
  photoUrl = "/profile.png",
  bgImageUrl,
  themeColor = "#E70C65",
  isDark = true
}) {
  const displayTitle = "WEBKIK SERVICES";
  const displayRole = "FOUNDER & CEO";
  const displaySubName = name ? name : "Shubham Khurana";
  const displayUrl = slug ? `mycardlink.site/${slug}` : "mycardlink.site/shubham";
  const initials = getInitials(name);

  const avatarSrc = photoUrl || "/profile.png";

  return (
    <div className="w-full h-[220px] sm:h-[240px] flex items-center justify-center overflow-hidden [perspective:1000px] my-0 py-0">
      <style>{`
        @keyframes spinCard360 {
          0% {
            transform: rotateY(0deg) rotateX(4deg);
          }
          50% {
            transform: rotateY(180deg) rotateX(-4deg);
          }
          100% {
            transform: rotateY(360deg) rotateX(4deg);
          }
        }
        .auto-360-spin {
          animation: spinCard360 10s linear infinite;
          transform-style: preserve-3d;
        }
        .auto-360-spin:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative w-[320px] sm:w-[350px] aspect-[1.58/1] auto-360-spin cursor-grab">
        
        {/* ── 1. FRONT FACE ─────────────────────── */}
        <div
          className="absolute inset-0 rounded-[20px] p-4 sm:p-5 border flex flex-col justify-between overflow-hidden shadow-2xl [backface-visibility:hidden]"
          style={{
            backgroundImage: bgImageUrl && bgImageUrl.trim() !== ""
              ? `linear-gradient(rgba(10, 14, 26, 0.5), rgba(10, 14, 26, 0.85)), url(${bgImageUrl})`
              : 'linear-gradient(145deg, #0d1222 0%, #070911 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: `0 15px 35px rgba(0,0,0,0.6), 0 0 20px ${themeColor}33`,
            transform: 'translateZ(1px)'
          }}
        >
          {/* Subtle Ambient Rim Glow */}
          <div
            className="pointer-events-none absolute -inset-0.5 rounded-[20px] opacity-40 blur-sm"
            style={{ background: `linear-gradient(135deg, ${themeColor}, transparent 65%)` }}
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-start justify-between">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-0.5 shadow-xl shrink-0 overflow-hidden flex items-center justify-center border-2 backdrop-blur-md bg-black/40"
              style={{ borderColor: '#facc15' }}
            >
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt="Avatar" 
                  className="w-full h-full object-contain rounded-lg scale-90"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center text-white text-sm font-black shadow-inner"
                  style={{ background: themeColor }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div
              className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md border border-white/20"
              style={{ background: themeColor }}
            >
              Webcard.ai
            </div>
          </div>

          {/* Front Typography */}
          <div className="relative z-10 space-y-0.5 mt-auto">
            <h2 className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-md truncate">
              {displayTitle}
            </h2>
            <p className="text-[11px] font-bold tracking-wider truncate uppercase" style={{ color: '#ff80ab' }}>
              {displayRole}
            </p>
            <p className="text-[9px] font-semibold text-slate-300 tracking-tight truncate opacity-80">
              {displaySubName} • {displayUrl}
            </p>
          </div>

          {/* Bottom Laser Accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 shadow-[0_0_10px_rgba(231,12,101,0.8)]"
            style={{ background: themeColor }}
          />
        </div>

        {/* ── 2. BACK FACE (WEBKIK SERVICES) ──────────────────── */}
        <div
          className="absolute inset-0 rounded-[20px] p-4 sm:p-5 border flex flex-col justify-between overflow-hidden shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)]"
          style={{
            background: 'linear-gradient(145deg, #090d18 0%, #04060b 100%)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: `0 15px 35px rgba(0,0,0,0.6), 0 0 20px ${themeColor}33`,
          }}
        >
          {/* Top Magnetic Security Strip */}
          <div className="absolute.top-3 left-0 right-0 h-6 bg-[#020306] border-y border-white/5 shadow-inner" />

          {/* Center Brand Title */}
          <div className="my-auto text-center space-y-1 pt-4">
            <h2 className="text-lg font-black tracking-[0.2em] text-white drop-shadow-lg">
              WEBKIK SERVICES
            </h2>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: themeColor }}>
              Next-Gen Digital Matrix
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-end justify-between relative z-10">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              SECURE CONTACTLESS MATRIX
            </div>

            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              AI SECURE 256-BIT
            </span>
          </div>

          {/* Bottom Laser Accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 shadow-[0_0_10px_rgba(231,12,101,0.8)]"
            style={{ background: themeColor }}
          />
        </div>

      </div>
    </div>
  );
}