import fs from 'node:fs';
const file = 'dist/index.html';
let html = fs.readFileSync(file, 'utf8');
const icons = [...html.matchAll(/<div class="about-art"[^>]*>.*?(<svg[\s\S]*?<\/svg>)/g)].map(match => match[1]);
if (icons.length !== 3) throw new Error('Expected three value illustrations');
const picture = (index, label) => `<span class="story-picture" aria-hidden="true">${icons[index]}<span>${label}</span></span>`;
const story = `<div class="hero-portal-copy about-story" lang="en">
  <span class="story-eyebrow">MY JOURNEY · 일상의 경험을 디자인으로</span>
  <div class="story-lines">
    <p>FROM <em>office work</em> ${picture(0, 'ORGANIZE')} TO</p>
    <p>UX/UI ${picture(1, 'CREATE')} <em>design,</em></p>
    <p>TURNING EVERYDAY</p>
    <p><em>insights</em> INTO</p>
    <p>MEANINGFUL <em>experiences</em> ${picture(2, 'CONNECT')}</p>
    <p class="story-people">FOR <em>people.</em></p>
  </div>
  <span class="story-caption" lang="ko">일상의 경험을, 사람을 위한 의미 있는 화면으로.</span>
</div>`;
html = html.replace(/<div class="hero-portal-copy">[\s\S]*?<\/div>\s*<\/div><\/div>\s*<div class="hero-scroll-cue"/, `${story}</div>\n  <div class="hero-scroll-cue"`);
html = html.replace(/<p class="about-manifesto"[\s\S]*?<\/p>/, '');
// The window contains meaningful content, not decorative placeholders.
html = html.replace('<div class="hero-design-portal" aria-hidden="true">', '<div class="hero-design-portal">');
fs.writeFileSync(file, html);
