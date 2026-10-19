import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<section class="section-hero"');
const end = html.indexOf('</section>', start);
if (start < 0 || end < 0) throw Error('Hero not found');
const openEnd = html.indexOf('>', start) + 1;
const original = html.slice(openEnd, end);
const scene = `
<div class="legacy-hero-scene" aria-hidden="true" inert>${original}</div>
<div class="hero-creative-scene">
  <div class="hero-introduction" lang="ko"><span class="hero-creative-kicker">UX/UI DESIGN · FRONTEND · MOTION</span><h1 class="hero-personal-title"><span>HANA’S</span><span>PORTFOLIO</span></h1><p>일상의 경험에서 시작해,<br>사람을 위한 화면을 만듭니다.</p><a class="hero-about-link" href="#lookbook">ABOUT ME <span aria-hidden="true">↘</span></a></div>
  <img class="hero-ideas-art" src="./assets/img/portfolio/hero-ideas.png" alt="생각에 잠긴 디자이너 곁으로 화면과 영상, 아이디어가 궤도를 따라 펼쳐지는 일러스트" width="1536" height="1024" fetchpriority="high">
  <span class="hero-orbit-star hero-orbit-star-one" aria-hidden="true">✦</span><span class="hero-orbit-star hero-orbit-star-two" aria-hidden="true">✧</span>
  <div class="hero-design-portal" aria-hidden="true"><div class="hero-window-bar"><i></i><i></i><i></i></div><div class="hero-window-wireframe"><span></span><div><i></i><i></i><i></i></div></div><div class="hero-portal-copy"><span>일상의 경험을 디자인으로</span><strong>ABOUT ME</strong></div></div>
  <div class="hero-scroll-cue" aria-hidden="true">SCROLL TO EXPLORE <span>↓</span></div>
</div>`;
html = html.slice(0,start) + html.slice(start,openEnd).replace('class="section-hero"','class="section-hero hero-creative"') + scene + html.slice(end);
fs.writeFileSync(file,html);
