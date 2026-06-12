import './style.css';
import gsap from 'gsap';
import { buildSections } from './sections.js';
import { initScroll } from './scroll.js';
import { initPreloader, INTRO } from './preloader.js';
import { initProjectDetail } from './projectDetail.js';

// Keep scroll position at top on load (matches preloader gate)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

buildSections();

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
    const chargeS = INTRO.charge / 1000;
    // charge: pink ramps to icy blue-white, halo flares, fog churns
    gsap.to(T, {
      cool: 1,
      halo: 1.2,
      coreGlow: 0.95,
      filamentSpeed: 0.85,
      fogAlpha: 0.65,
      fogSpeed: 1.5,
      duration: chargeS,
      ease: 'power2.in',
    });
    // burst: snap back toward the resting pink state
    gsap.to(T, {
      cool: 0,
      halo: 0.55,
      coreGlow: 0.55,
      filamentSpeed: 0.35,
      fogAlpha: 0.45,
      fogSpeed: 0.3,
      duration: 1.9,
      ease: 'power2.out',
      delay: chargeS,
    });
    // shockwave stand-in: quick scale pulse at the burst moment
    gsap.to(T, {
      scale: 1.05,
      duration: 0.16,
      ease: 'power2.out',
      delay: chargeS,
      yoyo: true,
      repeat: 1,
    });
  }
  // scroll hint after the title has settled
  setTimeout(() => onEnterHint(true), INTRO.charge + INTRO.burst + INTRO.settle + 300);
});

initProjectDetail();

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
  } catch (err) {
    console.error('Orb init failed — continuing without WebGL:', err);
    const canvas = document.getElementById('orb-canvas');
    if (canvas) canvas.style.display = 'none';
    document.body.classList.add('no-webgl');
  }

  try {
    const { setHint } = initScroll();
    onEnterHint = setHint;
  } catch (err) {
    console.error('Scroll choreography failed:', err);
  }
})();
