// Search and AI-search data, generated from src/data.js at build time so it
// always matches what the site shows. The page itself is drawn by
// JavaScript, which Google runs but most AI crawlers (ChatGPT, Claude,
// Perplexity) do not, so they get three plain versions instead:
//
//   <script type="application/ld+json">  who Muhsin is, what he offers, his
//                                         work, certificates and the FAQ
//   <noscript>                            the whole page as plain text (also
//                                         what visitors without JS see)
//   /llms.txt                             a Markdown summary for AI assistants
import {
  site, about, projects, freelance, journey, certifications, toolkit,
} from '../src/data.js';

const URL_ = site.url.replace(/\/$/, '');
const abs = (path) => (/^https?:/.test(path) ? path : `${URL_}${path.startsWith('/') ? '' : '/'}${path}`);
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (p) => p.url || p.deck || '';
const PERSON = `${URL_}/#person`;

const description =
  'Digital Strategy student and freelance web designer in Mumbai who turns brand strategy into live sites: social media, influencer marketing, SEO, GenAI and websites built with Claude Code.';

function jsonLd() {
  const current = journey.entries.find((e) => /Present/.test(e.period) && e.kind === 'Work');
  const school = journey.entries.find((e) => e.kind === 'Education');
  const graph = [
    {
      '@type': 'Person',
      '@id': PERSON,
      name: site.displayName,
      url: `${URL_}/`,
      image: `${URL_}/about/muhsin-portrait.jpg`,
      jobTitle: current ? current.role : site.role,
      worksFor: current && {
        '@type': 'Organization',
        name: current.org.split(' · ')[0],
      },
      description,
      email: `mailto:${site.email}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
      alumniOf: school && { '@type': 'CollegeOrUniversity', name: school.org },
      knowsAbout: [
        'Digital strategy', 'Influencer marketing', 'Social media marketing', 'Content strategy',
        'SEO', 'Media planning', 'Generative AI', 'Web design', 'Websites built with Claude Code',
      ],
      hasCredential: certifications.items.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        credentialCategory: 'certificate',
        recognizedBy: { '@type': 'Organization', name: c.issuer },
        ...(c.date && !/^valid/i.test(c.date) ? { dateCreated: c.date } : {}),
      })),
      sameAs: [site.linkedin, site.github].filter(Boolean),
      makesOffer: {
        '@type': 'Offer',
        itemOffered: { '@id': `${URL_}/#web-design` },
      },
    },
    {
      '@type': 'Service',
      '@id': `${URL_}/#web-design`,
      name: 'Website design and development',
      serviceType: 'Web design',
      description: `${freelance.intro} Each site launches with link previews, a sitemap, Google Search Console and analytics.`,
      provider: { '@id': PERSON },
      areaServed: [{ '@type': 'City', name: 'Mumbai' }, { '@type': 'Country', name: 'India' }],
      url: `${URL_}/#freelance`,
    },
    {
      '@type': 'WebSite',
      '@id': `${URL_}/#website`,
      url: `${URL_}/`,
      name: site.displayName,
      author: { '@id': PERSON },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'ItemList',
      name: 'Websites and projects',
      itemListElement: [...freelance.items, ...projects].map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: p.name,
          description: p.baseline,
          genre: p.category,
          ...(link(p) ? { url: link(p) } : {}),
          ...(p.image ? { image: abs(p.image) } : {}),
          creator: { '@id': PERSON },
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${URL_}/#faq`,
      mainEntity: freelance.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n    </script>`;
}

function noscript() {
  const li = (p) => {
    const href = link(p);
    const name = href ? `<a href="${esc(href)}">${esc(p.name)}</a>` : esc(p.name);
    const result = p.result ? ` <em>${esc(p.result.value)} ${esc(p.result.label)}.</em>` : '';
    return `<li><strong>${name}</strong> (${esc(p.category)}, ${esc(p.year)}). ${esc(p.baseline)}${result}</li>`;
  };
  return `<noscript>
      <style>
        .preloader, #app > *:not(.noJs) { display: none !important; }
        html.scroll-locked { overflow: auto !important; }
        .noJs { max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; font: 16px/1.6 system-ui, sans-serif; color: #e8e8e8; }
        .noJs a { color: #ff8ccd; }
        .noJs h1, .noJs h2 { line-height: 1.15; color: #fff; }
      </style>
      <main class="noJs">
        <h1>${esc(site.displayName)}: ${esc(site.baseline)}</h1>
        <p>${esc(site.pitch)} ${esc(description)}</p>
        ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <h2>${esc(freelance.title)} Freelance web design</h2>
        <p>${esc(freelance.intro)}</p>
        <ul>${freelance.items.map(li).join('')}</ul>
        <h2>${esc(freelance.faqTitle)}</h2>
        ${freelance.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n        ')}
        <h2>Work</h2>
        <ul>${projects.map(li).join('')}</ul>
        <h2>Experience and education</h2>
        <ul>${journey.entries.map((e) => `<li><strong>${esc(e.role)}</strong>, ${esc(e.org)} (${esc(e.period)}). ${esc(e.lead)}</li>`).join('')}</ul>
        <h2>Certificates</h2>
        <ul>${certifications.items.map((c) => `<li>${esc(c.name)}, ${esc(c.issuer)}${c.date ? ` (${esc(c.date)})` : ''}</li>`).join('')}</ul>
        <h2>Contact</h2>
        <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a> · <a href="${esc(site.linkedin)}">LinkedIn</a> · <a href="${esc(site.resume)}">Résumé (PDF)</a></p>
      </main>
    </noscript>`;
}

export function llmsTxt() {
  const line = (p) => {
    const href = link(p);
    const name = href ? `[${p.name}](${href})` : p.name;
    const result = p.result ? ` Result: ${p.result.value} ${p.result.label}.` : '';
    return `- ${name} (${p.category}, ${p.year}): ${p.baseline}${result}`;
  };
  const tools = toolkit.pillars
    ? toolkit.pillars.flatMap((p) => p.tools || p.items || []).map((t) => t.name || t).filter(Boolean)
    : [];
  return `# ${site.displayName}

> ${description}

${about.paragraphs.join('\n\n')}

- Portfolio: ${URL_}/
- Based in: ${site.location}
- Available for: freelance website design and development, marketing and strategy roles

## Freelance websites

${freelance.intro}

${freelance.items.map(line).join('\n')}

## Questions clients ask

${freelance.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## Work

${projects.map(line).join('\n')}

## Experience and education

${journey.entries.map((e) => `- ${e.role}, ${e.org} (${e.period}): ${e.lead}`).join('\n')}

## Certificates

${certifications.items.map((c) => `- ${c.name}, ${c.issuer}${c.date ? ` (${c.date})` : ''}`).join('\n')}
${tools.length ? `\n## Skills\n\n${[...new Set(tools)].join(', ')}\n` : ''}
## Contact

- Email: ${site.email}
- LinkedIn: ${site.linkedin}
- Résumé (PDF): ${abs(site.resume)}
- Contact form: ${URL_}/#contact
`;
}

export default function seo() {
  return {
    name: 'seo-from-data',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLd())
        .replace('<!-- seo:noscript -->', noscript());
    },
    // dev server answers /llms.txt too
    configureServer(server) {
      server.middlewares.use('/llms.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(llmsTxt());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() });
    },
  };
}
