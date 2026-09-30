import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'AI';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// 3D preview of the owner's card (Dashboard + Profile). Everything on it is the owner's own:
// photo (or initials), name, role, link, and their "Card background" image, which also fills the
// back of the card (fitted, never stretched).
export default function DynamicCyberCard3D({
  name = "",
  designation = "",
  slug = "",
  photoUrl = "",
  bgImageUrl,
  company = "",
  themeColor = "#3B82F6",
  cardBgColor = "#1E293B",
  surfaceBgColor = "#0F172A",
  backBgColor = "#0F172A",
  linkBgColor = "#3B82F6",
  subTextColor = "#FFFFFF",
  isDark = true
}) {
  const displayTitle = name || "Your Name";
  const displayRole = designation || "";
  const displaySubName = name || "Your Name";
  const backTitle = company || name || "Your Name";
  const hasBg = !!(bgImageUrl && bgImageUrl.trim());
  const cardUrl = slug ? `${window.location.origin}/${slug}` : window.location.href;
  const initials = getInitials(name);

  const avatarSrc = photoUrl || "";

  return (
    <div className="w-full h-[190px] sm:h-[210px] flex items-center justify-center overflow-hidden [perspective:1000px] my-0 py-0">
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
          animation: spinCard360 12s linear infinite;
          transform-style: preserve-3d;
        }
        .auto-360-spin:hover {
          animation-play-state: paused;
        }
        @keyframes scanLaserCard {
          0% { top: 0%; opacity: 0.7; }
          50% { opacity: 1; }
          100% { top: 95%; opacity: 0.7; }
        }
        .animate-scan-card {
          animation: scanLaserCard 2s ease-in-out infinite alternate;
        }
      `}</style>

      <div className="relative w-[300px] sm:w-[330px] aspect-[1.58/1] auto-360-spin cursor-grab">
        
        {/* ── 1. FRONT FACE ─────────────── */}
        <div
          className="absolute inset-0 rounded-[18px] overflow-hidden shadow-xl [backface-visibility:hidden]"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.35)',
            boxShadow: `0 12px 30px rgba(0,0,0,0.15), 0 0 20px ${themeColor}22`,
            transform: 'translateZ(1px)'
          }}
        >
          {bgImageUrl && bgImageUrl.trim() !== "" ? (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ) : (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ background: surfaceBgColor }}
            />
          )}

          <div className="relative z-10 p-3.5 sm:p-4 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl p-0.5 shadow-md shrink-0 overflow-hidden flex items-center justify-center border-2 backdrop-blur-md bg-white/60"
                style={{ borderColor: '#facc15' }}
              >
                {avatarSrc ? (
                  <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center text-white text-xs font-black shadow-inner"
                    style={{ background: themeColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <div
                className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md border border-white/20"
                style={{ background: linkBgColor }}
              >
                Aicardly
              </div>
            </div>

            <div className="space-y-0.5 mt-auto pr-14">
              <h2 className="text-sm sm:text-base font-black tracking-wide truncate drop-shadow-md text-white">
                {displayTitle}
              </h2>
              <p className="text-[10px] font-bold tracking-wider truncate uppercase" style={{ color: linkBgColor }}>
                {displayRole}
              </p>
              <p className="text-[8px] font-semibold tracking-tight truncate drop-shadow-xs" style={{ color: subTextColor }}>
                {displaySubName} • aicardly.com/{slug}
              </p>
            </div>

            <div className="absolute bottom-3 right-3 z-20 p-1 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/40 flex flex-col items-center">
              <div className="relative p-1 bg-white rounded-lg overflow-hidden">
                <QRCodeSVG value={cardUrl} size={38} bgColor="#ffffff" fgColor="#000000" level="M" />
                <div className="absolute left-0 right-0 h-0.5 shadow-[0_0_6px] pointer-events-none animate-scan-card z-30" style={{ background: themeColor, boxShadow: `0 0 6px ${themeColor}` }} />
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 shadow-[0_0_8px_rgba(231,12,101,0.8)] z-30"
              style={{ background: themeColor }}
            />
          </div>
        </div>

        {/* ── 2. BACK FACE ─────────────── */}
        <div
          className="absolute inset-0 rounded-[18px] p-3.5 sm:p-4 border flex flex-col justify-between overflow-hidden shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)]"
          style={{
            backgroundColor: backBgColor,
            backgroundImage: `linear-gradient(145deg, ${backBgColor} 0%, ${cardBgColor} 100%)`,
            borderColor: themeColor,
            borderWidth: '1px',
            boxShadow: `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${themeColor}44`,
          }}
        >
          {/* Brand on the back: Aicardly mark on top, the owner's brand below. */}
          <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
            <span className="text-[8px] font-black tracking-[0.3em] text-white/85 drop-shadow">AICARDLY</span>
            {company && <span className="text-[8px] font-bold tracking-widest uppercase truncate max-w-[60%] drop-shadow" style={{ color: themeColor }}>{company}</span>}
          </div>

          {hasBg && (
            <>
              {/* Same image, blurred, fills the card; the sharp copy sits on top, fitted. */}
              <div className="absolute inset-0" style={{ backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(14px) brightness(0.55)', transform: 'scale(1.15)' }} />
              <div className="absolute inset-x-4 top-4 bottom-10 flex items-center justify-center">
                <img src={bgImageUrl} alt="" className="max-h-full max-w-full object-contain rounded-md drop-shadow-lg" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            </>
          )}

          {!hasBg && (
            <div className="my-auto text-center space-y-0.5 pt-3 relative z-10">
              <h2 className="text-base font-black tracking-[0.2em] drop-shadow-lg text-white uppercase truncate px-2">
                {backTitle}
              </h2>
              {displayRole && (
                <p className="text-[8px] font-bold tracking-[0.25em] uppercase truncate px-2" style={{ color: themeColor }}>
                  {displayRole}
                </p>
              )}
            </div>
          )}

          <div className="mt-auto flex items-end justify-between relative z-10">
            <div className="text-[8px] font-black uppercase tracking-widest text-white truncate pr-2 drop-shadow">
              {hasBg ? backTitle : 'Tap · Scan · Connect'}
            </div>
            <span className="text-[7px] font-mono tracking-widest opacity-85 text-white shrink-0 drop-shadow">
              aicardly.com/{slug}
            </span>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
          />
        </div>

      </div>
    </div>
  );
}