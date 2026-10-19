import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<h1 class="section-heading"');
const end = html.indexOf('</h1>', start);
let heading = html.slice(start, end);
const letters = (word, step, centerY, curve, hook, size) => {
const texts = [...word].map((char, index) => {
  const offset = index - (word.length - 1) / 2;
  const x = 376.5 + offset * step;
  const y = centerY + curve * offset * offset;
  const angle = offset * 3;
  return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" transform="rotate(${angle} ${x} ${y})">${char}</text>`;
});
const chunks = hook === 'logoNum' ? [texts.slice(0, 2), texts.slice(2, 4), texts.slice(4, 6), texts.slice(6)] : texts.map(text => [text]);
return chunks.map(chunk => `<g data-item="${hook}" data-anime-item="${hook === 'logoText' ? 'char-md' : 'num-md'}">${chunk.join('')}</g>`).join('\n');
};
const svg = `<svg class="hana-hero-title" role="img" aria-label="HANA'S PORTFOLIO" viewBox="0 0 753 238" overflow="visible">
<title>HANA'S PORTFOLIO</title>
<defs><path id="hana-title-arc" d="M 40,158 Q 376.5,64 713,158"/></defs>
<g data-item="logoText" data-anime-item="char-md">
  <text class="hana-wordmark" font-size="166" text-anchor="middle" textLength="634" lengthAdjust="spacingAndGlyphs"><textPath href="#hana-title-arc" startOffset="50%">HANA’S</textPath></text>
</g>
<g data-item="logoText" data-anime-item="char-md" aria-hidden="true"><rect x="376" y="100" width="1" height="1" fill="none" stroke="none"/></g>
<g data-item="logoNum" data-anime-item="num-md">
  <text class="hana-portfolio-line" x="376.5" y="228" font-size="78" text-anchor="middle" textLength="548" lengthAdjust="spacingAndGlyphs">PORTFOLIO</text>
</g>
${[1, 2, 3].map(index => `<g data-item="logoNum" data-anime-item="num-md" aria-hidden="true"><rect x="${200 + index * 100}" y="200" width="1" height="1" fill="none" stroke="none"/></g>`).join('')}
</svg>`;
heading = heading.replace(/<svg[\s\S]*?<\/svg>/, svg);
heading = heading.replace('<h1 class="section-heading">', '<h1 class="section-heading" aria-label="HANA\'S PORTFOLIO">');
html = html.slice(0, start) + heading + html.slice(end);
fs.writeFileSync(file, html);
