import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const projects = [
  { key: 'quiet', side: 'shinjuku', title: 'THE QUIET EDIT', tagline: 'A moment of quiet.', rows: [
    ['기획 의도', '빛과 여백을 활용해 일상 속 고요한 순간을 표현하고, 바이레도 향수의 제품 이미지를 기억하도록 구성한 콘셉트 광고'],
    ['타깃', '미니멀한 디자인과 감성적인 향수 콘텐츠를 선호하는 SNS 이용자'],
    ['제작 과정', '콘셉트 기획 → AI 제품 이미지 생성 → 장면별 움직임 구성 → 4개 장면 편집 → 타이포그래피 적용'],
    ['편집 포인트', '클로즈업으로 제품에 시선을 모으고, 장면의 움직임과 텍스트 등장 타이밍을 조절해 차분한 분위기 전달'],
  ] },
  { key: 'after', side: 'saitama', title: 'AFTER LIGHT', tagline: 'After the light.', rows: [
    ['기획 의도', '어두운 배경과 유리의 반사, 조형적인 구도를 활용해 바이레도 향수의 인상을 강조한 콘셉트 광고'],
    ['타깃', '감각적인 제품 비주얼과 분위기 있는 향수·라이프스타일 콘텐츠를 선호하는 SNS 이용자'],
    ['제작 과정', '콘셉트 기획 → AI 제품 이미지 생성 → 빛·그림자 중심의 움직임 구성 → 4개 장면 편집 → 타이포그래피 적용'],
    ['편집 포인트', '제품의 형태와 반사광에 시선을 모으고, 카메라 움직임과 텍스트 전환을 조절해 차분한 몰입감 전달'],
  ] },
];
const list = `<ul class="movie-list portfolio-movies" data-item="trigger" lang="ko">
${projects.map((p, i) => `<li class="item item-${p.side}" data-item="panel panel-${i + 1}">
  <div class="item-inner portfolio-film-frame">
    <div class="film-placeholder film-${p.key}" role="img" aria-label="${p.title} — 영상 원본 등록 전 임시 타이틀 카드">
      <span class="film-brand">BYREDO / ${p.title}</span>
      <p class="film-tagline">${p.tagline}</p>
      <span class="film-status">영상 준비 중</span>
    </div>
    <p class="portfolio-film-heading">${p.title}</p>
  </div>
  <article class="film-description" aria-labelledby="film-title-${p.key}">
    <h3 id="film-title-${p.key}">${p.title}</h3>
    <dl>${p.rows.map(([label, text]) => `<div><dt>${label}</dt><dd>${text}</dd></div>`).join('')}</dl>
  </article>
</li>`).join('\n')}
</ul>`;
const start = html.indexOf('<section class="section-movie"');
const end = html.indexOf('</section>', start);
let section = html.slice(start, end);
section = section.replace('キャンパス動画紹介', 'SNS 영상 콘텐츠');
section = section.replace(/<ul class="movie-list"[\s\S]*?<\/ul>/, list);
section = section.replace(/<div data-item="panel button">[\s\S]*?<\/div>/, '<p class="film-credit" lang="ko">03 · SHORT-FORM CONTENTS <span>Jihyun Jeon</span></p>');
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(file, html);
