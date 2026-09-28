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

  // tools/importer/import-overview-hub.js
  var import_overview_hub_exports = {};
  __export(import_overview_hub_exports, {
    default: () => import_overview_hub_default
  });

  // tools/importer/parsers/cards-contributor.js
  var CONTRIBUTOR_CLASS = "cmp-experience-fragment--contributor";
  function isContributor(el) {
    return !!el && el.nodeType === 1 && el.classList.contains(CONTRIBUTOR_CLASS);
  }
  function buildRow(section, document2) {
    const img = section.querySelector(".cmp-image img, .image img, img");
    const nameEl = section.querySelector(".title h3.cmp-title__text") || section.querySelector("h3, h2, h4, h1");
    const roleEl = section.querySelector(".title h5.cmp-title__text") || section.querySelector("h5, h6");
    const content = [];
    const name = nameEl ? nameEl.textContent.trim() : "";
    if (name) {
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      content.push(h3);
    }
    const role = roleEl && roleEl !== nameEl ? roleEl.textContent.trim() : "";
    if (role) {
      const h5 = document2.createElement("h5");
      h5.textContent = role;
      content.push(h5);
    }
    let links = [...section.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button")];
    if (!links.length) links = [...section.querySelectorAll("a[href]")];
    links.forEach((a) => {
      const labelEl = a.querySelector(".cmp-button__text");
      const label = (labelEl ? labelEl.textContent : a.textContent).trim() || a.getAttribute("aria-label") || a.getAttribute("title") || "";
      const href = a.getAttribute("href");
      if (!label || !href) return;
      const p = document2.createElement("p");
      const link = document2.createElement("a");
      link.href = href;
      link.textContent = label;
      p.appendChild(link);
      content.push(p);
    });
    if (!img && !content.length) return null;
    let avatar = "";
    if (img) {
      avatar = document2.createElement("img");
      avatar.src = img.getAttribute("src");
      avatar.alt = (img.getAttribute("alt") || "").trim() || name;
    }
    return [avatar, content.length ? content : ""];
  }
  function parse(element, { document: document2 }) {
    const run = [element];
    let next = element.nextElementSibling;
    while (isContributor(next)) {
      run.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    run.forEach((section) => {
      const row = buildRow(section, document2);
      if (row) cells.push(row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contributor", cells });
    run.slice(1).forEach((section) => section.remove());
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

  // tools/importer/import-overview-hub.js
  var PAGE_TEMPLATE = {
    "name": "overview-hub",
    "description": "Hub page: page title followed by repeating sections, each a heading, intro paragraph, and a responsive grid of image/avatar cards",
    "urls": [
      "https://wknd.site/us/en/about-us.html"
    ],
    "blocks": [
      {
        "name": "cards-contributor",
        "instances": [
          "section.experiencefragment.cmp-experience-fragment--contributor"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Page title",
        "selector": [
          "main .title:not(.cmp-title--underline)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "main .title h1"
        ]
      },
      {
        "id": "s2",
        "name": "Our Contributors",
        "selector": [
          ".title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-contributor"
        ],
        "defaultContent": [
          ".title.cmp-title--underline",
          ".text.cmp-text--font-small"
        ]
      },
      {
        "id": "s3",
        "name": "WKND Guides",
        "selector": [
          ".title.cmp-title--underline ~ .title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-contributor"
        ],
        "defaultContent": [
          ".title.cmp-title--underline ~ .title.cmp-title--underline",
          ".text.cmp-text--font-small ~ .text.cmp-text--font-small"
        ]
      }
    ]
  };
  var parsers = {
    "cards-contributor": parse
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
  var import_overview_hub_default = {
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
  return __toCommonJS(import_overview_hub_exports);
})();
