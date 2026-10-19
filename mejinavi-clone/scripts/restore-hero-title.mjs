import fs from 'node:fs';
const path = 'dist/index.html';
const html = fs.readFileSync(path, 'utf8');
fs.writeFileSync(path, html.replace(/<span class="hero-hana-wordmark"><img[^>]+><\/span>/, '<span>HANA’S</span>'));
const cssPath = 'dist/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/^\.hero-personal-title \.hero-hana-wordmark[^\r\n]*\r?\n/m, '')
  .replace(/^\.hero-creative \.hero-hana-wordmark img[^\r\n]*\r?\n/m, '')
  .replace(' .hero-personal-title .hero-hana-wordmark { width: 235px; margin-left: -8px; }', '');
fs.writeFileSync(cssPath, css);
