// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 *   /content/nav.plain.html (localhost / aem up) then /nav.plain.html (DA/EDS prod).
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

function closeMenus(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Loads and decorates the WKND header nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Resolve fragment-relative image paths (e.g. "images/logo.svg") against the
  // nav fragment location, not the current page URL. Localhost serves the
  // fragment under /content; DA/EDS serves it at the site root.
  const navBase = document.querySelector('meta[name="nav-image-base"]')?.content
    || (window.location.pathname.startsWith('/content/') ? '/content/' : '/');
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http')) {
      img.setAttribute('src', navBase + src);
    }
  });

  // Assign section roles: brand (logo), sections (primary links), tools (locale + sign-in)
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Build the search control (not embedded in the fragment).
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = document.createElement('div');
    search.className = 'nav-search';
    search.innerHTML = `
      <form role="search" action="/us/en/search">
        <span class="nav-search-icon" aria-hidden="true"></span>
        <input type="search" name="q" aria-label="Search" placeholder="Search">
      </form>`;
    navTools.prepend(search);

    // Locale selector: turn the first tools list into a toggle dropdown.
    // The toggle is an anchor (matching the source's <a href="#langNavToggle">en-US</a>)
    // so the current locale label stays part of the nav content.
    const localeList = navTools.querySelector('ul');
    if (localeList) {
      localeList.classList.add('nav-locale-list');
      const current = localeList.querySelector('a');
      const toggle = document.createElement('a');
      toggle.href = '#langNavToggle';
      toggle.className = 'nav-locale-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = current ? current.textContent : 'en-US';
      const localeWrap = document.createElement('div');
      localeWrap.className = 'nav-locale';
      localeList.replaceWith(localeWrap);
      localeWrap.append(toggle, localeList);
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  // Close locale dropdown / mobile menu on outside click and Escape.
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenus(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeMenus(nav);
      if (!isDesktop.matches) toggleMenu(nav, false);
    }
  });

  // Reset to a clean state on breakpoint change (no refresh needed).
  isDesktop.addEventListener('change', () => {
    closeMenus(nav);
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
