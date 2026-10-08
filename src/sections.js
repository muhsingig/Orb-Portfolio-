import {
  site, nav, manifestLines, projects, journey, toolkit, certifications, about, contact,
} from './data.js';
import { logoSVG } from './logo.js';

// Small DOM helper: el('p', 'cls', 'text')
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

// Split a string into masked word spans for reveal animations
export function splitWords(target, text, wordCls = 'sw', innerCls = 'sw__in') {
  target.textContent = '';
  target.setAttribute('aria-label', text);
  text.split(' ').forEach((word, i, arr) => {
    const wrap = el('span', wordCls);
    wrap.setAttribute('aria-hidden', 'true');
    const inner = el('span', innerCls, word);
    wrap.appendChild(inner);
    target.appendChild(wrap);
    if (i < arr.length - 1) target.appendChild(document.createTextNode(' '));
  });
}

const pad2 = (n) => String(n).padStart(2, '0');
const ICON_PIN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>';

// Build the DOM content for each section from data.js
export function buildSections() {
  buildHeader();
  buildHero();

  // Manifest lines + progress meter
  const manifestContent = document.getElementById('manifest-content');
  const meter = document.getElementById('manifest-meter');
  manifestLines.forEach((l, i) => {
    const p = el('p', 'manifestText', l.text);
    p.id = `manifest-line-${l.id}`;
    manifestContent.appendChild(p);
    const tick = el('span', 'manifestMeter__tick');
    tick.innerHTML = `<span>${pad2(i + 1)}</span>`;
    meter.appendChild(tick);
  });

  buildAbout();
  buildProjects();
  buildJourney();
  buildToolkit();
  buildCertificates();
  buildContact();
}

function buildHeader() {
  document.getElementById('header-logo').innerHTML = logoSVG();
  document.getElementById('preloader-logo').innerHTML = logoSVG();
  document.getElementById('header-name').textContent = site.displayName;
  const navEl = document.getElementById('header-nav');
  const mobileNav = document.getElementById('mobile-nav');
  nav.forEach((item, i) => {
    const a = el('a', 'siteHeader__link');
    a.href = item.target;
    a.dataset.nav = item.target;
    a.dataset.scramble = item.label;
    a.innerHTML = `<span class="siteHeader__linkIdx">${item.index}</span><span class="siteHeader__linkText">${item.label}</span>`;
    navEl.appendChild(a);

    const m = el('a', 'mobileMenu__link');
    m.href = item.target;
    m.dataset.nav = item.target;
    m.style.setProperty('--i', i);
    m.innerHTML = `<span class="mobileMenu__idx">${item.index}</span>${item.label}`;
    mobileNav.appendChild(m);
  });
  const foot = document.getElementById('mobile-foot');
  foot.innerHTML = `
    <a href="mailto:${site.email}">${site.email}</a>
    <a href="${site.linkedin}" target="_blank" rel="noreferrer">LinkedIn &#8599;</a>
    <a href="${site.resume}" download>Résumé &#8595;</a>`;
}

function buildHero() {
  const outline = document.getElementById('hero-title-outline');
  const fill = document.getElementById('hero-title-fill');
  outline.textContent = site.name;
  outline.setAttribute('aria-label', site.displayName);
  fill.textContent = site.name;
  document.getElementById('hero-baseline').textContent = site.baseline;
  const ticker = document.getElementById('hero-ticker');
  ticker.innerHTML = `<span class="heroOverlay__tickerLabel">Currently</span><span class="heroOverlay__tickerWord" id="hero-ticker-word">${site.roles[0]}</span>`;

  // Electric SVG text layers
  document.getElementById('hero-elec').querySelectorAll('text').forEach((t) => {
    t.textContent = site.name;
  });

  const left = document.getElementById('hero-left');
  left.innerHTML = `
    <span class="heroSide__tag">( Portfolio &mdash; 2026 )</span>
    <p class="heroSide__pitch">${site.pitch}</p>
    <span class="heroSide__school">${site.school}</span>`;

  const right = document.getElementById('hero-right');
  right.innerHTML = `
    <span class="heroSide__tag">Based in</span>
    <p class="heroSide__place">${site.location}</p>
    <span class="heroSide__mono">${site.coords}</span>
    <span class="heroSide__mono" data-clock="long"></span>`;

  // Rotating circular badge
  const badge = document.getElementById('hero-badge');
  badge.innerHTML = `
    <svg viewBox="0 0 200 200" class="heroBadge__ring" aria-hidden="true">
      <defs><path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
      <text><textPath href="#badge-circle" textLength="488">${site.badge}</textPath></text>
    </svg>
    <span class="heroBadge__arrow" aria-hidden="true">&#8595;</span>`;
}

function buildProjects() {
  const list = document.getElementById('project-index');
  projects.forEach((p, i) => {
    const li = el('li', 'projectIndex__item');
    const b = el('button', 'projectIndex__btn');
    b.type = 'button';
    b.dataset.index = String(i);
    b.dataset.cursor = 'Jump';
    b.innerHTML = `<span class="projectIndex__num">${pad2(i + 1)}</span><span class="projectIndex__name">${p.name}</span>`;
    li.appendChild(b);
    list.appendChild(li);
  });
}

function buildJourney() {
  splitWords(document.getElementById('journey-title'), journey.title);
  document.getElementById('journey-intro').textContent = journey.intro;
  const list = document.getElementById('journey-entries');
  journey.entries.forEach((e) => {
    const li = el('li', `journeyEntry journeyEntry--${e.kind.toLowerCase()}`);
    li.dataset.year = e.year;
    const points = e.points.length
      ? `<ul class="journeyEntry__points">${e.points.map((p) => `<li>${p}</li>`).join('')}</ul>`
      : '';
    const tags = e.tags.length
      ? `<div class="journeyEntry__tags">${e.tags.map((t) => `<span>${t}</span>`).join('')}</div>`
      : '';
    li.innerHTML = `
      <span class="journeyEntry__dot" aria-hidden="true"></span>
      <div class="journeyEntry__card spotlight">
        <div class="journeyEntry__top">
          <span class="journeyEntry__kind">${e.kind}</span>
          <span class="journeyEntry__period">${e.period}</span>
        </div>
        <h3 class="journeyEntry__role">${e.role}</h3>
        <p class="journeyEntry__org">${e.org}<span> &mdash; ${e.place}</span></p>
        <p class="journeyEntry__lead">${e.lead}</p>
        ${points}
        ${tags}
      </div>`;
    list.appendChild(li);
  });
}

function buildToolkit() {
  splitWords(document.getElementById('toolkit-title'), toolkit.title);
  document.getElementById('toolkit-intro').textContent = toolkit.intro;

  // Skill cards (#pillars) and the five-tabs rows (#tabs-list) are React
  // islands so every tool can carry its logo

  // Two tilted bands; their scroll-velocity text is a React island
  const marquee = document.getElementById('marquee');
  ['a', 'b'].forEach((row) => {
    const band = el('div', `marquee__band marquee__band--${row}`);
    const slot = el('div', 'marquee__slot');
    slot.id = `velocity-${row}`;
    band.appendChild(slot);
    marquee.appendChild(band);
  });

  splitWords(document.getElementById('tabs-title'), toolkit.tabs.title);
}

// Certificates: heading + quick facts here; the stack and gallery are islands
function buildCertificates() {
  splitWords(document.getElementById('certs-title'), certifications.title);
  document.getElementById('certs-intro').textContent = certifications.intro;
  const items = certifications.items;
  const issuers = new Set(items.map((c) => c.issuer));
  const anthropic = items.filter((c) => c.issuer === 'Anthropic').length;
  const facts = [
    [pad2(items.length), 'Certificates'],
    [pad2(issuers.size), 'Issuers'],
    [pad2(anthropic), 'From Anthropic'],
  ];
  document.getElementById('certs-facts').innerHTML = facts
    .map(([n, label]) => `<div><dt>${label}</dt><dd>${n}</dd></div>`)
    .join('');
}

function buildAbout() {
  const left = document.getElementById('about-left');
  const loc = el('p', 'aboutSection__location aboutSection__fade');
  loc.innerHTML = `${ICON_PIN} ${site.location} <span class="aboutSection__locTime" data-clock="short"></span>`;
  left.appendChild(loc);

  about.leadLines.forEach((line) => {
    left.appendChild(el('p', 'aboutSection__line aboutSection__line--lead aboutSection__fade', line));
  });
  about.paragraphs.forEach((para) => {
    left.appendChild(el('p', 'aboutSection__line aboutSection__fade', para));
  });

  left.appendChild(el('div', 'aboutSection__divider aboutSection__fade'));
  left.appendChild(el('p', 'aboutSection__currentlyLabel aboutSection__fade', about.currentlyLabel));

  const list = el('ul', 'aboutSection__currentlyList aboutSection__fade');
  about.currently.forEach(({ key, value }) => {
    const li = el('li', 'aboutSection__currentlyItem');
    li.innerHTML = `<span class="aboutSection__currentlyKey">${key}</span> <span class="aboutSection__currentlyDash">&mdash;</span> <span class="aboutSection__currentlyValue">${value}</span>`;
    list.appendChild(li);
  });
  left.appendChild(list);

  // Cycle the highlighted "currently" item
  const items = list.querySelectorAll('.aboutSection__currentlyItem');
  let active = 0;
  items[active].classList.add('is-active');
  setInterval(() => {
    items[active].classList.remove('is-active');
    active = (active + 1) % items.length;
    items[active].classList.add('is-active');
  }, 2200);
}

function buildContact() {
  document.getElementById('contact-eyebrow').textContent = contact.eyebrow;

  const email = document.getElementById('contact-email');
  email.textContent = site.email;
  email.href = `mailto:${site.email}`;

  const ext = document.getElementById('contact-external');
  const links = [
    { label: 'LinkedIn', url: site.linkedin, arrow: '&#8599;', external: true },
    { label: 'Résumé', url: site.resume, arrow: '&#8595;', download: true },
  ];
  links.forEach(({ label, url, arrow, external, download }) => {
    const a = el('a', 'contactSection__externalLink');
    a.href = url;
    if (external) { a.target = '_blank'; a.rel = 'noreferrer'; }
    if (download) a.setAttribute('download', '');
    a.dataset.cursor = download ? 'Save' : 'Visit';
    a.innerHTML = `${label}<span class="contactSection__externalArrow">${arrow}</span>`;
    ext.appendChild(a);
  });
  const copy = el('button', 'contactSection__externalLink contactSection__copy');
  copy.type = 'button';
  copy.id = 'copy-email';
  copy.dataset.cursor = 'Copy';
  copy.innerHTML = 'Copy email<span class="contactSection__externalArrow">&#10697;</span>';
  ext.appendChild(copy);

  const signature = document.getElementById('contact-signature');
  signature.innerHTML = `<span class="footLogo" aria-hidden="true">${logoSVG()}</span>`;
  signature.appendChild(document.createTextNode(contact.signature));
  document.getElementById('contact-credit').textContent = contact.credit;
}
