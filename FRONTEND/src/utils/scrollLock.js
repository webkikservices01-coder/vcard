import { useEffect } from 'react';

// Reference-counted body scroll lock. Uses position:fixed (the only approach that also stops
// rubber-band/background scrolling on iOS Safari) and restores the exact scroll position after.
let lockCount = 0;
let saved = null;

export const lockScroll = () => {
  lockCount += 1;
  if (lockCount > 1) return;
  const { body, documentElement } = document;
  const y = window.scrollY;
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  saved = {
    y,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };
  body.style.position = 'fixed';
  body.style.top = `-${y}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
};

export const unlockScroll = () => {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0 || !saved) return;
  const { body } = document;
  body.style.position = saved.position;
  body.style.top = saved.top;
  body.style.width = saved.width;
  body.style.overflow = saved.overflow;
  body.style.paddingRight = saved.paddingRight;
  window.scrollTo(0, saved.y);
  saved = null;
};

export const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;
    lockScroll();
    return unlockScroll;
  }, [active]);
};
