// Preloader: orb + charge counter + ENTER. On enter a phased intro plays,
// calibrated against a screen recording of the original site (times after click):
//   charge   0–2000ms    orb snaps pink -> icy blue fast (~0.5s) and
//                        HOLDS, filaments growing more energetic
//   burst    2000ms      shockwave ring sweeps the viewport, title
//                        outline + electric strokes appear, orb snaps
//                        back to pink quickly (~0.5s)
//   reveal   2800ms      strokes cut out, baseline + chrome follow, scroll unlocks
//   settled  4600ms      solid white title fill completes
// Deliberately has no dependency on the WebGL module so ENTER always works.
import { lockScroll } from './ui.js';

export const INTRO = { charge: 2000, burst: 800, settle: 1800 };

const COUNT_MIN_MS = 1700;
const FONT_WAIT_CAP_MS = 3000;

export function initPreloader(onEnter) {
  const preloader = document.getElementById('preloader');
  const btn = document.getElementById('enter-btn');
  const stack = document.getElementById('hero-title-stack');
  const shockwave = document.getElementById('shockwave');
  const countEl = document.getElementById('preloader-count');
  const barEl = document.getElementById('preloader-bar');
  const logoEl = document.getElementById('preloader-logo');
  const logoRing = logoEl?.querySelector('.logo__ring');

  lockScroll(true);
  document.body.classList.add('hero-pending', 'fill-pending', 'chrome-pending');

  sizeElecSvg();
  window.addEventListener('resize', sizeElecSvg);

  // Charge counter: runs for a minimum time, waits (capped) for fonts
  let fontsDone = false;
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => { fontsDone = true; sizeElecSvg(); });
  setTimeout(() => { fontsDone = true; }, FONT_WAIT_CAP_MS);

  let ready = false;
  let shown = 0;
  const t0 = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - t0) / COUNT_MIN_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    const target = eased * (fontsDone ? 100 : 94);
    shown += (target - shown) * 0.25;
    if (t >= 1 && fontsDone && shown > 99.4) shown = 100;
    countEl.textContent = String(Math.round(shown)).padStart(3, '0');
    barEl.style.transform = `scaleX(${(shown / 100).toFixed(4)})`;
    if (logoRing) logoRing.style.strokeDashoffset = (100 - shown).toFixed(2);
    if (shown >= 100) {
      ready = true;
      logoEl?.classList.add('is-charged');
      preloader.classList.add('preloader--ready');
      btn.focus({ preventScroll: true });
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Keyboard access: Enter/Space also work once charged
  function onKey(e) {
    if (!ready) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  }
  window.addEventListener('keydown', onKey);

  const tBurst = INTRO.charge;
  const tReveal = INTRO.charge + INTRO.burst;
  const tSettled = tReveal + INTRO.settle;

  let entered = false;
  btn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    window.removeEventListener('keydown', onKey);
    preloader.classList.add('preloader--hidden');

    // burst: shockwave ring + title outline emerges with lightning
    // strokes flashing along it
    setTimeout(() => {
      sizeElecSvg();
      shockwave.classList.add('shockwave--go');
      document.body.classList.remove('hero-pending');
      stack.classList.add('elec-active');
    }, tBurst);

    // reveal: strokes cut out, chrome slides in, scroll unlocks
    setTimeout(() => {
      stack.classList.remove('elec-active');
      document.body.classList.remove('chrome-pending');
      lockScroll(false);
      preloader.remove();
      shockwave.remove();
    }, tReveal);

    // settled: solid white fill completes over the outline
    setTimeout(() => document.body.classList.remove('fill-pending'), tSettled);

    if (onEnter) onEnter();
  });
}

// Match the SVG text position to the H1 so strokes overlay the title
function sizeElecSvg() {
  const svg = document.getElementById('hero-elec');
  const outline = document.getElementById('hero-title-outline');
  if (!svg || !outline) return;
  const pad = 40;
  const rect = outline.getBoundingClientRect();
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${rect.width + pad * 2} ${rect.height + pad * 2}`);
  // Baseline: approximate cap-height placement
  const baselineY = rect.height * 0.79;
  svg.querySelectorAll('text').forEach((t) => {
    t.setAttribute('x', '0');
    t.setAttribute('y', String(baselineY));
  });
}
