/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mywkndsite2 site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, mobile nav, tracking iframe)
 * and leftover elements. All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking / ID-syncing iframe — verified: <iframe id="destination_publishing_iframe_wkndsite_0"> (cleaned.html:566)
    // Mobile nav chrome — verified: #toggleNav (line 568), #mobileNav (line 574)
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome — all verified in cleaned.html:
    //   header.cmp-experiencefragment--header (line 5)
    //   footer.cmp-experiencefragment--footer (line 471)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'iframe',
      'noscript',
      'link',
    ]);

    // Stray empty <meta> tags nested inside .cmp-image blocks — verified (cleaned.html:183, 204, 227, 271, 334, 378)
    element.querySelectorAll('meta').forEach((el) => el.remove());
  }
}
