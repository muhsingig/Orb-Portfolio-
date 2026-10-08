import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { orbState, diveRGB } from './orb/state.js';
import { manifestLines, projects } from './data.js';
import { setHeaderSection, setNavResolver, scrollToTarget } from './ui.js';
import { setState } from './bus.js';

gsap.registerPlugin(ScrollTrigger);

const T = orbState.target;

// Resting values every zone starts from, so jumping anywhere on the page
// (nav links, refresh mid-page) always lands on a complete orb state.
const BASE = {
  x: 0, y: 0, scale: 1,
  filamentSpeed: 0.35, filamentLength: 1, filamentAlpha: 1,
  coreGlow: 0.55, halo: 0.55, glass: 0.5, dim: 0,
  dive: 0, theme: 0, cool: 0, wine: 0,
  fogAlpha: 0.45, fogSpeed: 0.3,
};

function setOrb(values) {
  Object.assign(T, BASE, values);
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Window helper: 0→1 inside [a,b]
function win(p, a, b) {
  return clamp01((p - a) / (b - a));
}

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const isNarrow = () => window.innerWidth <= 900;

// Projects: phase lengths in viewport heights
const PROJ = { approach: 80, dive: 70, per: 62, exit: 110 };
PROJ.total = PROJ.approach + PROJ.dive + PROJ.per * projects.length + PROJ.exit;
const PF = {
  approach: PROJ.approach / PROJ.total,
  dive: (PROJ.approach + PROJ.dive) / PROJ.total,
  carousel: (PROJ.total - PROJ.exit) / PROJ.total,
};
const projectDive = projects.map((p) => diveRGB(p.dive));

export function initScroll() {
  const scrollHint = document.getElementById('scroll-hint');
  const projectsSection = document.getElementById('projects');
  projectsSection.style.height = `${PROJ.total}vh`;

  // ==========================================================
  // ORB DIRECTOR — one zone per section, contiguous by start.
  // The active zone is the last one whose start we've passed.
  // ==========================================================
  const header = document.getElementById('site-header');
  const zones = [];
  function zone(trigger, start, end, apply) {
    const node = document.querySelector(trigger);
    const st = ScrollTrigger.create({ trigger: node, start, end });
    zones.push({ st, apply, node, index: node.dataset.index, label: node.dataset.label });
  }

  // HERO — orb centered; as we leave, orb drifts right
  zone('#hero', 'top top', 'bottom top', (p) => {
    setOrb({
      x: p * 0.62,
      y: p * -0.02,
      scale: 1 - p * 0.06,
      filamentSpeed: 0.35 - p * 0.3,
      coreGlow: 0.55 - p * 0.35,
      halo: 0.55 - p * 0.45,
      dim: p * 0.6,
      fogAlpha: 0.45 - p * 0.3,
    });
  });

  // MANIFEST — four lines, each with its own sphere mood
  zone('#manifest', 'top top', 'bottom bottom', (p) => {
    let cfgA = manifestLines[0].sphere;
    let cfgB = cfgA;
    let mix = 0;
    for (let i = 0; i < manifestLines.length; i++) {
      const l = manifestLines[i];
      if (p >= l.start && p <= l.end) {
        cfgA = l.sphere;
        const next = manifestLines[i + 1];
        if (next && p > l.exitStart) {
          cfgB = next.sphere;
          mix = win(p, l.exitStart, next.enterEnd > l.end ? next.enterEnd : l.end);
        } else {
          cfgB = l.sphere;
        }
        break;
      }
    }
    const m = (a, b) => a + (b - a) * mix;
    setOrb({
      x: 0.62,
      scale: 0.94,
      filamentSpeed: m(cfgA.filamentSpeed, cfgB.filamentSpeed),
      halo: m(cfgA.halo, cfgB.halo),
      glass: 0.3 + m(cfgA.glass, cfgB.glass),
      dim: m(cfgA.dim, cfgB.dim) * 0.85,
      fogAlpha: m(cfgA.fogAlpha, cfgB.fogAlpha),
      fogSpeed: m(cfgA.fogSpeed, cfgB.fogSpeed),
      coreGlow: 0.35 + m(1 - cfgA.dim, 1 - cfgB.dim) * 0.6,
    });
  });

  // ABOUT — orb stays right and turns electric violet
  function aboutOrb() {
    return isNarrow()
      ? { x: 0.62, y: 0.66, scale: 0.62, dim: 0.4 }
      : { x: 0.53, y: 0.02, scale: 1.04, dim: 0 }; // big enough to crest around the profile card
  }
  zone('#about', 'top bottom', 'bottom bottom', (p, z) => {
    const enterFrac = window.innerHeight / Math.max(1, z.st.end - z.st.start);
    const e = smooth(win(p, 0, enterFrac));
    const a = aboutOrb();
    setOrb({
      x: lerp(0.62, a.x, e),
      y: lerp(0, a.y, e),
      scale: lerp(0.94, a.scale, e),
      theme: e,
      dim: lerp(0, a.dim, e),
      filamentSpeed: lerp(1.0, 0.4, e),
      coreGlow: lerp(0.95, 0.6, e),
      halo: lerp(1.0, 0.4, e),
      glass: 0.55,
      fogAlpha: lerp(0.8, 0.3, e),
      fogSpeed: lerp(1.3, 0.3, e),
    });
  });

  // JOURNEY — orb glides from About to small, lower-left, icy blue
  function journeyOrb() {
    return isNarrow()
      ? { x: 0.55, y: 0.55, scale: 0.6, cool: 0.65, dim: 0.45 }
      : { x: -0.62, y: -0.42, scale: 0.55, cool: 0.65, dim: 0 };
  }
  zone('#journey', 'top bottom', 'bottom top', (p, z) => {
    const enterFrac = window.innerHeight / Math.max(1, z.st.end - z.st.start);
    const e = smooth(win(p, 0, enterFrac));
    const a = aboutOrb();
    const j = journeyOrb();
    setOrb({
      x: lerp(a.x, j.x, e),
      y: lerp(a.y, j.y, e) + p * 0.12,
      scale: lerp(a.scale, j.scale, e),
      theme: 1 - e,
      cool: j.cool * e,
      dim: lerp(a.dim, j.dim, e),
      filamentSpeed: 0.45,
      coreGlow: 0.65,
      halo: 0.45,
      glass: 0.5,
      fogAlpha: 0.3,
    });
  });

  // WORK — from the journey corner: glide to centre, charge, dive into the
  // core, carousel, then zoom back out to where the Toolkit picks it up
  zone('#projects', 'top bottom', 'bottom bottom', (p) => {
    const approach = smooth(win(p, 0, PF.approach));
    const dive = win(p, PF.approach, PF.dive);
    const exit = win(p, PF.carousel, 1);
    const idx = Math.min(projects.length - 1, Math.floor(win(p, PF.dive, PF.carousel) * projects.length));
    Object.assign(T, projectDive[idx]);

    if (exit > 0) {
      const t = toolkitOrb(0);
      const ex = smooth(exit);
      setOrb({
        x: lerp(0, t.x, ex),
        y: lerp(0, t.y, ex),
        scale: lerp(4.4, 1.15, ex),
        dive: 1 - ex,
        filamentLength: 2.6 - ex * 1.6,
        filamentSpeed: 1 - ex * 0.6,
        glass: ex * 0.5,
        coreGlow: 1.1 - ex * 0.55,
        halo: ex * 0.5,
        fogAlpha: ex * 0.35,
        theme: ex * 0.4,
        dim: ex * 0.25,
      });
      return;
    }

    const j = journeyOrb();
    setOrb({
      x: lerp(j.x, 0, approach),
      y: lerp(j.y + 0.1, 0, approach),
      scale: lerp(j.scale, 1.0, approach) + dive * 3.4, // up to ~4.4
      cool: lerp(j.cool, 0, approach),
      dim: lerp(j.dim, 0, approach),
      dive,
      filamentLength: 1 + dive * 1.6,
      filamentSpeed: lerp(0.45, 0.85, approach) + dive * 0.15,
      glass: (1 - dive) * 0.5,
      coreGlow: lerp(0.65, 0.95, approach) + dive * 0.15,
      halo: lerp(0.45, 0.55, approach) * (1 - dive),
      fogAlpha: (1 - dive) * 0.6,
      fogSpeed: 0.6,
    });
  });

  // TOOLKIT — orb peeks in from the left edge, coral
  function toolkitOrb(p = 1) {
    return { x: isNarrow() ? -0.7 : -0.98, y: lerp(0.3, -0.3, p) };
  }
  zone('#toolkit', 'top bottom', 'bottom top', (p) => {
    const t = toolkitOrb(p);
    setOrb({
      x: t.x,
      y: t.y,
      scale: 1.15,
      theme: 0.4,
      dim: 0.25,
      filamentSpeed: 0.4,
      halo: 0.5,
      fogAlpha: 0.35,
    });
  });

  // CERTIFICATES — orb swings right and glows behind the certificate stack,
  // then lifts and dims while the gallery is being read
  zone('#certificates', 'top bottom', 'bottom top', (p, z) => {
    const enterFrac = window.innerHeight / Math.max(1, z.st.end - z.st.start);
    // wait until the section fills most of the screen before crossing over
    const e = smooth(win(p, enterFrac * 0.45, enterFrac * 1.05));
    const n = isNarrow();
    const t = toolkitOrb();
    const read = smooth(win(p, enterFrac * 1.2, Math.min(1, enterFrac * 2.2)));
    setOrb({
      x: lerp(t.x, n ? 0.62 : 0.6, e) + read * 0.4,
      y: lerp(t.y, n ? 0.74 : 0.14, e) + read * 0.3,
      scale: lerp(1.15, n ? 0.56 : 1.0, e),
      theme: lerp(0.4, 0, e),
      wine: e, // burgundy while the certificates are on screen
      dim: lerp(0.25, n ? 0.55 : 0, e) + read * 0.55,
      filamentSpeed: 0.55,
      coreGlow: lerp(0.55, 0.95, e),
      halo: lerp(0.5, 0.95, e),
      glass: lerp(0.5, 0.75, e),
      fogAlpha: lerp(0.35, 0.6, e),
    });
  });

  // CONTACT — violet, energised
  zone('#contact', 'top bottom', 'bottom bottom', (p) => {
    const n = isNarrow();
    setOrb({
      x: n ? 0.62 : 0.53 + p * 0.05,
      y: n ? 0.66 : 0.02,
      // big enough to crest around the message card
      scale: n ? 0.62 + p * 0.06 : 1.04 + p * 0.1,
      theme: 1,
      coreGlow: 0.6 + p * 0.35,
      filamentSpeed: 0.4 + p * 0.3,
      halo: 0.4 + p * 0.25,
      glass: 0.55,
      fogAlpha: 0.3 + p * 0.2,
      dim: n ? 0.3 : 0,
    });
  });

  function applyZones() {
    const y = window.scrollY;
    let zi = 0;
    for (let i = 0; i < zones.length; i++) {
      if (y >= zones[i].st.start - 1) zi = i;
    }
    const z = zones[zi];
    const p = clamp01((y - z.st.start) / Math.max(1, z.st.end - z.st.start));
    z.apply(p, z);

    // Header label: whichever section sits under the middle of the screen
    const mid = y + window.innerHeight * 0.5;
    let label = zones[0];
    for (const zz of zones) if (zz.node.offsetTop <= mid) label = zz;
    setHeaderSection(label.index, label.label);
    header.classList.toggle('is-scrolled', y > window.innerHeight * 0.6);
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: applyZones });
  ScrollTrigger.addEventListener('refresh', applyZones);

  // ----------------------------------------------------------
  // MANIFEST — text lines + meter
  // ----------------------------------------------------------
  const lineEls = manifestLines.map((l) => document.getElementById(`manifest-line-${l.id}`));
  const ticks = document.querySelectorAll('.manifestMeter__tick');
  ScrollTrigger.create({
    trigger: '#manifest',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      manifestLines.forEach((l, i) => {
        const node = lineEls[i];
        let o = 0;
        if (p >= l.start && p <= l.end) {
          o = Math.min(win(p, l.start, l.enterEnd), 1 - win(p, l.exitStart, l.end));
        }
        node.style.opacity = o.toFixed(3);
        const dy = (1 - o) * 14;
        const blur = (1 - o) * 8;
        node.style.filter = o < 0.999 ? `blur(${blur.toFixed(1)}px)` : 'none';
        node.style.transform = mobile
          ? `translate(-50%, ${dy.toFixed(1)}px)`
          : `translateY(calc(-50% - 8vh + ${dy.toFixed(1)}px))`;
        ticks[i].classList.toggle('is-active', p >= l.start && p < l.end);
        ticks[i].style.setProperty('--fill', win(p, l.start, l.end).toFixed(3));
      });
    },
  });

  // ----------------------------------------------------------
  // PROJECTS — UI inside the core
  // ----------------------------------------------------------
  const titleEl = document.getElementById('project-title');
  const viewEl = document.getElementById('project-view');
  const liveEl = document.getElementById('project-live');
  const numEl = document.getElementById('project-num');
  const catEl = document.getElementById('project-cat');
  const baseEl = document.getElementById('project-baseline');
  const coreEl = document.getElementById('project-core');
  const railFill = document.getElementById('project-rail-fill');
  const indexBtns = document.querySelectorAll('.projectIndex__btn');
  let currentProject = -1;

  function showProject(i) {
    if (i === currentProject) return;
    currentProject = i;
    const proj = projects[i];
    titleEl.textContent = proj.name;
    titleEl.dataset.text = proj.name;
    titleEl.classList.remove('is-glitching');
    void titleEl.offsetWidth; // restart animation
    titleEl.classList.add('is-glitching');
    numEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    catEl.textContent = proj.category;
    baseEl.textContent = proj.baseline;
    document.getElementById('project-result-value').textContent = proj.result?.value ?? '';
    document.getElementById('project-result-label').textContent = proj.result?.label ?? '';
    document.getElementById('project-case').hidden = !proj.caseStudy;
    viewEl.dataset.index = String(i);
    const link = proj.url || proj.deck;
    liveEl.hidden = !link;
    if (link) {
      liveEl.href = link;
      liveEl.innerHTML = `${proj.url ? 'Live site' : 'View deck'} <span>&#8599;</span>`;
    }
    projectsSection.style.setProperty('--accent', proj.accent);
    indexBtns.forEach((b, bi) => b.classList.toggle('is-active', bi === i));
    setState({ project: i });
  }

  const projST = ScrollTrigger.create({
    trigger: '#projects',
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      const carousel = win(p, PF.dive, PF.carousel);
      const active = p > PF.dive - 0.02 && p < PF.carousel + 0.01;
      projectsSection.classList.toggle('projects--active', active);
      setState({ projectsActive: active });
      railFill.style.transform = `scaleY(${carousel.toFixed(4)})`;
      if (active) {
        const idx = Math.min(projects.length - 1, Math.floor(carousel * projects.length));
        showProject(idx);
        // fade near transitions
        const local = (carousel * projects.length) % 1;
        const edgeIn = idx === 0 ? 1 : win(local, 0, 0.14);
        const edgeOut = idx === projects.length - 1 ? 1 : 1 - win(local, 0.86, 1);
        const o = Math.min(edgeIn, edgeOut);
        coreEl.style.opacity = o.toFixed(3);
        coreEl.style.transform = `translate(-50%, calc(-50% + ${((1 - o) * 18).toFixed(1)}px))`;
      }
    },
  });

  // Scroll position for project i (centre of its carousel slot)
  function projectY(i) {
    const range = projST.end - projST.start;
    const frac = PF.dive + ((i + 0.5) / projects.length) * (PF.carousel - PF.dive);
    return projST.start + frac * range;
  }
  indexBtns.forEach((b) => {
    b.addEventListener('click', () => scrollToTarget(projectY(Number(b.dataset.index))));
  });
  setNavResolver('#projects', () => projectY(0) - (projST.end - projST.start) * 0.02);

  // ----------------------------------------------------------
  // JOURNEY — progress line, active entry, year counter
  // ----------------------------------------------------------
  const lineFill = document.getElementById('journey-line-fill');
  ScrollTrigger.create({
    trigger: '#journey-entries',
    start: 'top 60%',
    end: 'bottom 60%',
    onUpdate(self) { lineFill.style.transform = `scaleY(${self.progress.toFixed(4)})`; },
  });
  gsap.utils.toArray('.journeyEntry').forEach((entry) => {
    gsap.set(entry.querySelector('.journeyEntry__card'), { opacity: 0, x: 50 });
    ScrollTrigger.create({
      trigger: entry,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(entry.querySelector('.journeyEntry__card'), {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      }),
    });
    ScrollTrigger.create({
      trigger: entry,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle(self) {
        entry.classList.toggle('is-current', self.isActive);
        if (self.isActive) setState({ year: entry.dataset.year });
      },
    });
  });

  // ----------------------------------------------------------
  // ABOUT — staggered fades
  // ----------------------------------------------------------
  const aboutItems = gsap.utils.toArray('.aboutSection__fade');
  gsap.set(aboutItems, { opacity: 0, y: 26 });
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      aboutItems.forEach((node, i) => {
        const lp = win(p, 0.02 + i * 0.05, 0.14 + i * 0.05);
        gsap.set(node, { opacity: lp, y: 26 * (1 - lp) });
      });
    },
  });

  // ----------------------------------------------------------
  // Scroll hint — hero & projects only
  // ----------------------------------------------------------
  let hintVisible = false;
  let hintAllowed = false;
  function updateHint() {
    const vh = window.innerHeight;
    const r = projectsSection.getBoundingClientRect();
    const show = hintAllowed && r.top < -vh && r.bottom > vh * 2;
    if (show === hintVisible) return;
    hintVisible = show;
    scrollHint.classList.toggle('scrollHint--visible', show);
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: updateHint });

  applyZones();

  return {
    // called once the intro has settled
    setHint(v) {
      hintAllowed = v;
      updateHint();
    },
  };
}
