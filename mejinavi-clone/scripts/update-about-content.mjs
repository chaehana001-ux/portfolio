import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<section class="section-lookbook"');
const end = html.indexOf('</section>', start);
let section = html.slice(start, end).replace('class="section-lookbook"', 'class="section-lookbook about-hana" lang="ko"');
const values = [
  ['CLARITY', '명확함', '사무 업무를 하며 다양한 자료와 요청을 정리하고, 필요한 정보를 이해하기 쉽게 전달하는 일이 중요하다는 것을 배웠습니다. 이 경험을 바탕으로 사용자가 정보를 쉽게 찾고 이해할 수 있는 화면을 만들고자 합니다.', '<rect x="44" y="32" width="112" height="136" rx="12"/><path d="M68 70h64M68 94h48M68 118h64M68 142h36"/>'],
  ['GROWTH', '성장', '새로운 분야를 배우는 과정에서 작은 시도와 반복의 가치를 발견했습니다. UI/UX 디자인과 웹 구현을 함께 배우며, 생각한 화면을 직접 만들고 개선하는 경험을 쌓고 있습니다.', '<rect x="24" y="38" width="152" height="112" rx="12"/><path d="M24 64h152M76 88l-20 18 20 18m48-36 20 18-20 18m-16-42-16 48M76 172h48m-24-22v22"/>'],
  ['EMPATHY', '공감', '업무 요청을 받으면 상대방이 무엇을 필요로 하는지 먼저 확인하려고 노력했습니다. 디자인에서도 사용자의 상황과 목적을 이해하고, 그에 맞는 정보와 흐름을 고민합니다.', '<path d="M30 38h108a14 14 0 0 1 14 14v54a14 14 0 0 1-14 14H72l-32 26v-26H30a14 14 0 0 1-14-14V52a14 14 0 0 1 14-14Z"/><path d="M168 76h4a14 14 0 0 1 14 14v58a14 14 0 0 1-14 14h-12v22l-30-22H92M42 70h82M42 92h58"/>'],
];
section = section.replace(/<h2 class="section-heading"[\s\S]*?<\/h2>/, `<h2 class="section-heading about-heading" data-scrollbar="lookbook" data-anime="headLineScale"><span class="text-main" data-anime-item="main">ABOUT ME</span><span class="about-kicker" data-anime-item="sub">일상의 경험을 디자인으로</span></h2>`);
const introStart = section.indexOf('<div class="main-text"');
const listEnd = section.indexOf('</ol>', introStart) + 5;
section = section.slice(0, introStart) + `<p class="about-intro">사무 업무를 하며 자료를 정리하고, 여러 사람의 요청을 이해해 전달했던 경험은<br class="md"> 이제 사용자의 필요를 이해하고, 정보를 화면으로 구성하는 디자인의 출발점이 되고 있습니다.</p>
<ol class="about-values">
${values.map(([title, subtitle, description, drawing], i) => `<li class="about-value about-value-${i + 1}" data-anime="${i % 2 ? 'panelRightIn' : 'panelLeftIn'}" data-delay="${i * .1}">
<article><div class="about-art" aria-hidden="true"><span class="about-number">0${i + 1}</span><svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg><span class="about-art-label">${title}</span></div><div class="about-value-copy"><span class="about-value-tag">MY VALUES · 0${i + 1}</span><h3>${title}</h3><p class="about-value-subtitle">${subtitle}</p><p>${description}</p></div></article>
</li>`).join('\n')}
</ol>
<p class="about-manifesto" lang="en">FROM <em>office work</em> TO UX/UI <em>design,</em><br>TURNING EVERYDAY <em>insights</em> INTO<br>MEANINGFUL <em>experiences</em> FOR <em>people.</em></p>` + section.slice(listEnd);
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(file, html);
