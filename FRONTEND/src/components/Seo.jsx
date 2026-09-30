import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../../public/seo-pages.json';

// Keeps <head> right for the current route: canonical, title, description, og/twitter
// url/title/description and robots. Page data lives in public/seo-pages.json, which og.php
// also uses to give search and link-preview bots the same tags without running JavaScript.

const SITE = SEO.site;

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};
const setMeta = (attr, key, content) => {
  const sel = `meta[${attr}="${key}"]`;
  if (content == null) return document.head.querySelector(sel)?.remove();
  upsert(sel, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  }).setAttribute('content', content);
};
const setCanonical = (href) => {
  if (!href) return document.head.querySelector('link[rel="canonical"]')?.remove();
  upsert('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.rel = 'canonical';
    return l;
  }).href = href;
};

// One address per page: lowercase for card links, no trailing slash, no query string.
export const normalizePath = (pathname) => (pathname || '/').replace(/\/+$/, '') || '/';

// Card routes: /<username> and the old /c/<username> both point to /<username>.
const cardSlug = (path) => {
  const m = /^\/(?:c\/)?([A-Za-z0-9-]{3,30})$/.exec(path);
  return m && !SEO.pages[path] ? m[1].toLowerCase() : null;
};

// PublicVcard: honour the owner's "Search Engine Indexing" switch (Advanced Settings).
export const setCardIndexing = (allowed) => setMeta('name', 'robots', allowed ? 'index, follow' : 'noindex, follow');

// PublicVcard calls this when a username has no card, so the empty page isn't indexed.
export const markNotFound = () => {
  setMeta('name', 'robots', 'noindex, follow');
  setCanonical(null);
};

export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = normalizePath(pathname);
    const page = SEO.pages[path];
    const isPrivate = SEO.privatePrefixes.some((p) => path === p || path.startsWith(p + '/'));
    const slug = !page && !isPrivate ? cardSlug(path) : null;

    let canonical = null;
    if (page) canonical = SITE + (path === '/' ? '/' : path);
    else if (slug) canonical = `${SITE}/${slug}`;

    setCanonical(isPrivate || page?.noindex ? null : canonical);
    setMeta('name', 'robots', isPrivate || page?.noindex || (!page && !slug) ? 'noindex, follow' : 'index, follow');
    setMeta('property', 'og:url', canonical || SITE + '/');

    if (isPrivate) document.title = 'Dashboard | Aicardly';

    // Card pages set their own title (PublicVcard) and the backend supplies their preview text.
    // Page-specific structured data from seo-pages.json (e.g. BreadcrumbList on /metal-nfc-card).
    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    (page?.jsonld || []).forEach((ld) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.dataset.seoJsonld = '1';
      el.textContent = JSON.stringify(ld);
      document.head.appendChild(el);
    });

    if (page) {
      document.title = page.title;
      setMeta('name', 'description', page.description);
      setMeta('property', 'og:title', page.title);
      setMeta('property', 'og:description', page.description);
      setMeta('name', 'twitter:title', page.title);
      setMeta('name', 'twitter:description', page.description);
    }

    // Google Tag Manager: the React app changes pages without a reload, so tell GTM about each
    // one. In GTM, trigger page-view tags on the custom event "page_view". Waits a moment so card
    // pages have set their own title first.
    const t = setTimeout(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
