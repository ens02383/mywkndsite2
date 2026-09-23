/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-minimal-dark-withimg. Base: tabs (CUSTOM variant).
 * Source: https://wknd.site/us/en/adventures.html (.tabs.panelcontainer)
 * Generated: 2026-09-23
 *
 * Block contract (blocks/tabs-minimal-dark-withimg/README.md + decorate()):
 *   Row 1 (single cell): comma/paragraph-separated filter labels; first label is the
 *     "all" reset.
 *   Remaining rows (one card each): [category label cell, image cell, body cell].
 *     The leading category label lets decorate() assign each card to a filter.
 *
 * Source structure:
 *   - `.cmp-tabs__tablist li` = filter labels (All, Climbing, Cycling, Skiing, Surfing, Travel).
 *   - `.cmp-tabs__tabpanel`s follow in the same order. The first ("All") panel holds
 *     every teaser card; each later panel is that category's subset. We use the later
 *     panels to map each card (keyed by href) to a category label.
 *   - Each card: `article.cmp-image-list__item-content` with an image
 *     (`.cmp-image-list__item-image img`), a title link
 *     (`a.cmp-image-list__item-title-link`) and a description
 *     (`.cmp-image-list__item-description`).
 */
export default function parse(element, { document }) {
  const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tablist li, [role="tab"]'))
    .map((li) => li.textContent.trim())
    .filter(Boolean);

  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  // Empty-block guard: no tabs or no panels means nothing to build.
  if (!tabLabels.length || !panels.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cardHref = (card) => {
    const link = card.querySelector('a.cmp-image-list__item-image-link, a.cmp-image-list__item-title-link, a[href]');
    return link ? link.getAttribute('href') : '';
  };

  // Map each card href -> category label, using the per-category panels (skip the
  // first "all" panel). tabLabels[i] aligns with panels[i] in DOM order.
  const hrefCategory = new Map();
  panels.forEach((panel, i) => {
    if (i === 0) return; // first panel is the "all" set
    const label = tabLabels[i] || '';
    panel.querySelectorAll('article.cmp-image-list__item-content, .cmp-image-list__item').forEach((card) => {
      const href = cardHref(card);
      if (href && !hrefCategory.has(href)) hrefCategory.set(href, label);
    });
  });

  const cells = [];

  // Row 1: filter labels, one <p> per label in a single cell.
  const filterCell = tabLabels.map((label) => {
    const p = document.createElement('p');
    p.textContent = label;
    return p;
  });
  cells.push([filterCell]);

  // Card rows: pull every card from the first ("all") panel so the full grid is captured.
  const allPanel = panels[0];
  const cards = Array.from(allPanel.querySelectorAll('article.cmp-image-list__item-content, .cmp-image-list__item-content'));

  cards.forEach((card) => {
    const href = cardHref(card);
    const category = hrefCategory.get(href) || '';

    const categoryCell = document.createElement('p');
    categoryCell.textContent = category;

    const img = card.querySelector('.cmp-image-list__item-image img, img');

    const bodyCell = [];
    const titleLink = card.querySelector('a.cmp-image-list__item-title-link');
    if (titleLink) {
      // Preserve the title text and its link as a heading.
      const heading = document.createElement('h3');
      const a = document.createElement('a');
      a.setAttribute('href', titleLink.getAttribute('href') || href || '');
      a.textContent = titleLink.textContent.trim();
      heading.append(a);
      bodyCell.push(heading);
    }
    const description = card.querySelector('.cmp-image-list__item-description, p');
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      bodyCell.push(p);
    }

    // Skip cards with no usable content.
    if (!img && !bodyCell.length) return;

    cells.push([categoryCell, img || '', bodyCell]);
  });

  // If we only have the filter row (no cards), bail rather than emit an empty grid.
  if (cells.length <= 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-minimal-dark-withimg', cells });
  element.replaceWith(block);
}
