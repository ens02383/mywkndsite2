/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contributor. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html
 *   (section.experiencefragment.cmp-experience-fragment--contributor)
 * Generated: 2026-09-28
 *
 * Library structure: 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one person: [avatar picture] | [h3 name, h5 role, social links].
 *
 * Source DOM: each matched <section> is ONE contributor. Contributors appear as
 * flat siblings in consecutive runs (e.g. 4 under "Our Contributors", 3 under
 * "WKND Guides"). The parser collects the run of consecutive contributor sibling
 * sections starting at `element`, builds ONE block with a row per person,
 * replaces `element` with the block and removes the rest of the run. The import
 * script skips later matches whose parentNode is null (already removed).
 *
 * Per person:
 *   - avatar: .cmp-image img
 *   - name:   .title h3.cmp-title__text (fallback: first h1-h4)
 *   - role:   .title h5.cmp-title__text (fallback: h5/h6) -> emitted as <h5>
 *   - social: .cmp-buildingblock--btn-list a.cmp-button, text from .cmp-button__text
 */
const CONTRIBUTOR_CLASS = 'cmp-experience-fragment--contributor';

function isContributor(el) {
  return !!el && el.nodeType === 1 && el.classList.contains(CONTRIBUTOR_CLASS);
}

function buildRow(section, document) {
  const img = section.querySelector('.cmp-image img, .image img, img');

  const nameEl = section.querySelector('.title h3.cmp-title__text')
    || section.querySelector('h3, h2, h4, h1');
  const roleEl = section.querySelector('.title h5.cmp-title__text')
    || section.querySelector('h5, h6');

  const content = [];

  const name = nameEl ? nameEl.textContent.trim() : '';
  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    content.push(h3);
  }

  const role = roleEl && roleEl !== nameEl ? roleEl.textContent.trim() : '';
  if (role) {
    const h5 = document.createElement('h5');
    h5.textContent = role;
    content.push(h5);
  }

  // Social links, in source order. Anchor text = visible label (Facebook/Twitter/Instagram).
  let links = [...section.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button')];
  if (!links.length) links = [...section.querySelectorAll('a[href]')];
  links.forEach((a) => {
    const labelEl = a.querySelector('.cmp-button__text');
    const label = (labelEl ? labelEl.textContent : a.textContent).trim()
      || a.getAttribute('aria-label') || a.getAttribute('title') || '';
    const href = a.getAttribute('href');
    if (!label || !href) return;
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    p.appendChild(link);
    content.push(p);
  });

  if (!img && !content.length) return null;

  let avatar = '';
  if (img) {
    avatar = document.createElement('img');
    avatar.src = img.getAttribute('src');
    avatar.alt = (img.getAttribute('alt') || '').trim() || name;
  }

  return [avatar, content.length ? content : ''];
}

export default function parse(element, { document }) {
  // Collect this contributor and its consecutive contributor siblings.
  const run = [element];
  let next = element.nextElementSibling;
  while (isContributor(next)) {
    run.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  run.forEach((section) => {
    const row = buildRow(section, document);
    if (row) cells.push(row);
  });

  // Empty-block guard: no contributor content found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contributor', cells });
  run.slice(1).forEach((section) => section.remove());
  element.replaceWith(block);
}
