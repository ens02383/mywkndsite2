/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel. Base: carousel.
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-23
 *
 * Library structure: 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one slide: [image] | [title, description, CTA].
 * Source: each slide is a `.cmp-carousel__item` wrapping a `.cmp-teaser`
 * with `.cmp-teaser__image img`, `.cmp-teaser__title`, `.cmp-teaser__description`,
 * and CTA `a.cmp-teaser__action-link`.
 */
export default function parse(element, { document }) {
  const cells = [];

  // One slide per carousel item; fall back to any nested teaser if markup differs.
  let slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll(':scope .teaser, :scope .cmp-teaser'));
  }

  slides.forEach((slide) => {
    const img = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    const content = [];
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    if (title) content.push(title);
    const description = slide.querySelector('.cmp-teaser__description, p');
    if (description) content.push(description);
    const ctas = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, a.cmp-button, .cmp-teaser__action-container a'));
    ctas.forEach((cta) => content.push(cta));

    // Only emit a slide row when it has at least an image or some content.
    if (img || content.length) {
      cells.push([img || '', content.length ? content : '']);
    }
  });

  // Empty-block guard: no slides found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
