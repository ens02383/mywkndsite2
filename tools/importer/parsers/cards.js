/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base: cards.
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-23
 *
 * Library structure: 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one card: [image] | [title, description, CTA].
 * Source: `ul.cmp-image-list > li.cmp-image-list__item`, each with
 * `.cmp-image-list__item-image img`, `.cmp-image-list__item-title` (inside a
 * title link), and `.cmp-image-list__item-description`. Cards link to detail pages.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = Array.from(element.querySelectorAll(':scope .cmp-image-list__item, :scope li'));

  items.forEach((item) => {
    const img = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    const content = [];

    // Title: prefer a linked heading so the card remains clickable.
    const titleLink = item.querySelector('a.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title, h2, h3, h4');
    if (titleLink && titleText) {
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = titleLink.getAttribute('href');
      link.textContent = titleText.textContent.trim();
      heading.appendChild(link);
      content.push(heading);
    } else if (titleText) {
      content.push(titleText);
    }

    const description = item.querySelector('.cmp-image-list__item-description, p');
    if (description) content.push(description);

    if (img || content.length) {
      cells.push([img || '', content.length ? content : '']);
    }
  });

  // Empty-block guard: no cards found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
