// eslint-disable-next-line import/no-unresolved
import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Category filter tabs + card grid.
 * Content contract:
 *   Row 1 (single cell): comma/paragraph-separated filter labels, first is the "all" reset.
 *   Remaining rows: one card each — cell 1 image, cell 2 body. The card's category is
 *   taken from a leading label cell when present, otherwise the card is always shown.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const filterRow = rows.shift();

  // Filter labels
  const labels = [...filterRow.querySelectorAll('p, li')].map((n) => n.textContent.trim())
    .filter(Boolean);
  const filterLabels = labels.length ? labels : filterRow.textContent.split(',').map((s) => s.trim()).filter(Boolean);

  const tablist = document.createElement('div');
  tablist.className = 'tabs-minimal-dark-withimg-filters';
  tablist.setAttribute('role', 'tablist');

  // Card grid
  const grid = document.createElement('ul');
  grid.className = 'tabs-minimal-dark-withimg-grid';

  rows.forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'tabs-minimal-dark-withimg-card';
    // optional leading category label cell
    let category = '';
    if (cells.length > 2) {
      category = toClassName(cells.shift().textContent.trim());
    }
    li.dataset.category = category;
    cells.forEach((cell) => li.append(cell));
    grid.append(li);
  });

  grid.querySelectorAll('img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture')?.replaceWith(optimized);
  });

  const applyFilter = (value) => {
    grid.querySelectorAll('.tabs-minimal-dark-withimg-card').forEach((card) => {
      const show = !value || !card.dataset.category || card.dataset.category === value;
      card.hidden = !show;
    });
  };

  filterLabels.forEach((label, i) => {
    const value = i === 0 ? '' : toClassName(label);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-minimal-dark-withimg-filter';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', i === 0);
    button.addEventListener('click', () => {
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      button.setAttribute('aria-selected', true);
      applyFilter(value);
    });
    tablist.append(button);
  });

  block.replaceChildren(tablist, grid);
}
