/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero. Base: hero.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-09-23
 *
 * Library structure: 1 column, 3 rows. Row 1 = block name; row 2 = background
 * image (single cell); row 3 = title + subheading + CTA (single cell).
 * Source: `.cmp-teaser__image img` (background); `.cmp-teaser__content` holds
 * `.cmp-teaser__title`, `.cmp-teaser__description`, and CTA `a.cmp-teaser__action-link`.
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  const contentCell = [];
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title) contentCell.push(title);
  const description = element.querySelector('.cmp-teaser__description, p');
  if (description) contentCell.push(description);
  const ctas = Array.from(element.querySelectorAll('.cmp-teaser__action-link, a.cmp-button, .cmp-teaser__action-container a'));
  ctas.forEach((cta) => contentCell.push(cta));

  // Empty-block guard: no image and no content.
  if (!bgImage && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (optional, single cell).
  if (bgImage) cells.push([bgImage]);
  // Row 3: text content (single cell holding all elements).
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
