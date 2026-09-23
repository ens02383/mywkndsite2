/**
 * Fetch the footer fragment. Metadata-independent dual-fetch:
 *   /content/footer.plain.html (localhost / aem up) then /footer.plain.html (DA/EDS prod).
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/**
 * Loads and decorates the WKND footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  // Gather raw content. DA may deliver everything in one <div>; classify by
  // CONTENT, not by wrapper-div position.
  const source = document.createElement('div');
  while (fragment.firstElementChild) source.append(fragment.firstElementChild);

  // Resolve fragment-relative image paths (no-op on DA, which rewrites to /media_…).
  const base = window.location.pathname.startsWith('/content/') ? '/content/' : '/';
  source.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('./')) {
      img.setAttribute('src', base + src);
    }
  });

  const topNodes = source.querySelector(':scope > div')
    ? [...source.querySelector(':scope > div').children]
    : [...source.children];

  const footer = document.createElement('div');
  const used = new Set();

  // Identify the meaningful nodes by content.
  const lists = topNodes.filter((el) => el.tagName === 'UL');
  const logoNode = topNodes.find((el) => el.querySelector('img') && el.tagName !== 'UL');
  const socialList = lists.find((ul) => ul.querySelector('img'));
  const navList = lists.find((ul) => ul !== socialList);
  const followHeading = topNodes.find((el) => /^h[1-6]$/i.test(el.tagName)
    && /follow/i.test(el.textContent));

  // Brand — logo + footer nav.
  const footerBrand = document.createElement('div');
  footerBrand.className = 'footer-brand';
  [logoNode, navList].forEach((el) => { if (el) { footerBrand.append(el); used.add(el); } });

  // Social — "Follow Us" heading + icon links.
  const footerSocial = document.createElement('div');
  footerSocial.className = 'footer-social';
  [followHeading, socialList].forEach((el) => {
    if (el) { footerSocial.append(el); used.add(el); }
  });

  // Legal — everything else, in original order (copyright + attribution).
  const footerLegal = document.createElement('div');
  footerLegal.className = 'footer-legal';
  topNodes.forEach((el) => { if (!used.has(el)) footerLegal.append(el); });

  footer.append(footerBrand, footerSocial, footerLegal);
  block.append(footer);
}
