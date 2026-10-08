import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { site } from './data.js';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ----------------------------------------------------------------
// Smooth scroll. Lenis drives native scroll, so ScrollTrigger and
// position: sticky keep working untouched.
// ----------------------------------------------------------------
export let lenis = null;

export function initSmoothScroll() {
  if (reduceMotion) return null;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function lockScroll(locked) {
  document.documentElement.classList.toggle('scroll-locked', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

// Scroll to a selector or a pixel offset
export function scrollToTarget(target, opts = {}) {
  let y = target;
  if (typeof target === 'string') {
    const node = document.querySelector(target);
    if (!node) return;
    y = node.getBoundingClientRect().top + window.scrollY + (Number(node.dataset.navOffset) || 0);
  }
  if (lenis) {
    lenis.scrollTo(y, { duration: opts.immediate ? 0 : 1.6, immediate: opts.immediate, force: true });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
  }
}

// Optional per-target resolvers (e.g. jump straight into the project carousel)
const navResolvers = {};
export function setNavResolver(selector, fn) {
  navResolvers[selector] = fn;
}

// ----------------------------------------------------------------
// Text scramble
// ----------------------------------------------------------------
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#%&';

export function scramble(node, text, { duration = 0.6 } = {}) {
  if (!node) return;
  if (reduceMotion) { node.textContent = text; return; }
  const from = node.textContent;
  const len = Math.max(from.length, text.length);
  const frames = Math.max(8, Math.round(duration * 60));
  let frame = 0;
  cancelAnimationFrame(node._scrambleRaf);
  const tick = () => {
    let out = '';
    for (let i = 0; i < len; i++) {
      const settleAt = (i / len) * frames * 0.7 + frames * 0.3;
      if (frame >= settleAt) out += text[i] || '';
      else if (text[i] === ' ') out += ' ';
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    node.textContent = out;
    frame++;
    if (frame <= frames) node._scrambleRaf = requestAnimationFrame(tick);
    else node.textContent = text;
  };
  tick();
}

// ----------------------------------------------------------------
// Header: nav links, mobile menu, live Mumbai clock, section label
// ----------------------------------------------------------------
export function initChrome() {
  // Any [data-nav] element scrolls smoothly instead of jumping
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-nav]');
    if (!a) return;
    e.preventDefault();
    const sel = a.dataset.nav;
    closeMenu();
    const resolved = navResolvers[sel] ? navResolvers[sel]() : sel;
    scrollToTarget(resolved);
  });

  // Hover scramble on header links
  document.querySelectorAll('.siteHeader__link').forEach((a) => {
    const txt = a.querySelector('.siteHeader__linkText');
    a.addEventListener('mouseenter', () => scramble(txt, a.dataset.scramble, { duration: 0.4 }));
  });

  // Mobile menu
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    lockScroll(false);
  }
  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    if (!open) { closeMenu(); return; }
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    lockScroll(true);
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Live clock (Mumbai)
  const fmtShort = new Intl.DateTimeFormat('en-GB', { timeZone: site.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtLong = new Intl.DateTimeFormat('en-GB', { timeZone: site.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const headerClock = document.getElementById('header-clock');
  const tick = () => {
    const now = new Date();
    const short = fmtShort.format(now);
    headerClock.innerHTML = `<span class="siteHeader__clockCity">MUM</span>${short}<span class="siteHeader__clockTz">IST</span>`;
    document.querySelectorAll('[data-clock="short"]').forEach((n) => { n.textContent = `${short} IST`; });
    document.querySelectorAll('[data-clock="long"]').forEach((n) => { n.textContent = `${fmtLong.format(now)} IST`; });
  };
  tick();
  setInterval(tick, 1000);

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) { bar.style.transform = `scaleX(${self.progress.toFixed(4)})`; },
  });

  // Copy email
  const copy = document.getElementById('copy-email');
  if (copy) {
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(site.email);
        copy.classList.add('is-copied');
        copy.firstChild.textContent = 'Copied!';
      } catch {
        window.location.href = `mailto:${site.email}`;
        return;
      }
      setTimeout(() => {
        copy.classList.remove('is-copied');
        copy.firstChild.textContent = 'Copy email';
      }, 1800);
    });
  }
}

let currentSection = '';
export function setHeaderSection(index, label) {
  const key = `${index}${label}`;
  if (key === currentSection) return;
  currentSection = key;
  document.getElementById('header-section-idx').textContent = index;
  scramble(document.getElementById('header-section-name'), label, { duration: 0.45 });
  document.querySelectorAll('.siteHeader__link').forEach((a) => {
    a.classList.toggle('is-active', a.querySelector('.siteHeader__linkIdx').textContent === index);
  });
}

// ----------------------------------------------------------------
// Custom cursor: dot + lagging ring, label on interactive elements
// ----------------------------------------------------------------
export function initCursor() {
  if (!finePointer) return;
  const cursor = document.getElementById('cursor');
  const label = document.getElementById('cursor-label');
  document.body.classList.add('has-cursor');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ring = { x: pos.x, y: pos.y };
  const dot = cursor.querySelector('.cursor__dot');
  const ringEl = cursor.querySelector('.cursor__ring');

  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  const INTERACTIVE = 'a, button, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest(INTERACTIVE);
    if (!t) return;
    cursor.classList.add('is-hover');
    const text = t.dataset.cursor || '';
    label.textContent = text;
    cursor.classList.toggle('has-label', Boolean(text));
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest(INTERACTIVE);
    if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    cursor.classList.remove('is-hover', 'has-label');
  });

  gsap.ticker.add(() => {
    ring.x += (pos.x - ring.x) * 0.18;
    ring.y += (pos.y - ring.y) * 0.18;
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    ringEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
  });
}

// ----------------------------------------------------------------
// Magnetic buttons + spotlight cards
// ----------------------------------------------------------------
export function initMagnetic(selector = '.magnetic') {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll(selector).forEach((node) => {
    const strength = Number(node.dataset.magnet) || 0.3;
    const xTo = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3.out' });
    node.addEventListener('pointermove', (e) => {
      const r = node.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    node.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

export function initSpotlight() {
  if (!finePointer) return;
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.spotlight');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

// ----------------------------------------------------------------
// Reveal-on-scroll for flow sections
// ----------------------------------------------------------------
export function initReveals() {
  gsap.utils.toArray('.splitReveal').forEach((node) => {
    const words = node.querySelectorAll('.sw__in');
    gsap.set(words, { yPercent: 115, rotate: 4 });
    ScrollTrigger.create({
      trigger: node,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(words, {
        yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06,
      }),
    });
  });

  gsap.utils.toArray('.fadeUp').forEach((node) => {
    gsap.set(node, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: node,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(node, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.15 }),
    });
  });
}
