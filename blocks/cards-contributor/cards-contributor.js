import { createOptimizedPicture } from '../../scripts/aem.js';

// Social networks we have icons for (images/<network>.svg, shared with the footer).
const NETWORKS = [
  { id: 'facebook', label: 'Facebook', match: /facebook\.com|\bfacebook\b/i },
  { id: 'twitter', label: 'Twitter', match: /twitter\.com|\bx\.com\b|\btwitter\b/i },
  { id: 'instagram', label: 'Instagram', match: /instagram\.com|\binstagram\b/i },
];

function detectNetwork(...hints) {
  const hint = hints.filter(Boolean).join(' ');
  return NETWORKS.find((n) => n.match.test(hint));
}

// Builds one icon chip. `el` is the author's <a> (or a bare wrapper when DA
// flattened the link away, leaving only the icon image).
function buildSocialItem(el, network) {
  const li = document.createElement('li');
  const label = network ? network.label : el.textContent.trim();
  const chip = el.tagName === 'A' ? el : document.createElement('span');
  chip.className = 'cards-contributor-social-link';
  if (network) chip.classList.add(`cards-contributor-social-${network.id}`);
  if (chip.tagName === 'A') {
    chip.setAttribute('aria-label', label);
    if (!chip.target && /^https?:/.test(chip.href) && new URL(chip.href).host !== window.location.host) {
      chip.target = '_blank';
      chip.rel = 'noopener noreferrer';
    }
  }
  if (network) {
    const icon = document.createElement('span');
    icon.className = 'cards-contributor-social-icon';
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'cards-contributor-social-label';
    text.textContent = label;
    chip.replaceChildren(icon, text);
  }
  li.append(chip);
  return li;
}

// Pulls social links (and link-less social icon images) out of the body cell
// into a single <ul class="cards-contributor-social">.
function extractSocial(body) {
  const items = [];
  const containers = new Set();

  body.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    const network = detectNetwork(a.href, a.textContent, a.title, img?.src, img?.alt);
    if (!network) return;
    containers.add(a.parentElement);
    items.push(buildSocialItem(a, network));
  });

  // DA can drop the anchor and leave just <img src=".../facebook.svg">.
  body.querySelectorAll('img').forEach((img) => {
    if (img.closest('a')) return;
    const network = detectNetwork(img.src, img.alt);
    if (!network) return;
    const holder = img.closest('picture') || img;
    containers.add(holder.parentElement);
    holder.remove();
    items.push(buildSocialItem(document.createElement('span'), network));
  });

  // Remove wrappers (p/li/ul) left empty after the links were moved out.
  containers.forEach((c) => {
    let node = c;
    while (node && node !== body && !node.textContent.trim() && !node.querySelector('img, picture, a')) {
      const parent = node.parentElement;
      node.remove();
      node = parent;
    }
  });

  if (!items.length) return null;
  const ul = document.createElement('ul');
  ul.className = 'cards-contributor-social';
  ul.append(...items);
  return ul;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('picture, img'))) return;

    const li = document.createElement('li');
    let imageCell = cells.find((c) => c.children.length === 1 && c.querySelector('picture'));
    const bodyCells = cells.filter((c) => c !== imageCell);

    // Author merged the picture into the text cell: lift the first picture out.
    if (!imageCell) {
      const pic = bodyCells.map((c) => c.querySelector('picture')).find(Boolean);
      if (pic) {
        imageCell = document.createElement('div');
        const wrapper = pic.parentElement;
        imageCell.append(pic);
        if (wrapper && wrapper.tagName === 'P' && !wrapper.textContent.trim() && !wrapper.children.length) wrapper.remove();
      }
    }

    if (imageCell) {
      imageCell.className = 'cards-contributor-card-image';
      li.append(imageCell);
    }

    const body = document.createElement('div');
    body.className = 'cards-contributor-card-body';
    bodyCells.forEach((c) => body.append(...c.childNodes));

    const social = extractSocial(body);

    // Name: first h1–h4 in the body cell.
    const name = body.querySelector('h1, h2, h3, h4');
    if (name) name.classList.add('cards-contributor-name');

    // Role: an h5/h6 (as on the source), else the first non-empty paragraph.
    const role = body.querySelector(':scope > h5, :scope > h6')
      || [...body.querySelectorAll(':scope > p')].find((p) => p.textContent.trim());
    if (role) role.classList.add('cards-contributor-role');

    if (social) body.append(social);
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('.cards-contributor-card-image picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    pic.classList.add('cards-contributor-avatar');
    img.closest('picture').replaceWith(pic);
  });

  block.replaceChildren(ul);
}
