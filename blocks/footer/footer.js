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

  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Resolve fragment-relative image paths (logo, social icons) against the
  // fragment location, not the current page URL.
  const base = window.location.pathname.startsWith('/content/') ? '/content/' : '/';
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http')) {
      img.setAttribute('src', base + src);
    }
  });

  // Tag sections for styling: brand (logo + nav), social (Follow Us), legal (copyright).
  const sections = [...footer.children];
  const names = ['footer-brand', 'footer-social', 'footer-legal'];
  sections.forEach((section, i) => {
    if (names[i]) section.classList.add(names[i]);
  });

  block.append(footer);
}
