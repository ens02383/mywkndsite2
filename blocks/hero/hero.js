// Known appearance options folded onto the hero block (see metadata.json).
const OPTION_CLASSES = [
  'minimal-dark-withimg',
  'minimal-dark-withimg-2',
  'minimal-dark-withimg-3',
];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  // Any of the withimg options render the hero as an image-backed banner with
  // overlaid heading; the shared structural styling lives in hero.css. Tolerate
  // the block being authored with no option class (default hero) or extra classes.
  if (active.length) {
    block.classList.add('hero-withimg');
  }
}
