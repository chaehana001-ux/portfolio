import fs from 'node:fs';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const start=html.indexOf('<div class="hero-figma-window"');
const end=html.indexOf('<div class="hero-original-world"',start);
if(start<0||end<0) throw new Error('Window not found');
let window=html.slice(start,end);
for(const [oldX,newX] of [[15,13],[37,35],[59,57]]){
 window=window.replace(`style="left:${oldX}px;top:14px"`,`style="left:${newX}px;top:12px"`);
}
window=window.replace('<img class="figma-window-image"','<img class="figma-window-divider" src="./assets/img/figma/window-divider.svg" alt=""><img class="figma-window-image"');
html=html.slice(0,start)+window+html.slice(end);
fs.writeFileSync(file,html);
