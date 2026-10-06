// The wedding templates' Google Fonts, added once, only on pages that show an invite.
const HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Dancing+Script:wght@500;700&family=Rozha+One&family=Cinzel:wght@400;500;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=Marcellus&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Yatra+One&family=Tiro+Devanagari+Hindi&family=Amiri:wght@400;700&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap";

export function loadWeddingFonts() {
  if (typeof document === "undefined" || document.getElementById("wedding-fonts")) return;
  const link = document.createElement("link");
  link.id = "wedding-fonts";
  link.rel = "stylesheet";
  link.href = HREF;
  document.head.appendChild(link);
}
