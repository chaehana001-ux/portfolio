import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const prefix = '/univ/mejinavi2026/';
const origin = 'https://www.mejiro.ac.jp';
await fs.mkdir(out, {recursive:true});
const reference = path.join(root, '.preview/reference.html');
await fs.mkdir(path.dirname(reference), {recursive:true});
await exec('curl.exe',['-f','-sS','-L',origin+prefix,'-o',reference]);
let html = await fs.readFile(reference, 'utf8');
const paths = new Set([...html.matchAll(/\/univ\/mejinavi2026\/assets\/[^\s"'<>),]+/g)].map(m=>m[0]));
async function download(remote) {
  const local = path.join(out, remote.slice(prefix.length));
  await fs.mkdir(path.dirname(local), {recursive:true});
  try { if ((await fs.stat(local)).size > 0) return; } catch {}
  await exec('curl.exe',['-f','-sS','-L','--retry','2',origin+remote,'-o',local],{maxBuffer:1024*1024});
}
for (const p of [prefix+'assets/css/style.css',prefix+'assets/js/bundle.js']) await download(p);
for (const name of ['assets/css/style.css','assets/js/bundle.js']) {
  const text = await fs.readFile(path.join(out,name),'utf8');
  for (const m of text.matchAll(/\/univ\/mejinavi2026\/assets\/[^\s"'<>),;`]+/g)) paths.add(m[0]);
  if(name.endsWith('.css')) for(const m of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if(!m[1].startsWith('data:')) {const u = new URL(m[1], origin+prefix+name); if(u.pathname.startsWith(prefix)) paths.add(u.pathname);}
  }
}
const queue = [...paths]; let completed = 0; const failures=[];
await Promise.all(Array.from({length:12},async()=>{
  while(queue.length) {const p=queue.shift(); try {await download(p);} catch(e) {failures.push(p);}
  completed++; if(completed%100===0) console.log(`${completed}/${paths.size} assets`);}
}));
const substitutions=[];
for(let i=failures.length-1;i>=0;i--) {
  const remote=failures[i];
  const file=path.join(out,remote.slice(prefix.length));
  const desktop=path.join(path.dirname(file),'md',path.basename(file));
  try { await fs.copyFile(desktop,file); substitutions.push({requested:remote,replacement:'md/'+path.basename(file)}); failures.splice(i,1); } catch {}
}
html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g,'')
 .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g,'')
 .replace(/<meta property="og:url"[^>]*>/, '')
 .replace(/<title>[\s\S]*?<\/title>/,'<title>MEJINAVI 2026 · Clone Study</title>')
 .replaceAll('https://www2.mejiro.ac.jp'+prefix, './')
 .replaceAll(prefix, './')
 .replace('</head>', '<meta name="robots" content="noindex,nofollow">\n<link rel="stylesheet" href="./styles.css">\n<script defer src="./script.js"></script>\n</head>')
 .replace('</body>','<a class="clone-credit" href="https://www.mejiro.ac.jp/univ/mejinavi2026/" target="_blank" rel="noopener noreferrer">CLONE STUDY · ORIGINAL ↗</a>\n</body>');
await fs.writeFile(path.join(out,'index.html'),html);
for(const name of ['assets/css/style.css','assets/js/bundle.js']) {
  let text = await fs.readFile(path.join(out,name),'utf8');
  text = text.replaceAll(prefix+'assets/', name.endsWith('.css')?'../':'./assets/');
  await fs.writeFile(path.join(out,name),text);
}
await fs.writeFile(path.join(root,'asset-report.json'),JSON.stringify({source:origin+prefix,count:paths.size,substitutions,failures},null,2));
console.log(JSON.stringify({assets:paths.size,failures}));
if(failures.length) process.exitCode=1;
