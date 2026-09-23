/*
 * Quote Block
 * A pull quote with optional attribution.
 * Content contract: row 1 = quotation, optional row 2 = attribution.
 */
export default function decorate(block) {
  const [quoteRow, attributionRow] = [...block.children];

  const blockquote = document.createElement('blockquote');

  const quote = document.createElement('p');
  quote.className = 'quote-quotation';
  quote.append(...(quoteRow.firstElementChild || quoteRow).childNodes);
  blockquote.append(quote);

  if (attributionRow) {
    const attribution = document.createElement('p');
    attribution.className = 'quote-attribution';
    attribution.append(...(attributionRow.firstElementChild || attributionRow).childNodes);
    blockquote.append(attribution);
  }

  block.replaceChildren(blockquote);
}
