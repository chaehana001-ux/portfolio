import fs from 'node:fs';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const icons=[...html.matchAll(/<div class="about-art"[^>]*>.*?(<svg[\s\S]*?<\/svg>)/g)].map(match=>match[1]);
if(icons.length!==3) throw new Error('Value illustrations missing');
const art=i=>`<span class="story-picture" aria-hidden="true">${icons[i]}</span>`;
const opening=`
<div class="about-story-opening" lang="en">
 <span class="about-opening-label">MY JOURNEY</span>
 <h2 class="story-lines">
  <span class="opening-line">FROM <em>office work</em> ${art(0)} TO</span>
  <span class="opening-line">UX/UI ${art(1)} <em>design,</em></span>
  <span class="opening-line">TURNING EVERYDAY</span>
  <span class="opening-line"><em>insights</em> INTO</span>
  <span class="opening-line">MEANINGFUL <em>experiences</em> ${art(2)}</span>
  <span class="opening-line opening-people">FOR <em>people.</em></span>
 </h2>
 <p lang="ko">일상의 경험을, 사람을 위한 의미 있는 화면으로.</p>
 <span class="about-opening-arrow" aria-hidden="true">↓</span>
</div>`;
const marker='<section class="section-lookbook about-hana" lang="ko" id="lookbook" data-global="lookbook">';
if(!html.includes(marker)) throw new Error('About section not found');
html=html.replace(marker,marker+opening);
fs.writeFileSync(file,html);
