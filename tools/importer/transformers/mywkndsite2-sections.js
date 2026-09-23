/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mywkndsite2 section breaks and section metadata.
 * Reads boundaries from payload.template.sections (page-templates.json).
 * Inserts <hr> before each non-first section in beforeTransform (while every
 * section element still exists, before parsers replace them), and Section
 * Metadata blocks for styled sections in afterTransform, anchored to a marker.
 *
 * home-landing sections (selectors verified in migration-work/cleaned.html):
 *   s1 Hero carousel           .carousel.cmp-carousel--hero              (line 165)  no style
 *   s2 Featured Article        .teaser.cmp-teaser--featured              (line 256)  style: grey
 *   s3 Recent Articles         .image-list.list                         (line 281)  no style
 *   s4 Next Adventures         .teaser.cmp-teaser--hero.cmp-teaser--imagebottom (line 364) no style
 *   s5 Where do you want to go .image-list.list                         (line 391)  no style
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — no selector matched post-parse; skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
