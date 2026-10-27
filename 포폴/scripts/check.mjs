import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname,'../dist');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const assets = new Set([...html.matchAll(/\.\/assets\/[^\s"'<>),]+/g)].map(m=>m[0].split(/[?#]/)[0]));
for (const asset of assets) assert(fs.existsSync(path.join(root,asset)), `Missing asset: ${asset}`);
for (const section of ['messages','projects','lookbook','clone-coding','movie']) assert(html.includes(`id="${section}"`),`Missing section: ${section}`);
assert(!html.includes('googletagmanager.com'), 'Original analytics must be removed');
// Validate local page entry points as well as images.
for (const match of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)) {
  const reference = match[1].split(/[?#]/)[0];
  assert(fs.existsSync(path.resolve(root, reference)), `Missing local entry: ${reference}`);
}

assert(!/<[^>]+data-menu="menu"/.test(html), 'Legacy expandable menu must not return');
assert(!/<[^>]+class="(?:legacy-hero-scene|modal-messages|modal-movie|modal-short-movie)(?:[\s"])/.test(html), 'Unused original page UI must not return');

assert(!html.includes('src="/univ/mejinavi2026/'), 'Original asset paths remain');
for(const file of ['styles.css','script.js']) assert(fs.existsSync(path.join(root,file)));
// Vercel serves Linux paths: validate CSS and dynamically referenced image files too.
const checkPath = (reference, base) => {
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  const absolute = path.resolve(base, clean);
  assert(fs.existsSync(absolute), `Missing asset: ${reference}`);
  let current = root;
  for (const part of path.relative(root, absolute).split(path.sep)) {
    assert(fs.readdirSync(current).includes(part), `Incorrect filename case: ${reference}`);
    current = path.join(current, part);
  }
};
for (const asset of assets) checkPath(asset, root);
for (const file of ['styles.css','page-flow.css','assets/css/style.css']) {
  const source = fs.readFileSync(path.join(root,file),'utf8');
  for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    if (!/^(?:data:|https?:|#|\/\/)/.test(match[1])) checkPath(match[1],path.dirname(path.join(root,file)));
  }
}
for (const file of ['script.js', 'all-projects.js', 'diptyque-story.js']) {
  const script = fs.readFileSync(path.join(root,file),'utf8');
  for (const match of script.matchAll(/["'](\.\/assets\/[^"']+)["']/g)) checkPath(match[1],root);
}
// Gallery filenames are assembled at runtime; validate them before deleting old assets.
for (let i=1; i<=8; i++) {
  const number=String(i).padStart(2,'0');
  const cleanVersion=i===2?'-v2':i===3?'-v4':'';
  const writingVersion=i===1||i===2?'-v2':i===3?'-v4':'';
  checkPath(`./assets/img/portfolio/gallery/photo-${number}-clean${cleanVersion}-preview.jpg`,root);
  checkPath(`./assets/img/portfolio/gallery/photo-${number}-writing${writingVersion}-preview.png`,root);
}
for (const prefix of ['persona','lean-canvas','journey']) {
  for (let i=1;i<=3;i++) checkPath(`./assets/img/portfolio/${prefix}-${i}.${prefix==='journey'&&i===2?'png':'jpg'}`,root);
}
console.log(`PASS: ${assets.size} HTML asset references, 5 main sections, local paths, no original analytics.`);
