/* Convert EDS .plain.html (rendered block-div markup) into DA source HTML
 * (document format: blocks as <table>, sections separated by <hr>).
 *
 * .plain.html shape:
 *   <div>                       one per SECTION
 *     <div class="carousel">    a block
 *       <div><div>…</div><div>…</div></div>   row → cells
 *     </div>
 *     <h2>…</h2><p>…</p>         default content
 *   </div>
 *
 * DA source shape:
 *   <body><main>
 *     <div>  … section content, blocks as <table> …  </div>
 *     <hr>
 *     <div>  … next section …  </div>
 *   </main></body>
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-url-discovery/scripts/node_modules/cheerio');

function titleCase(name) {
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Turn a block name like "carousel" or "tabs-minimal-dark-withimg" (with the
// full class list) into the DA header label: "Carousel", "Cards (minimal-dark-withimg)".
function blockLabel(classList) {
  const classes = classList.split(/\s+/).filter(Boolean);
  const base = classes[0];
  const variants = classes.slice(1);
  let label = titleCase(base);
  if (variants.length) label += ` (${variants.join(', ')})`;
  return label;
}

function convert(inputFile, outputFile) {
  const html = fs.readFileSync(inputFile, 'utf8');
  const $ = cheerio.load(html, null, false);

  // top-level <div> = sections
  const sections = $.root().children('div').toArray();
  const out = $('<div></div>'); // temp holder

  sections.forEach((sectionEl, sIdx) => {
    const $section = $(sectionEl);
    const $sectionOut = $('<div></div>');

    $section.children().each((_, child) => {
      const $child = $(child);
      const cls = $child.attr('class');
      if ($child.is('div') && cls) {
        // a block → table
        const $table = $('<table></table>');
        // header row: block label
        const $headTr = $('<tr></tr>');
        const $headTd = $('<td></td>').text(blockLabel(cls));
        $headTr.append($headTd);
        $table.append($headTr);
        // data rows: each direct child div = a row; its child divs = cells
        $child.children('div').each((__, rowEl) => {
          const $row = $(rowEl);
          const $tr = $('<tr></tr>');
          const cells = $row.children('div').toArray();
          if (cells.length === 0) {
            // single-cell row
            const $td = $('<td></td>');
            $td.append($row.contents().clone());
            $tr.append($td);
          } else {
            cells.forEach((cellEl) => {
              const $td = $('<td></td>');
              $td.append($(cellEl).contents().clone());
              $tr.append($td);
            });
          }
          $table.append($tr);
        });
        $sectionOut.append($table);
      } else {
        // default content — keep as-is
        $sectionOut.append($child.clone());
      }
    });

    out.append($sectionOut.children());
    // section separator (not after the last section)
    if (sIdx < sections.length - 1) out.append('<hr>');
  });

  const body = `<body>\n  <header></header>\n  <main>\n${out.html()}\n  </main>\n  <footer></footer>\n</body>`;
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, body);
  return { blocks: $('table', out).length };
}

// CLI
const [, , inFile, outFile] = process.argv;
if (inFile && outFile) {
  const r = convert(inFile, outFile);
  console.log(`wrote ${outFile} (${r.blocks} block tables)`);
}

module.exports = { convert };
