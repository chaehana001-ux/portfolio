import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<section class="section-more-information"');
const second = html.indexOf('<section class="section-official-account"', start);
const end = html.indexOf('</section>', second) + '</section>'.length;
if (start < 0 || second < 0) throw new Error('Source sections not found');
const skills = [
  ['UX/UI DESIGN', '사용자 경험 · 화면 설계', '사용자의 목적을 이해하고, 정보 구조와 화면 흐름을 설계합니다.', '<rect x="18" y="18" width="64" height="64" rx="10"/><path d="M18 38h64M38 38v44M48 50h24M48 62h16"/>'],
  ['HTML', '시맨틱 마크업', '콘텐츠의 의미와 구조를 담는 마크업을 작성합니다.', '<path d="m36 28-22 22 22 22m28-44 22 22-22 22M57 18 43 82"/>'],
  ['CSS', '반응형 레이아웃 · 스타일', '다양한 화면 크기에 맞는 레이아웃과 시각적 스타일을 구현합니다.', '<rect x="15" y="20" width="49" height="49" rx="8"/><rect x="39" y="42" width="45" height="40" rx="8"/><path d="M26 32h26M26 43h15"/>'],
  ['JAVASCRIPT', '인터랙션 · 동작 구현', '사용자의 행동에 반응하는 웹 인터랙션을 구현합니다.', '<path d="m30 15 44 36-24 5-9 27-11-68Z"/><path d="m65 14 5 9m12 8 9 1M16 35l-9 3"/>'],
  ['REACT', '컴포넌트 기반 개발', '화면을 컴포넌트로 나누어 구성하고 재사용합니다.', '<rect x="12" y="12" width="31" height="31" rx="7"/><rect x="57" y="12" width="31" height="31" rx="7"/><rect x="12" y="57" width="31" height="31" rx="7"/><path d="M58 73h30M73 58v30"/>'],
  ['GSAP', '웹 모션 · 스크롤 연출', '타임라인과 스크롤을 활용해 화면에 움직임을 더합니다.', '<path d="M12 65c20 0 16-35 36-35s16 35 40 35M73 49l15 16-16 12"/><circle cx="16" cy="65" r="6"/>'],
  ['VIDEO EDITING', '숏폼 콘텐츠 · 비주얼 편집', '콘셉트에 맞춰 장면과 텍스트를 구성하고 영상을 편집합니다.', '<rect x="12" y="18" width="76" height="64" rx="9"/><path d="M12 32h76M12 68h76m-62-50v14m20-14v14m20-14v14M41 42l20 9-20 10Z"/>'],
  ['AI VISUAL', '콘셉트 · 이미지 생성', '콘셉트를 시각화하고 콘텐츠에 사용할 이미지 표현을 탐색합니다.', '<path d="m49 13 10 25 26 11-26 11-10 26-10-26-25-11 25-11 10-25Zm29-5 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"/>'],
];
const section = `<section class="section-skills" data-global="more-information official-account" id="skills" lang="ko">
<div class="skills-heading"><h2>SKILLS</h2><p>아이디어를 화면으로, 경험을 콘텐츠로</p></div>
<ul class="skills-grid" data-item="panel-container">${skills.map(([title, tag, description, drawing], i) => `<li class="skill-card" data-item="items"><span class="skill-number">0${i + 1}</span><div class="skill-illustration" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg></div><h3>${title}</h3><p class="skill-tag">${tag}</p><p class="skill-description">${description}</p></li>`).join('\n')}</ul>
</section>`;
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(file, html);
