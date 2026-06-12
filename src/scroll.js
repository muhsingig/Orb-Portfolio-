import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { orbState } from './orb/scene.js';
import { manifestLines, projects } from './data.js';

gsap.registerPlugin(ScrollTrigger);

const T = orbState.target;

// Convenience: tween orb target values
function setOrb(values) {
  Object.assign(T, values);
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Window helper: 0→1 inside [a,b]
function win(p, a, b) {
  return clamp01((p - a) / (b - a));
}

export function initScroll() {
  const scrollHint = document.getElementById('scroll-hint');

  // ----------------------------------------------------------
  // HERO — orb centered; as we leave, orb drifts right
  // ----------------------------------------------------------
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate(self) {
      const p = self.progress;
      setOrb({
        x: p * 0.62,
        y: p * -0.02,
        scale: 1 - p * 0.06,
        filamentSpeed: 0.35 - p * 0.3,
        coreGlow: 0.55 - p * 0.35,
        halo: 0.55 - p * 0.45,
        glass: 0.5,
        dim: p * 0.6,
        fogAlpha: 0.45 - p * 0.3,
      });
    },
  });

  // ----------------------------------------------------------
  // MANIFEST — pinned, 4 lines, orb parameters per line
  // ----------------------------------------------------------
  const lineEls = manifestLines.map((l) => document.getElementById(`manifest-line-${l.id}`));

  ScrollTrigger.create({
    trigger: '#manifest',
    start: 'top bottom',
    end: 'top top',
    onUpdate(self) {
      // entering manifest: orb settles right side
      const p = self.progress;
      setOrb({ x: 0.62 * 1, dim: 0.6 * (1 - p) + 0.4 * p });
    },
  });

  ScrollTrigger.create({
    trigger: '#manifest',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;

      // Text lines opacity per window
      manifestLines.forEach((l, i) => {
        const el = lineEls[i];
        if (!el) return;
        let o = 0;
        if (p >= l.start && p <= l.end) {
          const enter = win(p, l.start, l.enterEnd);
          const exit = 1 - win(p, l.exitStart, l.end);
          o = Math.min(enter, exit);
        }
        el.style.opacity = o.toFixed(3);
        const dy = (1 - o) * 14;
        el.style.transform = window.matchMedia('(max-width: 768px)').matches
          ? `translate(-50%, ${dy.toFixed(1)}px)`
          : `translateY(calc(-50% - 8vh + ${dy.toFixed(1)}px))`;
      });

      // Sphere params: interpolate between the line configs
      let cfgA = manifestLines[0].sphere;
      let cfgB = manifestLines[0].sphere;
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
            mix = 0;
          }
          break;
        }
      }
      const lerp = (a, b) => a + (b - a) * mix;
      setOrb({
        x: 0.62,
        y: 0,
        scale: 0.94,
        filamentSpeed: lerp(cfgA.filamentSpeed, cfgB.filamentSpeed),
        halo: lerp(cfgA.halo, cfgB.halo),
        glass: 0.3 + lerp(cfgA.glass, cfgB.glass),
        dim: lerp(cfgA.dim, cfgB.dim) * 0.85,
        fogAlpha: lerp(cfgA.fogAlpha, cfgB.fogAlpha),
        fogSpeed: lerp(cfgA.fogSpeed, cfgB.fogSpeed),
        coreGlow: 0.35 + lerp(1 - cfgA.dim, 1 - cfgB.dim) * 0.6,
        dive: 0,
        filamentLength: 1,
      });
    },
  });

  // ----------------------------------------------------------
  // PROJECTS — dive into the core, carousel, dive out
  // ----------------------------------------------------------
  const projectsSection = document.getElementById('projects');
  const projectsSticky = projectsSection.querySelector('.projects__sticky');
  const titleEl = document.getElementById('project-title');
  const viewEl = document.getElementById('project-view');
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
    viewEl.dataset.index = String(i);
  }

  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      // Phases (of the whole 500vh block, sticky shows after 1 viewport):
      // approach 0..0.16 — orb recenters & charges
      // dive    0.16..0.3 — zoom into core, bg -> blue
      // carousel 0.3..0.78 — 4 projects
      // exit    0.78..1 — zoom out to bottom-right
      const approach = win(p, 0, 0.16);
      const dive = win(p, 0.16, 0.3);
      const carousel = win(p, 0.3, 0.78);
      const exit = win(p, 0.78, 1);

      const active = p > 0.27 && p < 0.8;
      projectsSection.classList.toggle('projects--active', active);

      if (active) {
        const idx = Math.min(projects.length - 1, Math.floor(carousel * projects.length));
        showProject(idx);
        // fade title near transitions
        const local = (carousel * projects.length) % 1;
        const o = Math.min(win(local, 0, 0.18), 1 - win(local, 0.82, 1));
        titleEl.style.opacity = o.toFixed(3);
        viewEl.style.opacity = o.toFixed(3);
      }

      if (exit > 0) {
        // zoom out toward bottom-right (services position)
        setOrb({
          x: 0.62 * exit,
          y: -0.55 * exit,
          scale: 4.4 - exit * 4.0,
          dive: 1 - exit,
          filamentLength: 2.6 - exit * 1.6,
          filamentSpeed: 1 - exit * 0.55,
          glass: exit * 0.45,
          coreGlow: 1.1 - exit * 0.5,
          halo: exit * 0.3,
          dim: 0,
          fogAlpha: exit * 0.35,
        });
        return;
      }

      setOrb({
        x: 0.62 * (1 - approach),
        y: 0,
        scale: 0.94 + dive * 3.46, // up to ~4.4
        dive,
        filamentLength: 1 + dive * 1.6,
        filamentSpeed: 0.6 + dive * 0.4,
        glass: (1 - dive) * 0.5,
        coreGlow: 0.9 + dive * 0.2,
        halo: (1 - dive) * 0.5,
        dim: 0,
        fogAlpha: (1 - dive) * 0.6,
        theme: 0,
      });
    },
  });

  // ----------------------------------------------------------
  // SERVICES — orb small bottom-right; word reveals
  // ----------------------------------------------------------
  const quoteWords = gsap.utils.toArray('.servicesSection__quoteWord');
  const taglineWords = gsap.utils.toArray('.servicesSection__taglineWord');
  gsap.set(quoteWords, { yPercent: 120, skewY: 6 });
  gsap.set(taglineWords, { opacity: 0, yPercent: 60 });

  ScrollTrigger.create({
    trigger: '#services',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      const reveal = win(p, 0.05, 0.45);
      quoteWords.forEach((w, i) => {
        const lp = win(reveal, i / quoteWords.length, (i + 2.5) / quoteWords.length);
        gsap.set(w, { yPercent: 120 * (1 - lp), skewY: 6 * (1 - lp) });
      });
      const tag = win(p, 0.35, 0.7);
      taglineWords.forEach((w, i) => {
        const lp = win(tag, i / taglineWords.length, (i + 4) / taglineWords.length);
        gsap.set(w, { opacity: lp, yPercent: 60 * (1 - lp) });
      });

      setOrb({
        x: 0.62,
        y: -0.55,
        scale: 0.42,
        dive: 0,
        filamentLength: 1,
        filamentSpeed: 0.5,
        glass: 0.5,
        coreGlow: 0.7,
        halo: 0.45,
        dim: 0,
        fogAlpha: 0.25,
        theme: 0,
      });
    },
  });

  // ----------------------------------------------------------
  // ABOUT — orb right, warm gold theme
  // ----------------------------------------------------------
  const aboutItems = gsap.utils.toArray('.aboutSection__fade');
  gsap.set(aboutItems, { opacity: 0, y: 26 });

  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 60%',
    end: 'top top',
    onUpdate(self) {
      const p = self.progress;
      setOrb({
        x: 0.62 * 0.85 + (1 - p) * 0,
        y: -0.55 + p * 0.55,
        scale: 0.42 + p * 0.42,
        theme: p,
      });
    },
  });

  ScrollTrigger.create({
    trigger: '#about',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const p = self.progress;
      aboutItems.forEach((el, i) => {
        const lp = win(p, 0.02 + i * 0.05, 0.14 + i * 0.05);
        gsap.set(el, { opacity: lp, y: 26 * (1 - lp) });
      });
      setOrb({
        x: 0.53,
        y: 0.02,
        scale: 0.84,
        theme: 1,
        dive: 0,
        filamentSpeed: 0.4,
        filamentLength: 1,
        glass: 0.55,
        coreGlow: 0.6,
        halo: 0.4,
        dim: 0,
        fogAlpha: 0.3,
        fogSpeed: 0.3,
      });
    },
  });

  // ----------------------------------------------------------
  // CONTACT — warm orange, orb right
  // ----------------------------------------------------------
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top bottom',
    end: 'top top',
    onUpdate(self) {
      const p = self.progress;
      setOrb({
        x: 0.53 + p * 0.05,
        y: 0.02,
        scale: 0.84 + p * 0.1,
        theme: 1,
        coreGlow: 0.6 + p * 0.35,
        filamentSpeed: 0.4 + p * 0.3,
        halo: 0.4 + p * 0.25,
        fogAlpha: 0.3 + p * 0.2,
      });
    },
  });

  // ----------------------------------------------------------
  // Scroll hint visibility — hero & projects only
  // ----------------------------------------------------------
  let hintVisible = false;
  function setHint(v) {
    if (v === hintVisible) return;
    hintVisible = v;
    scrollHint.classList.toggle('scrollHint--visible', v);
  }
  ScrollTrigger.create({
    trigger: '#main',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate() {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroZone = y < vh * 0.5;
      const projEl = document.getElementById('projects');
      const r = projEl.getBoundingClientRect();
      const projZone = r.top < -vh && r.bottom > vh * 2;
      setHint(heroZone || projZone);
    },
  });

  return { setHint };
}
