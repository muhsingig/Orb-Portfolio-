// Visitor analytics: who came, and what they did.
//
//   Vercel Web Analytics  page views, cookie-free. Turn it on in the Vercel
//                         project (Analytics tab); nothing to paste here.
//   Google Analytics 4    the conversions below. Paste the Measurement ID
//                         (G-XXXXXXXXXX) into `analytics.ga4` in data.js.
//
// Both scripts load after the first screen (first touch, scroll or key, or a
// few seconds in), so they never slow the page down. On localhost nothing is
// sent: events are printed to the console instead, for testing.
//
// Events (mark generate_lead and resume_download as key events in GA4):
//   generate_lead     contact form sent           { topic }
//   resume_download   résumé downloaded           { from }
//   email_click       mailto link clicked         { from }
//   live_site_click   a project's live site       { site, from }
//   outbound_click    any other external link     { site, from }
//   case_study_open   project overlay opened      { project, list }
import { analytics as cfg, site } from './data.js';

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname);
const WAKE_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];
const FALLBACK_MS = 6000;

let vercelTrack = null;
const pending = []; // events fired before the Vercel script arrived

export function track(name, props = {}) {
  if (LOCAL) {
    console.debug('[analytics]', name, props);
    (window.__analytics ||= []).push({ name, ...props });
    return;
  }
  // gtag queues on its own until its script is in
  if (cfg.ga4) window.gtag?.('event', name, props);
  if (vercelTrack) vercelTrack(name, props);
  else pending.push([name, props]);
}

function load() {
  if (LOCAL) return;
  import('@vercel/analytics')
    .then(({ inject, track: t }) => {
      inject({ mode: 'production', framework: 'vite' });
      vercelTrack = t;
      pending.splice(0).forEach(([n, p]) => t(n, p));
    })
    .catch(() => {});
  if (cfg.ga4) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.ga4)}`;
    document.head.appendChild(s);
  }
}

// which part of the page a click came from: "hero", "freelance", "contact"…
const sectionOf = (node) =>
  node.closest('#project-detail') ? 'case-study'
    : node.closest('#mobile-menu, .mobileMenu') ? 'menu'
    : node.closest('header') ? 'header'
    : node.closest('section[id]')?.id || 'page';

const LIVE_SITES = new Set();

function onClick(e) {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  const from = sectionOf(a);
  if (href === site.resume) return track('resume_download', { from });
  if (href.startsWith('mailto:')) return track('email_click', { from });
  let url;
  try { url = new URL(a.href); } catch { return; }
  if (url.origin === location.origin || !/^https?:$/.test(url.protocol)) return;
  const host = url.hostname.replace(/^www\./, '');
  track(LIVE_SITES.has(host) ? 'live_site_click' : 'outbound_click', { site: host, from });
}

export function initAnalytics({ liveSites = [] } = {}) {
  liveSites.forEach((u) => {
    try { LIVE_SITES.add(new URL(u).hostname.replace(/^www\./, '')); } catch { /* skip */ }
  });

  // gtag must exist before its script so early events queue up
  if (cfg.ga4 && !LOCAL) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.ga4);
  }

  document.addEventListener('click', onClick, true);

  let started = false;
  const opts = { passive: true, capture: true };
  const start = () => {
    if (started) return;
    started = true;
    WAKE_EVENTS.forEach((t) => window.removeEventListener(t, start, opts));
    load();
  };
  WAKE_EVENTS.forEach((t) => window.addEventListener(t, start, opts));
  setTimeout(start, FALLBACK_MS);
}
