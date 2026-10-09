// Cloudinary images in the best format the browser takes (WebP/AVIF), auto quality, at most
// 1200px wide: far lighter on phones and looks the same. Only plain upload URLs are changed.
const CLOUDINARY_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)/;
export const optimizeImage = (url) => (CLOUDINARY_RE.test(url) ? url.replace(CLOUDINARY_RE, '$1f_auto,q_auto,c_limit,w_1200/$2') : url);

// Cover / banner images: also trims a plain border (white or black padding around a banner),
// so the picture itself fills the cover. Same rewrite in index.html (card prefetch).
export const coverImageUrl = (imgPath) => {
  const url = getImageUrl(imgPath);
  return url && CLOUDINARY_RE.test(imgPath) ? url.replace('/image/upload/f_auto,', '/image/upload/e_trim:10/f_auto,') : url;
};

// Round profile photos are shown at most ~170px wide: 480px is sharp on any phone and a fraction of
// the 1200px file. Same rewrite in index.html (card prefetch), so the photo downloads once.
export const avatarUrl = (imgPath) => {
  const url = getImageUrl(imgPath);
  return url ? url.replace('/image/upload/f_auto,q_auto,c_limit,w_1200/', '/image/upload/f_auto,q_auto,c_limit,w_480/') : url;
};

export const getImageUrl = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return optimizeImage(imgPath);
  if (imgPath.startsWith('blob:') || imgPath.startsWith('data:')) return imgPath;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`;
};

export const getYoutubeId = (url = '') => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
};

export const isDirectVideo = (url = '') => /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);

// Normalises a gallery entry into what the public card needs to show and play it.
export const describeMedia = (item) => {
  if (item.type !== 'video') return { kind: 'image', src: getImageUrl(item.url), thumb: getImageUrl(item.url) };
  const yt = getYoutubeId(item.url);
  if (yt) {
    return {
      kind: 'youtube',
      thumb: item.thumbnail ? getImageUrl(item.thumbnail) : `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      embed: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&playsinline=1`,
    };
  }
  if (isDirectVideo(item.url)) return { kind: 'file', src: getImageUrl(item.url), thumb: item.thumbnail ? getImageUrl(item.thumbnail) : null };
  return { kind: 'external', href: item.url, thumb: item.thumbnail ? getImageUrl(item.thumbnail) : null };
};

// Screenshot of a project's website (WordPress mShots), used when no cover image was uploaded.
export const siteShot = (url = '') => {
  if (!/^https?:\/\//i.test(url) || /\.pdf($|[?#])/i.test(url) || getYoutubeId(url)) return null;
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800&h=600`;
};