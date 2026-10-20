import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const columns = [
  [['DESIGN', ['Figma', 'Photoshop', 'Illustrator']], ['WORKFLOW', ['Git', 'GitHub', 'Vercel']]],
  [['FRONTEND', ['HTML', 'CSS', 'SCSS', 'JavaScript', 'React']], ['INTERACTION', ['GSAP', 'ScrollTrigger', 'Scrolla.js']]],
  [['AI TOOLS', ['ChatGPT', 'Gemini', 'Claude']], ['VIDEO', ['Premiere Pro', 'After Effects', 'CapCut']]],
];
const icons = {Figma:'figma',Photoshop:'adobephotoshop',Illustrator:'adobeillustrator',Git:'git',GitHub:'github',Vercel:'vercel',HTML:'html5',CSS:'css3',SCSS:'sass',JavaScript:'javascript',React:'react',GSAP:'greensock',ScrollTrigger:'greensock','Scrolla.js':'javascript',ChatGPT:'openai',Gemini:'googlegemini',Claude:'claude','Premiere Pro':'adobepremierepro','After Effects':'adobeaftereffects',CapCut:'capcut'};
const tools = columns.flatMap(column=>column.flatMap(([, names])=>names));
const logo = name => `<img src="./assets/skill-logos/${icons[name]}.svg" alt="" width="56" height="56" decoding="async">`;
const section = `<section class="section-skills skills-tools skills-scroll" data-global="more-information official-account" id="skills" lang="ko">
<div class="skills-heading"><h2>SKILL</h2><p>디자인을 구상하고 화면으로 구현하는 과정에서 사용하는 도구입니다.</p></div>
<div class="skills-logo-reel" aria-hidden="true"><div class="skills-logo-track">${tools.map((name,index)=>`<div class="skill-logo-box" style="--i:${index}"><div class="skill-logo-face">${logo(name)}<span>${name}</span></div></div>`).join('')}</div></div>
<div class="skills-tool-columns" data-item="panel-container">${columns.map((column,index)=>`<div class="skills-tool-column" data-item="items"><span class="skills-column-number">0${index+1}</span>${column.map(([title,names])=>`<div class="skill-tool-group"><h3>${title}</h3><ul>${names.map(name=>`<li class="skill-tool skill-tool-static">${logo(name)}<span>${name}</span></li>`).join('')}</ul></div>`).join('')}</div>`).join('')}</div>
</section>`;
const start = html.indexOf('<section class="section-skills');
let depth = 0, end = -1;
for (const match of html.slice(start).matchAll(/<\/?section\b[^>]*>/g)) {
  depth += match[0].startsWith('</') ? -1 : 1;
  if (depth === 0) { end = start + match.index + match[0].length; break; }
}
if(end<0) throw Error('Skills closing tag not found');
if(start<0) throw Error('Skills section not found');
html = html.slice(0,start)+section+html.slice(end);
fs.writeFileSync(file,html);
