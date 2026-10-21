import fs from 'node:fs';
const path = 'dist/index.html';
let html = fs.readFileSync(path, 'utf8');
const start = html.indexOf('<div class="hero-portal-copy about-story"');
const end = html.indexOf('<div class="hero-scroll-cue"', start);
if (start < 0 || end < 0) throw new Error('About intro not found');
html = html.slice(0, start) + `<div class="hero-portal-copy">
  <div class="about-intro-heading"><span>일상의 경험을 디자인으로</span><h2>ABOUT ME</h2></div>
  <div class="about-intro-portrait"><img src="./assets/img/portfolio/about-drawing-girl.png" alt="구름 위에서 아이디어를 그리는 소녀" width="1280" height="1280"><span>EVERYDAY IDEAS, MEANINGFUL DESIGN</span></div>
  <div class="about-intro-message"><span class="about-intro-label">HELLO, I'M HANA</span><p><em>채용 담당자</em>가 짧은 시간 안에<br><em>디자이너</em>의 사고 과정과 역량을<br>이해할 수 있도록 돕는 <strong>포트폴리오</strong></p><span class="about-intro-next">저의 이야기를 만나보세요 <span aria-hidden="true">↓</span></span></div>
</div></div>
  ` + html.slice(end);
fs.writeFileSync(path, html);
