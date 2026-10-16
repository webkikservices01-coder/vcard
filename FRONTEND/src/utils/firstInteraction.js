// Runs cb once, at the visitor's first sign of activity on the page (mouse move, scroll, tap or key).
// For extras that change what is on screen (the homepage demo video, the Cardy chat opening by
// itself): they wait until someone is actually looking, so the page settles fast on load (and in
// speed tests, which never move the mouse). Returns a function that cancels it.
const EVENTS = ['pointermove', 'pointerdown', 'scroll', 'wheel', 'keydown', 'touchstart'];

export function onFirstInteraction(cb) {
  let done = false;
  const fire = () => {
    if (done) return;
    done = true;
    stop();
    cb();
  };
  const stop = () => EVENTS.forEach((e) => window.removeEventListener(e, fire, { capture: true }));
  EVENTS.forEach((e) => window.addEventListener(e, fire, { capture: true, passive: true }));
  return () => {
    done = true;
    stop();
  };
}
