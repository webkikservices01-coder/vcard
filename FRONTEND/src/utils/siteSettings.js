import { useEffect, useState } from 'react';

// What the admin panel sets for the public site (GET /api/site/settings): metal card price, the
// announcement strip, support contact and the chatbot's welcome / booking link. Fetched once per
// page load and shared by every component that asks.
const API = import.meta.env.VITE_API_URL;
let cached = null;
let pending = null;

export function loadSiteSettings() {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetch(`${API}/api/site/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((s) => {
        cached = s || {};
        return cached;
      });
  }
  return pending;
}

export function useSiteSettings() {
  const [s, setS] = useState(cached);
  useEffect(() => {
    let live = true;
    loadSiteSettings().then((v) => live && setS(v));
    return () => {
      live = false;
    };
  }, []);
  return s; // null while loading
}

let stories = null;
export function useSiteTestimonials() {
  const [list, setList] = useState(stories || []);
  useEffect(() => {
    if (stories) return undefined;
    let live = true;
    fetch(`${API}/api/site/testimonials`)
      .then((r) => (r.ok ? r.json() : { testimonials: [] }))
      .catch(() => ({ testimonials: [] }))
      .then((d) => {
        stories = d.testimonials || [];
        if (live) setList(stories);
      });
    return () => {
      live = false;
    };
  }, []);
  return list;
}
