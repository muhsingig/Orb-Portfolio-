import './style.css';
import { buildSections } from './sections.js';
import { initScroll } from './scroll.js';
import { initPreloader } from './preloader.js';
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
  if (orbStateRef) orbStateRef.target.opacity = 1;
  setTimeout(() => onEnterHint(true), 1600);
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
