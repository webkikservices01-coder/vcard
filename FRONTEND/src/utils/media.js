export const getImageUrl = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith('http') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) return imgPath;
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
