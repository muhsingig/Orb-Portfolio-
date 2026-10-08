// React islands: React Bits components mounted into slots of the vanilla page.
// The scroll engine publishes state (current project, journey year) through
// ../bus.js; islands read it with useSyncExternalStore.
import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiClaude, SiClaudecode, SiCursor, SiNextdotjs, SiReact, SiFirebase, SiSupabase, SiVercel, SiGithub,
  SiMake, SiZapier, SiWordpress, SiGooglegemini, SiGoogleads, SiSemrush, SiThreedotjs, SiGsap,
  SiModelcontextprotocol, SiAnthropic,
} from 'react-icons/si';
import {
  LuSparkles, LuBanana, LuMegaphone, LuNotebookPen, LuSearchCheck, LuChartColumn, LuTelescope,
  LuHandshake, LuHandCoins,
} from 'react-icons/lu';

import GooeyNav from '@/components/GooeyNav';
import RotatingText from '@/components/RotatingText';
import ElectricBorder from '@/components/ElectricBorder';
import TiltedCard from '@/components/TiltedCard';
import SplitFlapText from '@/components/SplitFlapText';
import ScrollVelocity from '@/components/ScrollVelocity';
import { LogoLoop } from '@/components/LogoLoop';
import TextPressure from '@/components/TextPressure';
import CardSwap, { Card } from '@/components/CardSwap';
import GlareHover from '@/components/GlareHover';

import { site, nav, projects, toolkit, certifications } from '../data.js';
import { subscribe, getState, setState } from '../bus.js';
import { lockScroll } from '../ui.js';

gsap.registerPlugin(ScrollTrigger);

const ICONS = {
  SiClaude, SiClaudecode, SiCursor, SiNextdotjs, SiReact, SiFirebase, SiSupabase, SiVercel, SiGithub,
  SiMake, SiZapier, SiWordpress, SiGooglegemini, SiGoogleads, SiSemrush, SiThreedotjs, SiGsap,
  SiModelcontextprotocol, SiAnthropic,
  LuSparkles, LuBanana, LuMegaphone, LuNotebookPen, LuSearchCheck, LuChartColumn, LuTelescope,
  LuHandshake, LuHandCoins,
};
const pad2 = (n) => String(n).padStart(2, '0');
const useBus = () => useSyncExternalStore(subscribe, getState);

// ---------------------------------------------------------------
// Brand logos: one icon per tool in its own colour (see toolkit.brands)
// ---------------------------------------------------------------
const brandSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const brandColor = (name) => {
  const b = toolkit.brands[name];
  return b ? (b.gradient ? b.gradient[0] : b.color) : 'var(--lilac)';
};

// Gradient fills for multi-colour logos, defined once and referenced by id
function BrandGradients() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(toolkit.brands)
          .filter(([, b]) => b.gradient && b.icon)
          .map(([name, b]) => (
            <linearGradient key={name} id={`brand-grad-${brandSlug(name)}`} x1="0" y1="0" x2="1" y2="1">
              {b.gradient.map((c, i) => (
                <stop key={c} offset={i / (b.gradient.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          ))}
      </defs>
    </svg>
  );
}

// tone="ink": one colour that follows the surrounding text (the dark-on-gradient band)
function BrandIcon({ name, tone = 'brand', className = '' }) {
  const b = toolkit.brands[name];
  if (!b) return null;
  if (b.mono) {
    const style = tone === 'ink'
      ? { background: 'currentColor' }
      : { background: `linear-gradient(135deg, ${b.gradient.join(', ')})` };
    return (
      <span className={`brandMono${tone === 'ink' ? ' brandMono--ink' : ''} ${className}`} style={style} aria-hidden="true">
        <span>{b.mono}</span>
      </span>
    );
  }
  const Icon = ICONS[b.icon];
  if (!Icon) return null;
  let style;
  if (tone === 'ink') style = undefined;
  else if (b.gradient) style = { fill: `url(#brand-grad-${brandSlug(name)})` };
  else style = { color: b.color };
  return <Icon className={`brandIcon ${className}`} style={style} aria-hidden="true" focusable="false" />;
}

// ---------------------------------------------------------------
// Header: Gooey nav. The pill follows the section being read; a click
// bursts particles and holds the pill on the target while the page scrolls
// there.
// ---------------------------------------------------------------
const NAV_ITEMS = nav.map((n) => ({
  label: n.label,
  href: n.target,
  attrs: { 'data-nav': n.target },
}));

function HeaderNav() {
  const { section } = useBus();
  const [clicked, setClicked] = useState(null);
  useEffect(() => {
    if (clicked === null) return undefined;
    const t = setTimeout(() => setClicked(null), 1800);
    return () => clearTimeout(t);
  }, [clicked]);
  const fromScroll = nav.findIndex((n) => n.index === section);
  return (
    <GooeyNav
      items={NAV_ITEMS}
      activeIndex={clicked ?? fromScroll}
      onSelect={(i) => setClicked(i)}
      ariaLabel="Primary"
      animationTime={520}
      particleCount={14}
      particleDistances={[78, 10]}
      particleR={90}
      timeVariance={260}
    />
  );
}

// ---------------------------------------------------------------
// Hero: rotating role
// ---------------------------------------------------------------
function HeroRoles() {
  return (
    <RotatingText
      texts={site.roles}
      mainClassName="heroRotate"
      splitLevelClassName="heroRotate__split"
      staggerFrom="last"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-120%' }}
      staggerDuration={0.025}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      rotationInterval={2600}
    />
  );
}

// ---------------------------------------------------------------
// Projects: electric frame + tilting screenshot inside the core
// ---------------------------------------------------------------
function ProjectElectric() {
  const { project, projectsActive } = useBus();
  if (!projectsActive) return null; // unmount = no canvas loop off-screen
  return (
    <ElectricBorder color={projects[project].accent} speed={0.9} chaos={0.09} borderRadius={28} style={{ width: '100%', height: '100%' }}>
      <div style={{ height: '100%' }} />
    </ElectricBorder>
  );
}

function ProjectShot() {
  const { project } = useBus();
  const p = projects[project];
  const open = () => document.getElementById('project-view')?.click();
  return (
    <div
      className="projectShot"
      key={p.slug}
      role="button"
      tabIndex={-1}
      aria-label={`Open the ${p.name} case study`}
      data-cursor="Open"
      onClick={open}
    >
      <TiltedCard
        imageSrc={p.image}
        altText={`${p.name}: ${p.baseline}`}
        captionText="Open the case study"
        containerHeight="100%"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        rotateAmplitude={9}
        scaleOnHover={1.03}
        showMobileWarning={false}
        showTooltip
        displayOverlayContent
        overlayContent={
          <span className="projectShot__chip">
            {pad2(project + 1)} · {p.url ? 'Live site' : p.deck ? 'Deck' : 'Case study'}
          </span>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------
// Journey: departure-board year
// ---------------------------------------------------------------
function JourneyYear() {
  const { year } = useBus();
  return (
    <SplitFlapText
      text={year}
      padTo={4}
      charset="numeric"
      fontSize="clamp(44px, 5.6vw, 92px)"
      tileColor="#151027"
      textColor="#efe7ff"
      tileRadius={10}
      gap={6}
      flipsPerChar={5}
      flipDuration={0.09}
      stagger={0.05}
    />
  );
}

// ---------------------------------------------------------------
// Toolkit: scroll-velocity bands + logo loop
// ---------------------------------------------------------------
function BandWords({ words, tone }) {
  return (
    <span className="velocity__words">
      {words.map((w, i) => (
        <span key={w} className="velocity__group">
          <BrandIcon name={w} tone={tone} className="velocity__logo" />
          <span className={`velocity__word${i % 2 ? ' velocity__word--outline' : ''}`}>{w}</span>
        </span>
      ))}
    </span>
  );
}

function Band({ words, velocity, tone }) {
  return (
    <ScrollVelocity
      texts={[<BandWords words={words} tone={tone} />]}
      velocity={velocity}
      numCopies={3}
      damping={50}
      stiffness={400}
      className="velocity__copy"
      parallaxClassName="velocity"
      scrollerClassName="velocity__scroller"
    />
  );
}

function ToolLogos() {
  const logos = toolkit.loop.map((title) => ({ node: <BrandIcon name={title} />, title }));
  return (
    <LogoLoop
      logos={logos}
      speed={50}
      direction="left"
      logoHeight={26}
      gap={48}
      hoverSpeed={12}
      scaleOnHover
      ariaLabel="Tools I build with"
      renderItem={(item) => (
        <span className="logoChip" style={{ '--brand': brandColor(item.title) }}>
          {item.node}
          <span className="logoChip__name">{item.title}</span>
        </span>
      )}
    />
  );
}

// Skill cards: every chip carries its tool's logo
function ToolkitPillars() {
  useEffect(() => {
    const cards = document.querySelectorAll('#pillars .pillar');
    gsap.set(cards, { opacity: 0, y: 40 });
    const st = ScrollTrigger.create({
      trigger: '#pillars',
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }),
    });
    return () => st.kill();
  }, []);
  return (
    <>
      {toolkit.pillars.map((p) => (
        <article key={p.name} className="pillar spotlight">
          <div className="pillar__top">
            <span className="pillar__idx">{p.index}</span>
            <span className="pillar__count">{pad2(p.items.length)} skills</span>
          </div>
          <h3 className="pillar__name">{p.name}</h3>
          <ul className="pillar__items">
            {p.items.map((item) => (
              <li key={item} style={{ '--brand': brandColor(item) }}>
                <BrandIcon name={item} className="pillar__logo" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
      <p className="pillars__langs">
        <span>Languages</span>
        {toolkit.languages.map((l, i) => (
          <span key={l.name}>
            {i > 0 && ' \u00b7 '}
            {l.name} <em>({l.level})</em>
          </span>
        ))}
      </p>
    </>
  );
}

// "Deck to URL, in five tabs": big logo beside each tool
function FiveTabs() {
  useEffect(() => {
    const rows = document.querySelectorAll('#tabs-list .tabRow');
    gsap.set(rows, { opacity: 0, y: 40 });
    const st = ScrollTrigger.create({
      trigger: '#tabs-list',
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(rows, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }),
    });
    return () => st.kill();
  }, []);
  return toolkit.tabs.steps.map((s, i) => (
    <li key={s.tool} className="tabRow" style={{ '--brand': brandColor(s.tool) }}>
      <span className="tabRow__num">{pad2(i + 1)}</span>
      <span className="tabRow__tool">
        <BrandIcon name={s.tool} className="tabRow__logo" />
        {s.tool}
      </span>
      <span className="tabRow__line">{s.line}</span>
      <p className="tabRow__detail">{s.detail}</p>
    </li>
  ));
}

// ---------------------------------------------------------------
// Certificates: Anthropic stack, filterable gallery, full-size viewer.
// Which certificate is open lives in the bus so the stack and the
// gallery can both open the same viewer.
// ---------------------------------------------------------------
const certThumb = (c) => `/certificates/${c.slug}-thumb.jpg`;
const certFull = (c) => `/certificates/${c.slug}.jpg`;
const certPdf = (c) => `/certificates/${c.slug}.pdf`;
const openCert = (i) => setState({ cert: i });

function useNarrow(query = '(max-width: 900px)') {
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

function CertStack() {
  const narrow = useNarrow();
  const featured = certifications.items
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.issuer === 'Anthropic');
  const width = narrow ? 290 : 440;
  const height = Math.round(width / 1.319);
  return (
    <CardSwap
      key={narrow ? 'narrow' : 'wide'}
      width={width}
      height={height}
      cardDistance={narrow ? 20 : 34}
      verticalDistance={narrow ? 24 : 40}
      delay={4200}
      skewAmount={4}
      pauseOnHover
      onCardClick={(k) => openCert(featured[k].i)}
    >
      {featured.map(({ c }) => (
        <Card key={c.slug} customClass="certCard" data-cursor="View">
          <img src={certThumb(c)} alt={`${c.name}, ${c.issuer} certificate`} draggable={false} />
        </Card>
      ))}
    </CardSwap>
  );
}

function CertGallery() {
  const items = certifications.items;
  const issuers = ['All', ...new Set(items.map((c) => c.issuer))];
  const [filter, setFilter] = useState('All');
  const gridRef = useRef(null);
  const seen = useRef(false);
  const shown = items.map((c, i) => ({ c, i })).filter(({ c }) => filter === 'All' || c.issuer === filter);

  // first reveal on scroll, then a quick re-deal whenever the filter changes
  useEffect(() => {
    const cards = gridRef.current.querySelectorAll('.certItem');
    if (seen.current) {
      gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 });
      return undefined;
    }
    gsap.set(cards, { opacity: 0, y: 40 });
    const st = ScrollTrigger.create({
      trigger: gridRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        seen.current = true;
        gsap.to(cards, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 });
      },
    });
    return () => st.kill();
  }, [filter]);

  return (
    <>
      <div className="certFilters" role="group" aria-label="Filter certificates by issuer">
        {issuers.map((name) => {
          const count = name === 'All' ? items.length : items.filter((c) => c.issuer === name).length;
          return (
            <button
              key={name}
              type="button"
              className={`certFilter${filter === name ? ' is-active' : ''}`}
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name !== 'All' && <BrandIcon name={name} className="certFilter__logo" />}
              <span>{name}</span>
              <span className="certFilter__count">{pad2(count)}</span>
            </button>
          );
        })}
      </div>
      <ul className="certGrid" ref={gridRef}>
        {shown.map(({ c, i }) => (
          <li key={c.slug} className="certItem">
            <GlareHover
              width="100%"
              height="auto"
              background="#0d0b14"
              borderRadius="16px"
              borderColor="rgba(255, 255, 255, 0.12)"
              glareColor="#ffffff"
              glareOpacity={0.32}
              glareAngle={-35}
              glareSize={260}
              transitionDuration={900}
              className="certItem__frame"
            >
              <button
                type="button"
                className="certItem__open"
                onClick={() => openCert(i)}
                data-cursor="View"
                aria-label={`View the ${c.name} certificate`}
              >
                <img src={certThumb(c)} alt="" loading="lazy" draggable={false} />
              </button>
            </GlareHover>
            <div className="certItem__meta">
              <span className="certItem__issuer">
                <BrandIcon name={c.issuer} />
                {c.issuer}
              </span>
              <span className="certItem__date">{c.date}</span>
            </div>
            <h3 className="certItem__name">{c.name}</h3>
            <div className="certItem__actions">
              <button type="button" onClick={() => openCert(i)} data-cursor="View">View</button>
              <a href={certPdf(c)} target="_blank" rel="noreferrer" data-cursor="PDF">PDF ↗</a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function CertLightbox() {
  const { cert } = useBus();
  const items = certifications.items;
  const isOpen = cert !== null && cert !== undefined;
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const returnTo = document.activeElement;
    lockScroll(true);
    closeRef.current?.focus({ preventScroll: true });
    const step = (d) => setState({ cert: (getState().cert + d + items.length) % items.length });
    const onKey = (e) => {
      if (e.key === 'Escape') setState({ cert: null });
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
      returnTo?.focus?.({ preventScroll: true });
    };
  }, [isOpen, items.length]);

  if (!isOpen) return null;
  const c = items[cert];
  const step = (d) => setState({ cert: (cert + d + items.length) % items.length });
  return (
    <div className="certLightbox" role="dialog" aria-modal="true" aria-label={`${c.name} certificate`} onClick={() => setState({ cert: null })}>
      <div className="certLightbox__inner" onClick={(e) => e.stopPropagation()}>
        <img
          key={c.slug}
          className="certLightbox__img"
          src={certFull(c)}
          alt={`${c.name} certificate from ${c.issuer}, issued to Muhsin Gigani`}
        />
        <div className="certLightbox__bar">
          <div className="certLightbox__info">
            <span className="certLightbox__issuer">
              <BrandIcon name={c.issuer} />
              {c.issuer} · {c.date}
            </span>
            <strong className="certLightbox__name">{c.name}</strong>
          </div>
          <div className="certLightbox__actions">
            <span className="certLightbox__count">{pad2(cert + 1)} / {pad2(items.length)}</span>
            <button type="button" onClick={() => step(-1)} aria-label="Previous certificate" data-cursor="Prev">←</button>
            <button type="button" onClick={() => step(1)} aria-label="Next certificate" data-cursor="Next">→</button>
            <a className="certLightbox__pdf" href={certPdf(c)} download data-cursor="Save">Download PDF ↓</a>
            <button type="button" ref={closeRef} className="certLightbox__close" onClick={() => setState({ cert: null })} data-cursor="Close">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Contact: variable-font title that leans toward the cursor
// ---------------------------------------------------------------
function ContactTitle() {
  return (
    <TextPressure
      as="p"
      text="LET'S SHIP IT."
      flex
      alpha={false}
      stroke={false}
      width
      weight
      italic
      textColor="#ffffff"
      minWidth={40}
      minWeight={420}
      idleWave
      minFontSize={40}
    />
  );
}

// ---------------------------------------------------------------
export function mountIslands() {
  const mount = (id, element) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = '';
    createRoot(node).render(element);
  };

  mount('header-nav', <HeaderNav />);

  mount('hero-ticker-word', <HeroRoles />);
  mount('project-electric', <ProjectElectric />);
  mount('project-shot', <ProjectShot />);
  mount('journey-year', <JourneyYear />);
  const defs = document.createElement('div');
  defs.id = 'brand-defs';
  document.body.appendChild(defs);
  mount('brand-defs', <BrandGradients />);

  mount('pillars', <ToolkitPillars />);
  mount('tabs-list', <FiveTabs />);
  mount('velocity-a', <Band words={toolkit.marqueeA} velocity={45} />);
  mount('velocity-b', <Band words={toolkit.marqueeB} velocity={-45} tone="ink" />);
  mount('logo-loop', <ToolLogos />);
  mount('cert-stack', <CertStack />);
  mount('cert-gallery', <CertGallery />);

  const viewer = document.createElement('div');
  viewer.id = 'cert-viewer';
  document.body.appendChild(viewer);
  mount('cert-viewer', <CertLightbox />);
  mount('contact-title', <ContactTitle />);

  // Warm the cache so project screenshots swap without a flash
  projects.forEach((p) => {
    const img = new Image();
    img.src = p.image;
  });
}
