import { site, manifestLines, services, about, contact } from './data.js';

// Build the DOM content for each section from data.js
export function buildSections() {
  // Hero
  const outline = document.getElementById('hero-title-outline');
  const fill = document.getElementById('hero-title-fill');
  const baseline = document.getElementById('hero-baseline');
  outline.textContent = site.name;
  fill.textContent = site.name;
  baseline.textContent = site.baseline;

  // Electric SVG text layers
  const elec = document.getElementById('hero-elec');
  elec.querySelectorAll('text').forEach((t) => {
    t.textContent = site.name;
  });

  // Manifest lines
  const manifestContent = document.getElementById('manifest-content');
  manifestLines.forEach((l) => {
    const p = document.createElement('p');
    p.className = 'manifestText';
    p.id = `manifest-line-${l.id}`;
    p.textContent = l.text;
    manifestContent.appendChild(p);
  });

  // Services quote/tagline split into word spans
  const quote = document.getElementById('services-quote');
  services.quote.split(' ').forEach((word) => {
    const wrap = document.createElement('span');
    wrap.className = 'servicesSection__quoteWordWrapper';
    const inner = document.createElement('span');
    inner.className = 'servicesSection__quoteWord';
    inner.textContent = word;
    wrap.appendChild(inner);
    quote.appendChild(wrap);
    quote.appendChild(document.createTextNode(' '));
  });
  const tagline = document.getElementById('services-tagline');
  services.tagline.split(' ').forEach((word) => {
    const wrap = document.createElement('span');
    wrap.className = 'servicesSection__taglineWordWrapper';
    const inner = document.createElement('span');
    inner.className = 'servicesSection__taglineWord';
    inner.textContent = word;
    wrap.appendChild(inner);
    tagline.appendChild(wrap);
    tagline.appendChild(document.createTextNode(' '));
  });

  // About
  const left = document.getElementById('about-left');
  const loc = document.createElement('p');
  loc.className = 'aboutSection__location aboutSection__fade';
  loc.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg> ${site.location}`;
  left.appendChild(loc);

  about.leadLines.forEach((line) => {
    const h = document.createElement('p');
    h.className = 'aboutSection__line aboutSection__line--lead aboutSection__fade';
    h.textContent = line;
    left.appendChild(h);
  });
  about.paragraphs.forEach((para) => {
    const p = document.createElement('p');
    p.className = 'aboutSection__line aboutSection__fade';
    p.textContent = para;
    left.appendChild(p);
  });

  const divider = document.createElement('div');
  divider.className = 'aboutSection__divider aboutSection__fade';
  left.appendChild(divider);

  const curLabel = document.createElement('p');
  curLabel.className = 'aboutSection__currentlyLabel aboutSection__fade';
  curLabel.textContent = about.currentlyLabel;
  left.appendChild(curLabel);

  const list = document.createElement('ul');
  list.className = 'aboutSection__currentlyList aboutSection__fade';
  about.currently.forEach(({ key, value }) => {
    const li = document.createElement('li');
    li.className = 'aboutSection__currentlyItem';
    li.innerHTML = `<span class="aboutSection__currentlyKey">${key}</span> <span class="aboutSection__currentlyDash">-</span> <span class="aboutSection__currentlyValue">${value}</span>`;
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

  // Contact
  document.getElementById('contact-availability').textContent = site.availability;
  document.getElementById('contact-title').textContent = contact.title;
  const email = document.getElementById('contact-email');
  email.textContent = site.email;
  email.href = `mailto:${site.email}`;
  const ext = document.getElementById('contact-external');
  site.socials.forEach(({ label, url }) => {
    const a = document.createElement('a');
    a.className = 'contactSection__externalLink';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.innerHTML = `${label}<span class="contactSection__externalArrow">&#8599;</span>`;
    ext.appendChild(a);
  });
  document.getElementById('contact-signature').textContent = site.signature;
}
