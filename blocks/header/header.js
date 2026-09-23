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

  // Collect the raw fragment content. DA may deliver everything inside a single
  // <div>, or (locally) as three separate section divs — so gather all elements
  // and classify by CONTENT, not by wrapper-div position.
  const source = document.createElement('div');
  while (fragment.firstElementChild) source.append(fragment.firstElementChild);

  // Resolve fragment-relative image paths ("images/logo.svg") against the fragment
  // location, not the current page URL. (No-op on DA, which rewrites to /media_… .)
  const navBase = window.location.pathname.startsWith('/content/') ? '/content/' : '/';
  source.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('./')) {
      img.setAttribute('src', navBase + src);
    }
  });

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // Meaningful nodes — whether DA delivered them in one wrapper div or as several.
  const topNodes = source.querySelector(':scope > div')
    ? [...source.querySelector(':scope > div').children]
    : [...source.children];

  // 1) Brand — the element containing the logo image.
  const brandNode = topNodes.find((el) => el.querySelector('img')) || topNodes[0];
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  if (brandNode) navBrand.append(brandNode);

  // 2) Primary nav — the <ul> whose links point to internal content pages
  //    (not the locale <ul> of language codes).
  const lists = topNodes.filter((el) => el.tagName === 'UL');
  const localeList = lists.find((ul) => [...ul.querySelectorAll('a')]
    .every((a) => /^\/[a-z]{2}\/[a-z]{2}$/.test(a.getAttribute('href') || '')));
  const primaryList = lists.find((ul) => ul !== localeList) || lists[0];
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (primaryList) navSections.append(primaryList);

  // 3) Tools — search (built here) + locale dropdown + sign-in.
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';

  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = `
    <form role="search" action="/us/en/search">
      <span class="nav-search-icon" aria-hidden="true"></span>
      <input type="search" name="q" aria-label="Search" placeholder="Search">
    </form>`;
  navTools.append(search);

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
    localeWrap.append(toggle, localeList);
    navTools.append(localeWrap);
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  // Sign In — the <p>/link pointing at #sign-in.
  const signIn = topNodes.find((el) => el.querySelector('a[href="#sign-in"]'))
    || [...source.querySelectorAll('a[href="#sign-in"]')][0]?.closest('p');
  if (signIn) navTools.append(signIn);

  nav.append(navBrand, navSections, navTools);

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
