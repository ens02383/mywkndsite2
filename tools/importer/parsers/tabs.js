/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: .tabs.panelcontainer
 * Generated: 2026-09-23
 *
 * Authoritative contract: blocks/tabs/tabs.js decorate() — one row per tab; each
 * row has TWO cells: cell 1 = tab label, cell 2 = tab panel body (rich text +
 * images). (NB: this is the adventure-detail `tabs` block, NOT the unrelated
 * tabs-minimal-dark-withimg category-filter card grid on the listing template.)
 */
export default function parse(element, { document }) {
  // Tab labels live in the tablist; panels are the sibling tabpanels.
  let labels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  if (!labels.length) labels = Array.from(element.querySelectorAll('ol > li, [role="tab"]'));

  let panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));
  if (!panels.length) panels = Array.from(element.querySelectorAll('[role="tabpanel"]'));

  const cells = [];

  labels.forEach((label, i) => {
    const panel = panels[i];
    const labelText = label.textContent.trim();

    // Extract the panel's rich-text body. The AEM content fragment wraps the
    // body in .cmp-contentfragment__elements; fall back to the panel itself.
    const body = panel
      ? (panel.querySelector('.cmp-contentfragment__elements') || panel)
      : null;

    const bodyContent = [];
    if (body) {
      // Harvest meaningful content (paragraphs, lists, headings, images) while
      // dropping the repeated content-fragment <h3> title and empty AEM grid
      // wrapper <div>s.
      const nodes = body.querySelectorAll('p, ul, ol, h1, h2, h4, h5, h6, img');
      nodes.forEach((node) => {
        const tag = node.tagName.toLowerCase();
        if (tag === 'img' || node.textContent.trim()) bodyContent.push(node);
      });
    }

    // Fallback: if nothing was harvested but a panel exists, use its inner body.
    const bodyCell = bodyContent.length ? bodyContent : (body ? [body] : ['']);

    // Two cells per row: [label, panel body].
    cells.push([labelText, bodyCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
