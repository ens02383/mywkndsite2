/**
 * Breadcrumbs block
 * Content contract: one row per crumb; each row is a single cell containing a link
 * (or plain text for the current page). Renders as an ordered horizontal trail.
 */
export default function decorate(block) {
  const crumbs = [...block.children].map((row) => {
    const cell = row.querySelector(':scope > div') || row;
    const link = cell.querySelector('a');
    return { link, text: cell.textContent.trim() };
  }).filter((c) => c.text);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-list';

  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    const isLast = i === crumbs.length - 1;

    if (crumb.link && !isLast) {
      const a = document.createElement('a');
      a.href = crumb.link.getAttribute('href');
      a.textContent = crumb.text;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.textContent = crumb.text;
      if (isLast) span.setAttribute('aria-current', 'page');
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
