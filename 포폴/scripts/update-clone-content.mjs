import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<section class="section-short-movie"');
const end = html.indexOf('</section>', start);
let section = html.slice(start, end);
section = section.replace('<section class="section-short-movie">', '<section class="section-short-movie clone-studies" id="clone-coding" lang="ko">');
section = section.replace(/<h2 class="section-heading">[\s\S]*?<\/h2>/, `<div class="clone-intro"><span class="clone-eyebrow">CASE STUDIES</span><h2 class="section-heading">CLONE CODING</h2><p>진행했던 프로젝트 외에도 클론 코딩을 통해<br>핵심 역량을 지속적으로 확장해왔습니다.</p></div>`);
const projects = [
  ['NORTH', 'ARCHITECTURE / FUTURE', 'BUILD A<br>BETTER<br><em>tomorrow.</em>'],
  ['FORM', 'INDEPENDENT CREATIVE STUDIO', 'Ideas into<br><em>possibilities.</em>'],
  ['MODE', 'COLLECTION / 2026', 'A NEW<br><em>perspective.</em>'],
];
const sliderStart = section.indexOf('<div class="short-movie-slider"');
const linkEnd = section.indexOf('</a>', sliderStart) + 4;
section = section.slice(0, sliderStart) + `<div class="short-movie-slider" data-anime="leftIn" data-global="short-movie">
<div class="slider-wrapper">
${projects.map(([name, label, title], i) => `<article class="slider-slide slider-slide-${i + 1}">
  <div class="slider-slide-inner">
    <div class="thumb clone-cover clone-cover-${name.toLowerCase()}" role="img" aria-label="${name} 프로젝트 임시 타이틀 카드">
      <span class="clone-brand">${name}</span>
      <div><span class="clone-category">${label}</span><p class="clone-cover-title">${title}</p></div>
      <span class="clone-preview-status">프로젝트 이미지 준비 중</span>
    </div>
    <div class="clone-caption"><h3>${name} · MAIN PAGE</h3><p>HTML · CSS · JavaScript · React · GSAP</p></div>
  </div>
</article>`).join('\n')}
</div></div>` + section.slice(linkEnd);
section = section.replace('<div class="deco-text"></div>', '<div class="deco-text clone-deco-text" aria-hidden="true">CLONE CODING · CASE STUDIES · CLONE CODING · CASE STUDIES</div>');
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(file, html);
