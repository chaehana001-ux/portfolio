import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
if (html.includes('id="monster-film"')) throw new Error('Monster film already added');
const rows = [
  ['콘셉트', '몬스터를 연상시키는 날카로운 눈빛과 네온 그린을 중심으로, 강렬한 에너지와 과일의 청량함을 결합한 숏폼 비주얼입니다.'],
  ['타깃', '강렬한 색감과 판타지 비주얼, 에너지 넘치는 브랜드 콘텐츠에 반응하는 SNS 이용자를 상정했습니다.'],
  ['화면 구성', '상단의 빛나는 눈에서 중앙의 청사과로 시선이 이어집니다. 키위·라임과 물방울, 번개 형태의 빛을 주변에 배치해 세로 화면을 밀도 있게 채웠습니다.'],
  ['표현 포인트', '어두운 배경과 선명한 그린의 대비로 주목도를 높이고, 과일 표면의 물기와 액체의 질감으로 신선함을 표현했습니다. 여러 장면 전환보다 하나의 비주얼을 유지하는 구성이 특징입니다.'],
];
const card = `<li class="item item-monster" id="monster-film">
  <div class="item-inner portfolio-film-frame monster-film-frame">
    <video class="monster-video" controls playsinline preload="metadata" poster="./assets/video/monster-poster.jpg" aria-label="MONSTER — 15초 세로형 숏폼 영상">
      <source src="./assets/video/monster-shortform.mp4" type="video/mp4">
      브라우저에서 영상을 재생할 수 없습니다. <a href="./assets/video/monster-shortform.mp4">영상 다운로드</a>
    </video>
  </div>
  <article class="film-description monster-description" aria-labelledby="film-title-monster">
    <p class="monster-eyebrow">SHORT-FORM VISUAL · 15 SEC · 9:16</p>
    <h3 id="film-title-monster">MONSTER</h3>
    <p class="monster-summary">어둠 속에서 터지는, 선명한 그린 에너지.</p>
    <dl>${rows.map(([label, text]) => `<div><dt>${label}</dt><dd>${text}</dd></div>`).join('')}</dl>
  </article>
</li>`;
html = html.replace(/(<ul class="movie-list portfolio-movies"[^>]*>)/, `$1\n${card}`);
fs.writeFileSync(file, html);
