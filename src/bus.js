// Tiny shared store between the vanilla scroll engine and the React islands.
// Snapshots are replaced (never mutated) so useSyncExternalStore can compare them.
let state = {
  project: 0,            // index of the project inside the core
  projectsActive: false, // true while the carousel is on screen
  year: '2026',          // journey year under the reading line
  cert: null,            // index of the certificate open in the viewer
  section: '00',         // data-index of the section under the reading line
};
const listeners = new Set();

export function setState(patch) {
  let changed = false;
  for (const k in patch) if (state[k] !== patch[k]) changed = true;
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
