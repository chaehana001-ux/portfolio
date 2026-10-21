import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname,'../dist');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const assets = new Set([...html.matchAll(/\.\/assets\/[^\s"'<>),]+/g)].map(m=>m[0]));
for (const asset of assets) assert(fs.existsSync(path.join(root,asset)), `Missing asset: ${asset}`);
for (const section of ['messages','mejiro-data','lookbook','admissions','movie']) assert(html.includes(`id="${section}"`),`Missing section: ${section}`);
assert(!html.includes('googletagmanager.com'), 'Original analytics must be removed');
assert(!html.includes('src="/univ/mejinavi2026/'), 'Original asset paths remain');
for(const file of ['styles.css','script.js']) assert(fs.existsSync(path.join(root,file)));
// Vercel serves Linux paths: validate CSS and dynamically referenced image files too.
const checkPath = (reference, base) => {
  const clean = reference.split(/[?#]/)[0];
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
const script = fs.readFileSync(path.join(root,'script.js'),'utf8');
for (const match of script.matchAll(/["'](\.\/assets\/[^"']+)["']/g)) checkPath(match[1],root);
for (const prefix of ['persona','lean-canvas','journey']) {
  for (let i=1;i<=3;i++) checkPath(`./assets/img/portfolio/${prefix}-${i}.${prefix==='journey'&&i===2?'png':'jpg'}`,root);
}
console.log(`PASS: ${assets.size} HTML asset references, 5 main sections, local paths, no original analytics.`);
