/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventure-listing.js
  var import_adventure_listing_exports = {};
  __export(import_adventure_listing_exports, {
    default: () => import_adventure_listing_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const contentCell = [];
    const title = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    if (title) contentCell.push(title);
    const description = element.querySelector(".cmp-teaser__description, p");
    if (description) contentCell.push(description);
    const ctas = Array.from(element.querySelectorAll(".cmp-teaser__action-link, a.cmp-button, .cmp-teaser__action-container a"));
    ctas.forEach((cta) => contentCell.push(cta));
    if (!bgImage && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-minimal-dark-withimg.js
  function parse2(element, { document: document2 }) {
    const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tablist li, [role="tab"]')).map((li) => li.textContent.trim()).filter(Boolean);
    const panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    if (!tabLabels.length || !panels.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cardHref = (card) => {
      const link = card.querySelector("a.cmp-image-list__item-image-link, a.cmp-image-list__item-title-link, a[href]");
      return link ? link.getAttribute("href") : "";
    };
    const hrefCategory = /* @__PURE__ */ new Map();
    panels.forEach((panel, i) => {
      if (i === 0) return;
      const label = tabLabels[i] || "";
      panel.querySelectorAll("article.cmp-image-list__item-content, .cmp-image-list__item").forEach((card) => {
        const href = cardHref(card);
        if (href && !hrefCategory.has(href)) hrefCategory.set(href, label);
      });
    });
    const cells = [];
    const filterCell = tabLabels.map((label) => {
      const p = document2.createElement("p");
      p.textContent = label;
      return p;
    });
    cells.push([filterCell]);
    const allPanel = panels[0];
    const cards = Array.from(allPanel.querySelectorAll("article.cmp-image-list__item-content, .cmp-image-list__item-content"));
    cards.forEach((card) => {
      const href = cardHref(card);
      const category = hrefCategory.get(href) || "";
      const categoryCell = document2.createElement("p");
      categoryCell.textContent = category;
      const img = card.querySelector(".cmp-image-list__item-image img, img");
      const bodyCell = [];
      const titleLink = card.querySelector("a.cmp-image-list__item-title-link");
      if (titleLink) {
        const heading = document2.createElement("h3");
        const a = document2.createElement("a");
        a.setAttribute("href", titleLink.getAttribute("href") || href || "");
        a.textContent = titleLink.textContent.trim();
        heading.append(a);
        bodyCell.push(heading);
      }
      const description = card.querySelector(".cmp-image-list__item-description, p");
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        bodyCell.push(p);
      }
      if (!img && !bodyCell.length) return;
      cells.push([categoryCell, img || "", bodyCell]);
    });
    if (cells.length <= 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-minimal-dark-withimg", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/mywkndsite2-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "#toggleNav",
        "#mobileNav"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "iframe",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("meta").forEach((el) => el.remove());
    }
  }

  // tools/importer/transformers/mywkndsite2-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-adventure-listing.js
  var PAGE_TEMPLATE = {
    "name": "adventure-listing",
    "description": "Listing page: page title, full-width hero with overlaid intro text box, and a filterable responsive grid of teaser cards",
    "urls": [
      "https://wknd.site/us/en/adventures.html"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          ".teaser.cmp-teaser--hero"
        ]
      },
      {
        "name": "tabs-minimal-dark-withimg",
        "instances": [
          ".tabs.panelcontainer"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Page title",
        "selector": [
          ".cmp-layout-container--fixed:nth-of-type(1)",
          "main.cmp-layout-container--fixed"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".title.cmp-title"
        ]
      },
      {
        "id": "s2",
        "name": "Hero with overlaid intro",
        "selector": [
          ".teaser.cmp-teaser--hero"
        ],
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": []
      },
      {
        "id": "s3",
        "name": "Current Adventures heading",
        "selector": [
          ".title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".title.cmp-title--underline"
        ]
      },
      {
        "id": "s4",
        "name": "Filterable adventures grid",
        "selector": [
          ".tabs.panelcontainer"
        ],
        "style": null,
        "blocks": [
          "tabs-minimal-dark-withimg"
        ],
        "defaultContent": []
      },
      {
        "id": "s5",
        "name": "Trailing separator",
        "selector": [
          ".separator"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".separator"
        ]
      }
    ]
  };
  var parsers = {
    "hero": parse,
    "tabs-minimal-dark-withimg": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventure_listing_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_adventure_listing_exports);
})();
