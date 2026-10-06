import { useEffect, useState } from "react";

interface AnimatedInviteCardProps {
  coupleOne: string;
  coupleTwo: string;
  dateLabel: string;
  venueLabel: string;
  videoUrl?: string;
}

/* Premium animated "play video" invitation card — used in the
   Silver Symphony hero. videoUrl defaults to a placeholder; swap
   it for the couple's real wedding video (YouTube embed URL). */
const PLACEHOLDER_VIDEO_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0";

export function AnimatedInviteCard({
  coupleOne,
  coupleTwo,
  dateLabel,
  venueLabel,
  videoUrl = PLACEHOLDER_VIDEO_URL,
}: AnimatedInviteCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-lg items-center justify-center overflow-hidden p-4 md:p-8">
      {/* Dynamic Animated Background Shapes */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
        <div className="absolute top-[-20%] left-[-10%] h-[70vw] w-[70vw] animate-pulse rounded-full bg-[#9F1C44] blur-[150px] duration-[8000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vw] w-[60vw] animate-pulse rounded-full bg-[#E70C65] blur-[130px] duration-[6000ms]" />
      </div>

      {/* Main Card Wrapper with Entry Animation */}
      <div
        className={`relative flex aspect-[9/16] w-full max-w-lg transform flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#e2d1b7]/40 bg-gradient-to-b from-[#1a050b] to-[#3a0a18] p-8 text-center shadow-2xl transition-all duration-1000 ${
          loaded
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-12 scale-95 opacity-0"
        }`}
        style={{ boxShadow: "0 25px 50px -12px rgba(159, 28, 68, 0.25)" }}
      >
        {/* Elegant Animated Vignette Overlay */}
        <div
          className="absolute inset-0 animate-pulse bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800')",
          }}
        />

        {/* Top Decorative Border */}
        <div className="relative z-10 animate-fade-in">
          <div className="mx-auto mb-2 h-[1px] w-16 bg-[#e2d1b7]" />
          <span className="block text-[10px] font-light uppercase tracking-[0.4em] text-[#e2d1b7]/80">
            The Royal Invitation
          </span>
        </div>

        {/* Center Content Group with Delayed Transition */}
        <div className="relative z-10 my-auto space-y-6">
          <div
            className={`transform transition-all duration-1000 delay-300 ${
              loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="font-serif text-xl italic text-[#e2d1b7]">
              Save the Date for
            </p>
          </div>
          <div
            className={`transform transition-all duration-1000 delay-500 ${
              loaded ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <h1 className="font-serif text-4xl font-light leading-tight tracking-wide text-white md:text-5xl">
              {coupleOne} <br />
              <span className="font-serif text-3xl italic text-[#e2d1b7]">
                &amp;
              </span>{" "}
              <br />
              {coupleTwo}
            </h1>
          </div>

          {/* Video Play Button / Reel Experience */}
          <div
            className={`relative mx-auto my-6 flex h-24 w-24 transform items-center justify-center transition-all duration-1000 delay-700 ${
              loaded ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-[#E70C65]/30" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-[#9F1C44]/40" />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute z-20 flex h-16 w-16 transform items-center justify-center rounded-full bg-white text-[#9F1C44] shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#e2d1b7] hover:text-[#1a050b] focus:outline-none"
              aria-label="Play invitation video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="ml-1 h-6 w-6"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          <div
            className={`transform transition-all duration-1000 delay-700 ${
              loaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-xs font-light uppercase tracking-[0.2em] text-gray-300">
              Click to Play Invitation Video
            </p>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div
          className={`relative z-10 space-y-2 transition-all duration-1000 delay-1000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="font-serif text-lg text-[#e2d1b7]">{dateLabel}</p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
            {venueLabel}
          </p>
          <div className="mx-auto mt-4 h-[1px] w-12 bg-[#e2d1b7]/50" />
        </div>

        {/* Video Overlaid Screen (Triggers on click) */}
        {isPlaying && (
          <div className="absolute inset-0 z-50 flex animate-fade-in flex-col items-center justify-center bg-black transition-opacity duration-500">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-md hover:text-white focus:outline-none"
              aria-label="Close video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <iframe
              className="h-full w-full"
              src={videoUrl}
              title="Wedding Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
