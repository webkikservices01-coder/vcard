// A stand-in browser for the card server renderer (src/entry-card-server.jsx). The card code reads
// window / document / navigator here and there; in the server build those names point at these
// objects instead (scripts/build-card-ssr.mjs "define"), so the backend's own globals are never
// touched. Only what drawing a card needs: nothing here does any work.
const noop = () => {};
const storage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop, key: () => null, length: 0 };
const element = () => ({
  style: {},
  dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop,
  appendChild: noop,
  addEventListener: noop,
  removeEventListener: noop,
  getContext: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
});
const SITE = 'https://aicardly.com';

globalThis.__wcWin = {
  location: { origin: SITE, href: `${SITE}/`, pathname: '/', search: '', hash: '', host: 'aicardly.com', hostname: 'aicardly.com', protocol: 'https:' },
  localStorage: storage,
  sessionStorage: storage,
  innerWidth: 412,
  innerHeight: 860,
  devicePixelRatio: 2,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
  requestIdleCallback: () => 0,
  cancelIdleCallback: noop,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: noop,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  open: noop,
  scrollTo: noop,
};
globalThis.__wcDoc = {
  readyState: 'loading',
  hidden: false,
  title: '',
  documentElement: element(),
  head: element(),
  body: element(),
  createElement: element,
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: noop,
  removeEventListener: noop,
};
globalThis.__wcNav = { userAgent: 'Mozilla/5.0 (server render)', language: 'en-IN', languages: ['en-IN'], maxTouchPoints: 0, onLine: true };
globalThis.__wcImage = class {
  set src(v) {
    this._src = v;
  }
  get src() {
    return this._src;
  }
};
