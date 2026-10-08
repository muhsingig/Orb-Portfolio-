// Entry point. The stylesheet comes in with the page; the app itself is
// fetched after the loading screen has painted, so that first screen
// (logo, counter, ENTER, the orb still) appears as fast as the network
// allows.
import './fonts.css'; // self-hosted, same origin
import './style.css';

requestAnimationFrame(() => setTimeout(() => import('./main.js'), 0));
