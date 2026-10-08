import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildSections } from './sections.js';
import { initScroll } from './scroll.js';
import { initPreloader, INTRO } from './preloader.js';
import { initProjectDetail } from './projectDetail.js';
import {
  initSmoothScroll, initChrome, initCursor, initSpotlight,
  initMagnetic, initReveals,
} from './ui.js';
import { mountIslands } from './react/islands.jsx';
import { initPlasmaClick } from './plasmaClick.js';
import { initContactForm } from './contactForm.js';

// Keep scroll position at top on load (matches preloader gate)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

buildSections();
// React Bits components live in slots that buildSections just created
try {
  mountIslands();
} catch (err) {
  console.error('React islands failed to mount:', err);
}
initSmoothScroll();

// Wire the ENTER button before anything heavy can fail —
// the preloader must always be dismissible.
let entered = false;
let orbStateRef = null;
let onEnterHint = () => {};
initPreloader(() => {
  entered = true;
  if (orbStateRef) {
    const T = orbStateRef.target;
    T.opacity = 1;
    const burstAt = INTRO.charge / 1000;
    // charge: fast snap to icy blue (~0.5s), then HOLD charged
    gsap.to(T, {
      cool: 1,
      halo: 1.2,
      fogAlpha: 0.65,
      fogSpeed: 1.5,
      duration: 0.55,
      ease: 'power2.out',
    });
    // while held, the filaments grow more and more energetic
    gsap.to(T, {
      filamentSpeed: 1.15,
      coreGlow: 1.0,
      duration: 1.5,
      ease: 'power1.in',
      delay: 0.4,
    });
    // burst: quick snap back to the resting pink state
    gsap.to(T, {
      cool: 0,
      halo: 0.55,
      coreGlow: 0.55,
      filamentSpeed: 0.35,
      fogAlpha: 0.45,
      fogSpeed: 0.3,
      duration: 0.55,
      ease: 'power2.inOut',
      delay: burstAt,
    });
    // scale kick at the burst moment
    gsap.to(T, {
      scale: 1.05,
      duration: 0.14,
      ease: 'power2.out',
      delay: burstAt,
      yoyo: true,
      repeat: 1,
    });
  }
  // scroll hint after the title has settled
  setTimeout(() => onEnterHint(true), INTRO.charge + INTRO.burst + INTRO.settle + 300);
});

initChrome();
initCursor();
initSpotlight();
initProjectDetail();
// a sent message makes the orb flare (once WebGL is up)
initContactForm({ onSent: () => { if (orbStateRef) orbStateRef.surge = 1.4; } });

// WebGL orb. If it fails (driver, blocklist, remote desktop),
// the site must still work as a plain page.
(async () => {
  try {
    const { initOrb, orbState } = await import('./orb/scene.js');
    initOrb(document.getElementById('orb-canvas'));
    orbStateRef = orbState;
    // Orb is already faintly alive behind the ENTER screen,
    // and powers up fully once the visitor enters.
    orbState.target.opacity = entered ? 1 : 0.5;
    // every click crackles at the cursor and makes the orb flare
    initPlasmaClick({ onStrike: () => { orbState.surge = Math.min(1.4, orbState.surge + 0.85); } });
  } catch (err) {
    console.error('Orb init failed — continuing without WebGL:', err);
    const canvas = document.getElementById('orb-canvas');
    if (canvas) canvas.style.display = 'none';
    document.body.classList.add('no-webgl');
    initPlasmaClick();
  }

  try {
    const { setHint } = initScroll();
    onEnterHint = setHint;
  } catch (err) {
    console.error('Scroll choreography failed:', err);
  }

  // React islands (and lazy images) settle after the first measurement:
  // re-measure every scroll range whenever the page height changes.
  let lastHeight = 0;
  let refreshTimer;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.getElementById('main'));

  initReveals();
  initMagnetic('.magnetic, .preloader__cta, .liveProject, .viewProject, .projectDetail__live, .contactSection__email');

  // Fonts change line lengths and section heights: re-measure once loaded
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
