// ---------------------------------------------------------------
// All site content lives here. Edit this file to personalize.
// ---------------------------------------------------------------

export const site = {
  name: 'Your Name',
  baseline: 'Transforming code into experience',
  location: 'Based in the South of France',
  email: 'hello@your-domain.dev',
  availability: 'Currently available',
  signature: `© ${new Date().getFullYear()} - Designed and developed by Your Name`,
  socials: [
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
    { label: 'GitHub', url: 'https://github.com/' },
  ],
};

// Each manifest line owns a slice of the manifest scroll range [start..end]
// and a target state for the plasma sphere while it is on screen.
export const manifestLines = [
  {
    id: 'blank-canvas',
    text: 'Every experience starts with a blank canvas.',
    start: 0, enterEnd: 0.06, exitStart: 0.19, end: 0.25,
    sphere: { filamentSpeed: 0.05, halo: 0.02, glass: 0.1, dim: 1.0, fogSpeed: 0.1, fogAlpha: 0.1 },
  },
  {
    id: 'code-shaders-intent',
    text: 'I fill it with code, shaders, and intent.',
    start: 0.25, enterEnd: 0.31, exitStart: 0.44, end: 0.5,
    sphere: { filamentSpeed: 0.15, halo: 0.04, glass: 0.02, dim: 0.7, fogSpeed: 0.4, fogAlpha: 0.3 },
  },
  {
    id: 'magic',
    text: 'Some call it magic.',
    start: 0.5, enterEnd: 0.56, exitStart: 0.69, end: 0.75,
    sphere: { filamentSpeed: 0.5, halo: 0.04, glass: 0.02, dim: 0.7, fogSpeed: 0.4, fogAlpha: 0.5 },
  },
  {
    id: 'controlled-engineering',
    text: 'I call it controlled engineering.',
    start: 0.75, enterEnd: 0.81, exitStart: 0.94, end: 1,
    sphere: { filamentSpeed: 1.0, halo: 1.0, glass: 0.2, dim: 0.0, fogSpeed: 1.3, fogAlpha: 0.8 },
  },
];

export const projects = [
  {
    slug: 'vending-machine',
    name: 'Vending Machine',
    baseline: 'Smart connected system bridging physical and digital experience',
    concept:
      'A connected vending machine that links a physical interface with a live digital layer, turning a simple purchase into an interactive moment.',
    stack: 'React, Three.js, Node.js',
    role: 'Design & Development',
    url: '#',
  },
  {
    slug: 'manny',
    name: 'Manny',
    baseline: 'Crafting a refined e-commerce experience for independent ceramic artists',
    concept:
      'A boutique e-commerce experience built around the texture and quiet of handmade ceramics, where the interface steps back and the craft leads.',
    stack: 'React, GSAP, Shopify',
    role: 'Design & Development',
    url: '#',
  },
  {
    slug: 'yvent',
    name: 'Yvent',
    baseline: 'Centralizing campus life into one mobile application',
    concept:
      'One mobile home for every campus event: discovery, tickets and community in a single feed designed for students on the move.',
    stack: 'React Native, Firebase',
    role: 'Front-End Development',
    url: '#',
  },
  {
    slug: 'my-portfolio',
    name: 'My portfolio',
    baseline: 'Some call it magic. I call it controlled engineering',
    concept:
      'A WebGL plasma sphere as the single thread of a narrative portfolio: one object, one journey, every section a different state of the same energy.',
    stack: 'Three.js, GSAP, GLSL',
    role: 'Everything',
    url: '#',
  },
];

export const services = {
  quote: "You don't tell people your standard. You show it.",
  tagline:
    'I build custom websites for brands that refuse to look like everyone else. No templates. No shortcuts. Just precise, handcrafted visual experiences.',
};

export const about = {
  leadLines: ["I didn't start in design.", 'I started in C.'],
  paragraphs: [
    'Years of building invisible systems taught me to obsess over the visible ones. The day I realized a website could be felt rather than merely used, everything changed: color, hierarchy, motion and tension became a language worth learning.',
    "That is still what drives me - an engineer who fell for the visual, a problem-solver who discovered that some problems are beautiful.",
  ],
  currentlyLabel: 'Currently',
  currently: [
    { key: 'Listening', value: 'Your favorite record' },
    { key: 'Watching', value: 'NBA Playoffs' },
    { key: 'Playing', value: 'Your favorite game' },
  ],
};

export const contact = {
  title: 'Make Contact.',
};
