import { useId } from 'react';

// The Aicardly mark: pink rounded square with a white "A" and a spark (same drawing as /logo-mark.svg).
const LogoMark = ({ size = 36, className = '', style }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={`shrink-0 ${className}`} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F03276" />
          <stop offset="1" stopColor="#A9123F" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11.5" fill={`url(#${id})`} />
      <path d="M12.6 35 24 12.4 35.4 35" fill="none" stroke="#fff" strokeWidth="4.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 25.6q.55 3.25 3.8 3.8-3.25.55-3.8 3.8-.55-3.25-3.8-3.8 3.25-.55 3.8-3.8z" fill="#fff" />
    </svg>
  );
};

export default LogoMark;
