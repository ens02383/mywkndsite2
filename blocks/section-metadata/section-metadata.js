import { toClassName } from '../../scripts/aem.js';

/**
 * Section Metadata block.
 * This project's aem.js decorateSections does not consume section metadata, so
 * the authored "Section Metadata" table lands as a block. Read its key/value
 * rows, apply them to the containing section (style tokens become classes, other
 * keys become data-attributes), then remove the block from the DOM.
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) {
    block.remove();
    return;
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = toClassName(cells[0].textContent.trim());
    const value = cells[1].textContent.trim();
    if (!key || !value) return;

    if (key === 'style') {
      value.split(',').forEach((token) => {
        const cls = toClassName(token.trim());
        if (cls) section.classList.add(cls);
      });
    } else {
      section.dataset[key] = value;
    }
  });

  block.remove();
}
