import fs from 'node:fs';
const file=new URL('../dist/index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const image=html.match(/<img class="hero-ideas-art"[^>]*>/)?.[0];
if(!image) throw Error('Hero artwork not found');
html=html.replace(image,`<div class="hero-art-world">${image.replace('class="hero-ideas-art"','class="hero-ideas-art hero-art-base"')}<img class="hero-ideas-art hero-art-piece hero-art-video" src="./assets/img/portfolio/hero-ideas.png" alt="" aria-hidden="true"><img class="hero-ideas-art hero-art-piece hero-art-phone" src="./assets/img/portfolio/hero-ideas.png" alt="" aria-hidden="true"><img class="hero-ideas-art hero-art-piece hero-art-cloud" src="./assets/img/portfolio/hero-ideas.png" alt="" aria-hidden="true"></div>
<div class="hero-original-world" aria-hidden="true"><img class="hero-scene-cloud hero-scene-cloud-a" src="./assets/img/home/hero-deco-cloud-l.webp" alt=""><img class="hero-scene-cloud hero-scene-cloud-b" src="./assets/img/home/hero-deco-cloud-m.webp" alt=""><img class="hero-scene-bird" src="./assets/img/home/hero-deco-bird-1.webp" alt=""><img class="hero-scene-hills" src="./assets/img/footer/md/deco-hill@2x.webp" alt=""></div>`);
fs.writeFileSync(file,html);
