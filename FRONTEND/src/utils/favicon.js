import { getImageUrl } from './media';

// Card favicons (the icon in the browser tab when someone opens a card).
// Setting values: 'photo' | 'initials' | 'aicardly' | 'emoji:<emoji>' | uploaded image URL ('' = photo).

export const FAVICON_EMOJIS = [
  '💼', '🚀', '⭐', '💡', '🔥', '💎', '👑', '❤️',
  '🏠', '🏢', '⚖️', '🩺', '🦷', '💊', '📷', '🎨',
  '💻', '📈', '💰', '🍽️', '☕', '💪', '✂️', '💄',
  '🎓', '📚', '🎵', '✈️', '🛒', '🔧', '🌿', '🐾',
];

const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'A';

// Cloudinary: square, face-centred, round, 96px PNG. Other URLs are used as they are.
const tinyRound = (url) =>
  /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url) ? url.replace('/image/upload/', '/image/upload/c_thumb,g_face,w_96,h_96,r_max,f_png/') : url;
const tinySquare = (url) =>
  /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url) ? url.replace('/image/upload/', '/image/upload/c_fill,w_96,h_96,f_png/') : url;

export function faviconHref(value, card = {}) {
  const v = value || 'photo';
  const photo = getImageUrl(card.personalInfo?.profilePic);
  if (v === 'aicardly') return '/favicon.png';
  if (v === 'photo' && photo) return tinyRound(photo);
  if (v.startsWith('emoji:')) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="52">${v.slice(6)}</text></svg>`);
  }
  if (/^(https?:|\/uploads\/)/.test(v)) return tinySquare(getImageUrl(v));
  // 'initials', or 'photo' without a photo
  const text = initialsOf(card.personalInfo?.name);
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9F1C44"/><stop offset="1" stop-color="#E70C65"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${text.length > 1 ? 26 : 32}" fill="#fff">${text}</text></svg>`
  );
}

// Point the page's icon links at href (null restores the site icon).
export function setPageFavicon(href) {
  const url = href || '/favicon.png';
  for (const rel of ['icon', 'apple-touch-icon']) {
    let link = document.head.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = url;
    link.removeAttribute('type');
  }
}
