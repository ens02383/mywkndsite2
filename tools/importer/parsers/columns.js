/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns. Base: columns.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-23
 *
 * Library structure: multiple columns, first row = block name, subsequent rows
 * mirror the visual grouping. This featured teaser is a single 2-column row:
 * image (left) | text content (right).
 * Source: `.cmp-teaser__image img` (left); `.cmp-teaser__content` holds
 * pretitle `.cmp-teaser__pretitle`, `.cmp-teaser__title`, `.cmp-teaser__description`,
 * and CTA `a.cmp-teaser__action-link` (right).
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  const content = [];
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (pretitle) content.push(pretitle);
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title) content.push(title);
  const description = element.querySelector('.cmp-teaser__description, p:not(.cmp-teaser__pretitle)');
  if (description) content.push(description);
  const ctas = Array.from(element.querySelectorAll('.cmp-teaser__action-link, a.cmp-button, .cmp-teaser__action-container a'));
  ctas.forEach((cta) => content.push(cta));

  // Empty-block guard: nothing meaningful to place.
  if (!img && !content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single 2-column row: image | text.
  const cells = [[img || '', content.length ? content : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
