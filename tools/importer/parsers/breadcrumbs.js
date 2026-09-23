/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumbs.
 * Base block: breadcrumbs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: .breadcrumb.cmp-breadcrumb--fixed
 * Generated: 2026-09-23
 *
 * Contract (blocks/breadcrumbs/breadcrumbs.js): one row per crumb; each row is a
 * single cell containing a link, or plain text for the current (last/active) page.
 */
export default function parse(element, { document }) {
  // Each crumb is an <li> in the breadcrumb list. Prefer the semantic class,
  // fall back to raw list items for cross-page resilience.
  let items = element.querySelectorAll('.cmp-breadcrumb__item');
  if (!items.length) items = element.querySelectorAll('nav ol > li, ol > li, li');

  const crumbs = Array.from(items).filter((li) => li.textContent.trim());

  const cells = [];
  crumbs.forEach((li, i) => {
    const isLast = i === crumbs.length - 1;
    const isActive = li.classList.contains('cmp-breadcrumb__item--active');
    const link = li.querySelector('a');
    const text = li.textContent.trim();

    // Linked crumb (not the current page): emit a clean anchor.
    if (link && !isLast && !isActive) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = text;
      cells.push([a]);
    } else {
      // Current / last page: plain text.
      cells.push([text]);
    }
  });

  // Empty-block guard: nothing to render.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
