// ---------------------------------------------------------------
// All site content lives here. Edit this file to personalize.
// Sources: resume (Oct 2026), LinkedIn profile + posts, previous
// portfolio (muhsin-portfolio-ten.vercel.app).
// ---------------------------------------------------------------

export const site = {
  name: 'MUHSIN GIGANI',
  displayName: 'Muhsin Gigani',
  role: 'Digital Strategy Student',
  baseline: 'Marketing + Vibe Coding',
  pitch: 'I turn brand strategy into live sites, start to ship.',
  school: 'Digital Strategy @ Jai Hind College',
  location: 'Mumbai, India',
  coords: '19.07° N, 72.87° E',
  timezone: 'Asia/Kolkata',
  email: 'mdmuhsingigani9@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhsin-gigani',
  resume: '/Muhsin_Gigani_Resume.pdf',
  roles: ['Strategist', 'Marketer', 'Vibe Coder', 'Brand Nerd', 'Night Owl'],
  badge: 'MARKETING + VIBE CODING • START TO SHIP • ',
};

export const nav = [
  { label: 'About', target: '#about', index: '02' },
  { label: 'Journey', target: '#journey', index: '03' },
  { label: 'Work', target: '#projects', index: '04' },
  { label: 'Toolkit', target: '#toolkit', index: '05' },
  { label: 'Certificates', target: '#certificates', index: '06' },
  { label: 'Contact', target: '#contact', index: '07' },
];

// Each manifest line owns a slice of the manifest scroll range [start..end]
// and a target state for the plasma sphere while it is on screen.
export const manifestLines = [
  {
    id: 'student',
    text: "I'm a marketing student.",
    start: 0, enterEnd: 0.06, exitStart: 0.19, end: 0.25,
    sphere: { filamentSpeed: 0.05, halo: 0.02, glass: 0.1, dim: 1.0, fogSpeed: 0.1, fogAlpha: 0.1 },
  },
  {
    id: 'tabs',
    text: "I didn't learn to code. I learned which tabs to open.",
    start: 0.25, enterEnd: 0.31, exitStart: 0.44, end: 0.5,
    sphere: { filamentSpeed: 0.15, halo: 0.04, glass: 0.02, dim: 0.7, fogSpeed: 0.4, fogAlpha: 0.3 },
  },
  {
    id: 'vibe',
    text: 'Some call it vibe coding.',
    start: 0.5, enterEnd: 0.56, exitStart: 0.69, end: 0.75,
    sphere: { filamentSpeed: 0.5, halo: 0.04, glass: 0.02, dim: 0.7, fogSpeed: 0.4, fogAlpha: 0.5 },
  },
  {
    id: 'ships',
    text: 'I call it strategy that ships.',
    start: 0.75, enterEnd: 0.81, exitStart: 0.94, end: 1,
    sphere: { filamentSpeed: 1.0, halo: 1.0, glass: 0.2, dim: 0.0, fogSpeed: 1.3, fogAlpha: 0.8 },
  },
];

// `url` is a live site (embedded in the case study), `deck` a presentation
// link that only gets a button. `dive` is the colour of the world inside the
// orb while the project is on
// screen, `accent` drives the UI highlights for that project.
export const projects = [
  {
    slug: 'nacar',
    image: '/work/nacar.webp',
    name: 'Nácar',
    category: 'Brand concept + Web build',
    year: '2026',
    timeframe: '3 days',
    baseline: "An Apple-style launch site for a luxury tech brand that doesn't exist.",
    concept:
      'A made-up luxury tech line where every device carries real mother-of-pearl: Faro the phone, Pulso the watch, Onda the earbuds. One idea per screen, the product shown in real life, noise cancelling drawn as a sound wave, and a last line about the material instead of the specs.',
    highlights: [
      'Seven pages: landing, three product pages, compare, a configurator with live price and EMI, and support.',
      'Scroll-driven motion: the phone turns, the watch face follows the health cards, the earbud comes apart.',
      'Every product render generated with Nano Banana. None of these devices are real.',
    ],
    stack: 'Claude Code · Nano Banana · Vercel',
    role: 'Brand, art direction & build',
    url: 'https://nacar-iota.vercel.app/',
    result: { value: '3 days', label: 'from idea to a live 7-page launch site' },
    accent: '#e7defa',
    dive: '#191a3c',
  },
  {
    slug: 'second-nature',
    image: '/work/second-nature.webp',
    name: 'Second Nature',
    category: 'Field study → Website',
    year: '2026',
    timeframe: '12 hours',
    baseline: "NMACC's Art House, rebuilt as a site you walk through instead of read.",
    concept:
      'The brief was to observe luxury beyond the product. The exhibition turns you into a participant instead of a viewer, so the presentation had to do the same. You do not click through it. You walk through it. Nobody assigned the website.',
    highlights: [
      'Hallway, four levels and nine installations, in the exact order we walked them, with a meter showing how far you have climbed.',
      'Each level is coloured from the photos we took on that floor: teamLab is navy and violet, Level 3 is paper and ink.',
      'Field notes sit apart from research. A work we never photographed is labelled "not photographed" and written up anyway.',
    ],
    stack: 'Next.js · Claude Code · Vercel',
    role: 'Concept & build, team of five',
    url: 'https://nmacc-second-nature.vercel.app',
    result: { value: '12 hrs', label: 'to build a walk-through of 9 installations, team of five' },
    caseStudy: {
      problem: "The brief was to observe luxury beyond the product at NMACC's Art House, where the exhibition makes you a participant instead of a viewer. A slide deck would have turned the audience back into viewers.",
      did: 'Built a website nobody assigned: the hallway, four levels and nine installations in the order we walked them, each level coloured from the photos we took on that floor, with field notes kept apart from research.',
      result: 'Built in 12 hours by a team of five. You walk through the visit instead of reading about it.',
    },
    accent: '#9d8cff',
    dive: '#16113f',
  },
  {
    slug: 'croc-it',
    image: '/work/croc-it.webp',
    name: 'CROC IT',
    category: 'Integrated media strategy',
    year: '2026',
    timeframe: 'Diwali 2026',
    baseline: 'Crocs × Jutis: a Diwali product idea with a full ₹1.25 Cr media plan.',
    concept:
      'Most brands treat a festival as an ad problem. We treated this one as a product problem. Crocs sells in India; it just has nothing to say at Indian occasions. So we designed something that does, and once the product belonged in the room, the media plan stopped being a costume and became a rollout.',
    highlights: [
      'Crocs × Jutis: a juti with Crocs DNA, made to be worn with a lehenga, saree, kurta or sherwani.',
      'A Mumbai-led ₹1.25 Cr plan across influencer, OTT & cinema, OOH & print, performance, PR, retail and CRM.',
      'Built on the calendar: shoes are picked 3–10 days after the outfit, so Crocs had to show up in Navratri, not just Diwali.',
    ],
    stack: 'Brand strategy · Media planning · AI-visualised creative',
    role: 'Strategy & media planning, team of eight',
    result: { value: '₹1.25 Cr', label: 'Diwali media plan across 7 channels' },
    caseStudy: {
      problem: 'Crocs sells in India but has nothing to say at Indian occasions. A Diwali ad on its own would have been a costume.',
      did: 'With a team of eight, designed Crocs × Jutis, a juti with Crocs DNA made to be worn with a lehenga, saree, kurta or sherwani. Then planned the media around how people shop: shoes are picked 3–10 days after the outfit, so the plan starts at Navratri.',
      result: 'A Mumbai-led ₹1.25 Cr rollout across influencer, OTT & cinema, OOH & print, performance, PR, retail and CRM.',
    },
    url: '',
    accent: '#ffb547',
    dive: '#2b1503',
  },
  {
    slug: 'gillette',
    image: '/work/gillette.webp',
    name: 'Gillette Rebrand',
    category: 'Rebranding strategy',
    year: '2025',
    timeframe: 'Solo assignment',
    baseline: 'A rebrand for Gillette, from logo system to billboard: "Redefining the Perfect Shave."',
    concept:
      "A full identity refresh for a brand that is over a century old. I traced how the logo evolved since 1901, then built a new G monogram, a tagline and a mini brand guideline, and pushed it through every touchpoint a real rollout would need.",
    highlights: [
      'A logo system: G monogram icon, main logo and monochrome version, with the tagline "Redefining the Perfect Shave".',
      'Applied to letterhead, visiting card, paid and organic social ads, poster, landing page, billboard, bus stop, merch and a guerrilla idea.',
      'A mini brand guideline: logo usage, type pairing, a blue-and-silver palette, image style, do and don\'t rules and tone of voice.',
    ],
    stack: 'Brand identity · Campaign design · Guidelines',
    role: 'Strategy, identity and design, solo',
    result: { value: '10', label: 'brand touchpoints from one new logo system' },
    url: '',
    deck: 'https://www.canva.com/design/DAG1G6JP2-o/O4uunr6v-_vflsQEtVPw3w/edit',
    accent: '#2ec7ff',
    dive: '#001e3c',
  },
  {
    slug: 'fifa-26',
    image: '/work/fifa-26.webp',
    name: 'World Cup 26',
    category: 'Web build',
    year: '2026',
    timeframe: 'Live before kick-off',
    baseline: 'The whole tournament as a website: 48 teams, 104 matches, 16 host cities.',
    concept:
      'Matchday is sacred. So for the biggest World Cup ever, the whole tournament got its own site: live scores, fixtures you can push straight to your calendar, and a 3D match ball you can spin. It went live the day before the opening match.',
    highlights: [
      '48 teams, 104 matches and 16 host cities in one place.',
      'Live scores, and fixtures you can add to your calendar in a tap.',
      'A 3D match ball you can spin. Shipped the day before the opening match.',
    ],
    stack: 'AI-built · 3D · Vercel',
    role: 'Concept & build',
    url: 'https://fifa-worldcup-26.vercel.app',
    result: { value: '104', label: 'matches live, shipped the day before kick-off' },
    accent: '#4ce39a',
    dive: '#04261a',
  },
  {
    slug: 'soezi-social',
    image: '/work/soezi-social.webp',
    name: 'Soezi Social',
    category: 'Organic social strategy',
    year: '2025',
    timeframe: 'Zero paid spend',
    baseline: "An organic social plan for Sonakshi Sinha's press-on nail brand, built without a paid budget.",
    concept:
      'Soezi sells salon-quality press-on nails online. I started with the brand itself: who buys, why, and where they scroll. Then I built a Diwali content strategy in three layers: one hero campaign, a weekly hub series and an evergreen hygiene library.',
    highlights: [
      'Brand analysis: SWOT, buyer persona, pen portrait and a customer journey from Instagram reel to checkout.',
      'Hero: #SoeziShinesThisDiwali, a limited "Diwali Dazzle" box and a casual-to-festive transformation film in under five minutes.',
      'Hub and hygiene: #MyFestiveSet, a weekly "nails to match your outfit" series with GRWM creators and a UGC contest, plus searchable how-tos.',
    ],
    stack: 'Brand analysis · Content strategy · Hero, Hub, Hygiene',
    role: 'Analysis and content strategy, solo',
    result: { value: '₹0', label: 'paid spend: a hero, hub and hygiene Diwali plan' },
    url: '',
    deck: 'https://www.canva.com/design/DAGy1qC8_wg/HyDEBNbQntU3UzOAVu8WpQ/edit',
    accent: '#ff6fae',
    dive: '#2a0716',
  },
  {
    slug: 'civiclens',
    image: '/work/civiclens.webp',
    name: 'CivicLens',
    category: 'AI agents · Civic tech',
    year: '2026',
    timeframe: '~15 sec per complaint',
    baseline: 'One photo of a civic problem becomes a formal complaint in about 15 seconds.',
    concept:
      'Filing one pothole complaint on the BMC portal took us over five minutes: OTP, ward dropdown, a location that would not load. Three tries, zero complaints filed. CivicLens turns a single photo into a formal complaint, drafted for the right department.',
    highlights: [
      'Four AI agents, one job each: Vision Inspector, Triage Officer, Complaint Writer and Checker.',
      "A summary in the citizen's own language: Hindi, Marathi or Gujarati.",
      'Nothing sends itself. Every complaint lands as a Gmail draft and a person presses Send.',
    ],
    stack: 'Make · Gemini · Gmail',
    role: 'Built the Make scenario and form trigger, team of six',
    result: { value: '~15 sec', label: 'per complaint, down from 5+ min on the BMC portal' },
    caseStudy: {
      problem: 'Filing one pothole complaint on the BMC portal took over five minutes: OTP, a ward dropdown, a location that would not load. Three tries, zero complaints filed.',
      did: 'Built the Make scenario and form trigger for a pipeline of four Gemini agents with one job each: Vision Inspector, Triage Officer, Complaint Writer and Checker. Team of six.',
      result: 'One photo becomes a formal complaint for the right department in about 15 seconds, with a summary in Hindi, Marathi or Gujarati. It lands as a Gmail draft, so a person still presses Send.',
    },
    url: '',
    accent: '#53d6ff',
    dive: '#03203a',
  },
  {
    slug: 'soezi-seo',
    image: '/work/soezi-seo.webp',
    name: 'Soezi SEO',
    category: 'SEO strategy · Virtual internship',
    year: '2025',
    timeframe: 'Apr – May 2025',
    baseline: "An SEO audit and six-month plan for soezi.in, from Jai Hind College's SEO virtual internship.",
    concept:
      'An SEO-based virtual internship run in phases, each one graded before moving on. We audited soezi.in, mapped its competitors and wrote the plan to fix it: on-page, off-page and technical, scheduled into an SEO calendar.',
    highlights: [
      'An Ubersuggest audit: slow mobile pages, missing meta titles and schema, thin keyword targeting and a weak backlink profile.',
      'The fixes: keyword-led titles and H1s, alt-texted imagery, 48px tap targets, a complete sitemap and redirect clean-up.',
      'Six-month targets: domain authority 15 → 35+, 3x organic traffic, 45+ first-page keywords, mobile score 65% → 90%+.',
    ],
    stack: 'Ubersuggest · Keyword research · Technical SEO',
    role: 'SEO research and strategy, team of five',
    result: { value: '3×', label: 'organic traffic target in a six-month SEO plan' },
    url: '',
    deck: 'https://www.canva.com/design/DAGoYEJmN0o/TxzTTYi-jlKrObarI1XOSw/edit',
    accent: '#9fb4ff',
    dive: '#141a3a',
  },
  {
    slug: 'aura',
    image: '/work/aura.webp',
    name: 'Aura Coffee',
    category: 'Brand + E-commerce build',
    year: '2026',
    timeframe: 'Solo build',
    baseline: 'A 3D coffee brand, built solo. The first thing I ever shipped.',
    concept:
      'A brand rooted in ritual, with a storefront to match: 3D scroll storytelling up front and a real product behind it. Not a mockup with a fake login button, but a shop that actually works.',
    highlights: [
      '10+ pages: shop, brewing guides and a taste-match quiz that finds your roast.',
      'A 3-tier rewards system with working points and redemption.',
      'Firebase runs the logins, so it is a product, not a picture of one.',
    ],
    stack: 'Antigravity · Firebase · Vercel',
    role: 'Brand & build, solo',
    url: 'https://aura-j1lh.vercel.app',
    result: { value: '10+', label: 'pages with a working shop, quiz and rewards' },
    accent: '#e0a56b',
    dive: '#2a1508',
  },
  {
    slug: 'dayflow',
    image: '/work/dayflow.svg',
    name: 'DayFlow',
    category: 'Web app',
    year: '2026',
    timeframe: 'Built past midnight',
    baseline: 'A day planner, and the first web app I ever built.',
    concept:
      'An internal assessment gave me a deadline. The late nights gave me the app. The first time I opened an AI IDE, I described a screen and it showed up, and I kept refreshing localhost like it would vanish if I looked away.',
    highlights: [
      'Plans for today or tomorrow with priority, reminders and a progress ring that fills as you tick them off.',
      'Week and month calendar views, plus a mood check-in before you start your day.',
      'Light and dark modes, your own accent colour, and a real login and backend behind all of it.',
    ],
    stack: 'Cursor · React Bits',
    result: { value: 'App #1', label: 'my first web app, with a real login and backend' },
    role: 'Design & build',
    url: '',
    accent: '#7fb8ff',
    dive: '#0a1d4a',
  },
];

export const journey = {
  title: 'The Journey',
  intro: 'From e-commerce content to agency dashboards to deployed sites. Every role taught me one more step between idea and launch.',
  entries: [
    {
      kind: 'Work',
      period: 'May 2026 – Sep 2026',
      year: '2026',
      role: 'Solutions Strategist Intern',
      org: 'Django · Digital Agency',
      place: 'Mumbai',
      logo: { src: '/journey/django.png', bg: '#0b0b0b', glow: '#ff6a2b', fit: 'wide' },
      lead: 'On the Solutions team running Pluro, a fertility care platform scaling to 100+ clinics, in a category where tone and accuracy matter more than reach.',
      points: [
        'Ran day-to-day social across 6 accounts on Instagram, LinkedIn, Facebook and YouTube: calendars, creative direction, copy and scheduling.',
        "Owned monthly dashboards and metric decks on reach, engagement and follower growth, and next month's plan.",
        'Handled client servicing directly with Pluro; used AI to draft decks and reports so all six accounts shipped on time.',
      ],
      tags: ['Social media', 'Reporting', 'Client servicing', 'Healthcare'],
    },
    {
      kind: 'Leadership',
      period: 'Sep 2025 – Feb 2026',
      year: '2025',
      role: 'Head of Department, Executions',
      org: 'Talaash · A Jai Hind BMS Initiative',
      place: 'Mumbai',
      logo: { src: '/journey/talaash.png', bg: '#ffffff', glow: '#1f9be8', fit: 'bleed' },
      lead: "Jai Hind College's flagship BMS festival, drawing 1,000+ students from colleges across Mumbai.",
      points: [
        'Led a 25-member execution team across 3 pre-events and the main day.',
        'Held a ₹2–3 lakh budget across vendors, equipment and setup, and delivered the festival inside it.',
        'The main event lost power mid-run. Got it back on schedule without cancelling a single segment.',
      ],
      tags: ['Event production', 'Budgeting', 'Team leadership'],
    },
    {
      kind: 'Leadership',
      period: 'Dec 2024 – Jun 2025',
      year: '2024',
      role: 'Head of Department, Marketing',
      org: 'Jai Hind College Digital Nexus',
      place: 'Mumbai',
      logo: { src: '/journey/digital-nexus.png', bg: '#000000', glow: '#ff3d8b', fit: 'wide' },
      lead: "The college's student-run digital and technology initiative.",
      points: [
        'Closed 8 corporate sponsors, including Rio and Mexibay, from 100+ companies pitched, lead to signature.',
        'Ran a zero-paid-spend Instagram campaign aimed at the Mumbai college circuit.',
        'Built the pitch template and outreach tracker the whole team worked from.',
      ],
      tags: ['Sponsorships', 'Instagram', 'Outreach'],
    },
    {
      kind: 'Work',
      period: '2025',
      year: '2025',
      role: 'Social Media Manager',
      org: 'Toy Kingdom Online',
      place: 'E-commerce',
      logo: { src: '/journey/toy-kingdom.png', bg: '#ffffff', glow: '#e89a28', fit: 'bleed' },
      lead: 'Content and promotions for an e-commerce brand.',
      points: [
        'Created engaging content and promotional designs for social platforms.',
        'Kept one consistent brand identity across every campaign.',
      ],
      tags: ['Content', 'E-commerce', 'Design'],
    },
    {
      kind: 'Education',
      period: '2024 – Present',
      year: '2024',
      role: "Bachelor's in Digital Strategy",
      org: 'Jai Hind College',
      place: 'Mumbai',
      logo: { src: '/journey/jai-hind-college.png', bg: '#ffffff', glow: '#3d5bd9' },
      lead: 'Where marketing, technology and creativity meet: campaigns, brand building, media planning and AI strategy.',
      points: [],
      tags: ['Media planning', 'AI strategy', 'Brand'],
    },
    {
      kind: 'Education',
      period: '2012 – 2022',
      year: '2012',
      role: 'Schooling',
      org: "St. Xavier's Boys' Academy",
      place: 'Mumbai',
      logo: { src: '/journey/sxba.png', bg: '#ffffff', glow: '#e23b3b' },
      lead: 'Early interests in communication, leadership and creative thinking.',
      points: [],
      tags: [],
    },
  ],
};


export const toolkit = {
  title: 'The Toolkit',
  intro: 'One brain for strategy, one for building, one for making it look right.',
  pillars: [
    {
      name: 'Marketing',
      index: '01',
      items: ['Social media marketing & SMO', 'Content strategy', 'SEO & AI search', 'Google Ads', 'Reporting & dashboards', 'Market research', 'Client servicing', 'Sponsorships'],
    },
    {
      name: 'Build & AI',
      index: '02',
      items: ['Claude Code', 'Claude Cowork', 'MCP', 'Prompt engineering', 'Cursor', 'Antigravity', 'Next.js', 'Firebase', 'Vercel', 'GitHub', 'WordPress', 'Zapier'],
    },
    {
      name: 'Creative',
      index: '03',
      items: ['Canva', 'Nano Banana', 'Google Flow', 'Whisk', 'Pomelli', 'Mixboard', 'Gamma', 'React Bits'],
    },
  ],
  // Logo + brand colour per tool. `icon` is a react-icons name. Tools with no
  // public icon get a letter badge (`mono`) rather than an invented logo, and
  // black-on-white brands are shown white so they read on the dark page.
  // Marketing skills are disciplines, not products, so they get line icons.
  brands: {
    'Claude Code': { icon: 'SiClaudecode', color: '#D97757' },
    'Claude Cowork': { icon: 'SiClaude', color: '#D97757' },
    MCP: { icon: 'SiModelcontextprotocol', color: '#ffffff' },
    'Prompt engineering': { icon: 'LuSparkles', color: '#c6a6ff' },
    Cursor: { icon: 'SiCursor', color: '#ffffff' },
    Antigravity: { mono: 'A', gradient: ['#4285F4', '#9B72CB'] },
    'Next.js': { icon: 'SiNextdotjs', color: '#ffffff' },
    React: { icon: 'SiReact', color: '#61DAFB' },
    Firebase: { icon: 'SiFirebase', color: '#FFA611' },
    Supabase: { icon: 'SiSupabase', color: '#3FCF8E' },
    Vercel: { icon: 'SiVercel', color: '#ffffff' },
    GitHub: { icon: 'SiGithub', color: '#ffffff' },
    WordPress: { icon: 'SiWordpress', color: '#3D9BD8' },
    Zapier: { icon: 'SiZapier', color: '#FF4F00' },
    Make: { icon: 'SiMake', color: '#A35CFF' },
    Gemini: { icon: 'SiGooglegemini', gradient: ['#4796E3', '#9177C7', '#CA6673'] },
    'Google Ads': { icon: 'SiGoogleads', gradient: ['#FBBC04', '#4285F4'] },
    Semrush: { icon: 'SiSemrush', color: '#FF642D' },
    'Three.js': { icon: 'SiThreedotjs', color: '#ffffff' },
    GSAP: { icon: 'SiGsap', color: '#0AE448' },
    Canva: { mono: 'C', gradient: ['#00C4CC', '#7D2AE8'] },
    'Nano Banana': { icon: 'LuBanana', color: '#FFD54A' },
    'Google Flow': { mono: 'F', gradient: ['#4285F4', '#34A853'] },
    Whisk: { mono: 'W', gradient: ['#FBBC04', '#EA4335'] },
    Pomelli: { mono: 'P', gradient: ['#EA4335', '#FBBC04'] },
    Mixboard: { mono: 'M', gradient: ['#34A853', '#4285F4'] },
    Gamma: { mono: 'G', gradient: ['#7B61FF', '#E066FF'] },
    'React Bits': { icon: 'SiReact', color: '#7C5CFF' },
    'Social media marketing & SMO': { icon: 'LuMegaphone', color: '#ff8ccd' },
    'Content strategy': { icon: 'LuNotebookPen', color: '#ff8ccd' },
    'SEO & AI search': { icon: 'LuSearchCheck', color: '#ff8ccd' },
    'Reporting & dashboards': { icon: 'LuChartColumn', color: '#ff8ccd' },
    'Market research': { icon: 'LuTelescope', color: '#ff8ccd' },
    'Client servicing': { icon: 'LuHandshake', color: '#ff8ccd' },
    Sponsorships: { icon: 'LuHandCoins', color: '#ff8ccd' },
    // certificate issuers
    Anthropic: { icon: 'SiAnthropic', color: '#f0eee6' },
    Simplilearn: { mono: 'S', gradient: ['#F7941D', '#1E88E5'] },
    upGrad: { mono: 'u', gradient: ['#E7233A', '#B5121B'] },
  },
  // tools in the scrolling logo strip, in order
  loop: [
    'Claude Code', 'Cursor', 'Next.js', 'React', 'Firebase', 'Supabase', 'Vercel', 'GitHub', 'MCP',
    'Make', 'Zapier', 'WordPress', 'Gemini', 'Google Ads', 'Semrush', 'Nano Banana', 'Three.js', 'GSAP',
  ],
  marqueeA: ['Claude Code', 'Cursor', 'Antigravity', 'Next.js', 'Firebase', 'Vercel', 'MCP', 'GitHub', 'Zapier', 'WordPress'],
  marqueeB: ['Nano Banana', 'Canva', 'Google Flow', 'Whisk', 'Pomelli', 'Mixboard', 'Gamma', 'React Bits', 'Semrush', 'Google Ads'],
  // "I did not learn to code. I learned which five tabs to open."
  tabs: {
    title: 'Deck to URL, in five tabs.',
    steps: [
      { tool: 'Claude Code', line: 'Writes the site.', detail: 'Not snippets. It reads the whole project, builds the page, runs it, and keeps working through its own errors.' },
      { tool: 'React Bits', line: 'Stops it looking AI-generated.', detail: 'Code that works and code that looks designed are not the same thing.' },
      { tool: 'Nano Banana', line: 'Fills the image slots.', detail: 'It keeps the same subject across every generation, so the visuals hold one look instead of five.' },
      { tool: 'Firebase', line: 'Turns a mockup into a product.', detail: 'A fake login button is visible from across the room.' },
      { tool: 'Vercel', line: 'Gives it a URL.', detail: 'Nobody in the world can open localhost.' },
    ],
  },
  languages: [
    { name: 'English', level: 'Professional' },
    { name: 'Hindi', level: 'Native' },
  ],
};

// Each certificate has /certificates/<slug>.jpg (full), <slug>-thumb.jpg
// and the original <slug>.pdf in public/.
export const certifications = {
  title: 'Certified.',
  intro: 'Twelve certificates, six of them from Anthropic. Every one is here, and every one opens.',
  items: [
    { slug: 'anthropic-ai-fluency-framework', name: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', date: 'Sep 2026' },
    { slug: 'anthropic-claude-code-in-action', name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Aug 2026' },
    { slug: 'anthropic-claude-code-101', name: 'Claude Code 101', issuer: 'Anthropic', date: 'May 2026' },
    { slug: 'anthropic-claude-cowork', name: 'Introduction to Claude Cowork', issuer: 'Anthropic', date: 'May 2026' },
    { slug: 'anthropic-claude-101', name: 'Claude 101', issuer: 'Anthropic', date: 'Apr 2026' },
    { slug: 'anthropic-ai-fluency-students', name: 'AI Fluency for Students', issuer: 'Anthropic', date: 'Apr 2026' },
    { slug: 'canva-ai-skills-students', name: 'AI Skills for Students', issuer: 'Canva', date: 'Aug 2026' },
    { slug: 'canva-marketing-with-canva', name: 'Marketing with Canva', issuer: 'Canva', date: 'Jun 2026' },
    { slug: 'semrush-ai-search-os', name: 'AI Search Operating System', issuer: 'Semrush', date: 'Valid to May 2027' },
    { slug: 'simplilearn-chatgpt-101', name: 'ChatGPT 101', issuer: 'Simplilearn', date: 'May 2026' },
    { slug: 'upgrad-chatgpt-digital-marketing', name: 'ChatGPT for Digital Marketing', issuer: 'upGrad', date: 'May 2026' },
    { slug: 'upgrad-intro-generative-ai', name: 'Introduction to Generative AI', issuer: 'upGrad', date: 'May 2026' },
  ],
};

export const about = {
  leadLines: ['Strategist by training.', 'Builder after midnight.'],
  paragraphs: [
    "I'm Muhsin, a Digital Strategy student at Jai Hind College in Mumbai. Marketing was never just numbers for me. It's the right message, for the right audience, at the right moment, and lately, the website it lives on.",
    "I'm not a developer. I give the direction, AI writes the code, and I don't stop until there's a URL. Most of it gets built past midnight, when the house is quiet and nobody expects anything from you.",
  ],
  currentlyLabel: 'Currently',
  currently: [
    { key: 'Studying', value: 'Digital Strategy, Jai Hind College' },
    { key: 'Building', value: 'Sites with Claude Code' },
    { key: 'Watching', value: 'Matchday. Always.' },
    { key: 'Noticing', value: 'Every logo, palette and ad line' },
  ],
};

export const contact = {
  eyebrow: 'Got a brand, a brief or a wild idea?',
  title: "Let's ship it.",
  signature: `© ${new Date().getFullYear()} Muhsin Gigani. Strategy, start to ship.`,
  credit: 'Built with Claude Code, Three.js & late nights.',
  // The form posts straight into the Google Form "Portfolio Contact
  // (website)"; responses land in its Responses tab.
  form: {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSfETE_yq_kVP_G7ziP45b73uGn6nfddrXOEgVb4IW9OnJLkNA/formResponse',
    entries: {
      name: 'entry.1276727198',
      email: 'entry.2840079',
      topic: 'entry.519969315',
      message: 'entry.195256657',
    },
    // must match the Google Form's choices letter for letter
    topics: ['Internship or job', 'Freelance project', 'Collaboration', 'Just saying hi'],
  },
};
