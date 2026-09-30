// Card image built by Cloudinary from the card's own photo: dark brand background, round photo
// with a pink ring, name, role and the card link. 1200x630 (dpr 2 → 2400x1260 for delivery).
// Null when the photo isn't on Cloudinary.

// Text inside a Cloudinary l_text layer: URL-encoded, with commas and slashes double-encoded.
const cldText = (s) => encodeURIComponent(s).replace(/%2C/g, '%252C').replace(/%2F/g, '%252F');

function cardImage({ photo, name, role, link, dpr = 1 }) {
  const m = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.(?:jpe?g|png|webp|gif|avif)$/i.exec(photo || '');
  if (!m) return null;
  const [, cloud, publicId] = m;
  const nameSize = name.length > 24 ? 52 : name.length > 18 ? 60 : 70;
  const layers = [
    `w_1200,h_630,c_fill,e_colorize:100,co_rgb:12141a${dpr > 1 ? `,dpr_${dpr}.0` : ''}`,
    `l_${publicId.replace(/\//g, ':')},w_340,h_340,c_thumb,g_face,r_max,bo_8px_solid_rgb:E70C65`,
    'fl_layer_apply,g_west,x_90',
    `l_text:Arial_${nameSize}_bold:${cldText(name)},co_white,w_650,c_fit`,
    'fl_layer_apply,g_north_west,x_480,y_200',
    role && `l_text:Arial_36:${cldText(role)},co_rgb:ff6b9d,w_650,c_fit`,
    role && 'fl_layer_apply,g_north_west,x_480,y_300',
    `l_text:Arial_30:${cldText(link)},co_rgb:cbd5e1`,
    'fl_layer_apply,g_south_west,x_480,y_80',
    `l_text:Arial_34_bold:Aicardly,co_rgb:E70C65`,
    'fl_layer_apply,g_north_east,x_60,y_50',
  ].filter(Boolean);
  return `https://res.cloudinary.com/${cloud}/image/upload/${layers.join('/')}/${publicId}.jpg`;
}

module.exports = { cardImage };
