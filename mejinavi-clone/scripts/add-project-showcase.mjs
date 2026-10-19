import fs from 'node:fs';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const section=`<section class="portfolio-projects" id="projects" lang="ko" aria-labelledby="projects-title">
 <div class="projects-heading"><span class="projects-kicker">SELECTED WORK · 01</span><h2 id="projects-title">PROJECT</h2><p>함께 고민하고, 화면으로 완성한 프로젝트</p></div>
 <article class="project-case" aria-labelledby="diptyque-title">
  <div class="project-preview-side">
   <span class="project-sticker">TEAM<br>PROJECT</span>
   <div class="project-browser" aria-label="딥티크 프로젝트 이미지 교체용 미리보기">
    <div class="project-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>DIPTYQUE · WEB RENEWAL</span></div>
    <div class="diptyque-preview"><span class="diptyque-preview-brand">diptyque<span>PARIS</span></span><div class="diptyque-preview-content"><div><small>FRAGRANCE &amp; EXPERIENCE</small><p>감각으로<br>기억되는 향.</p><span class="preview-rule"></span></div><div class="preview-perfume" aria-hidden="true"><span class="perfume-cap"></span><span class="perfume-body"><span class="perfume-label">diptyque<br><small>PARIS</small></span></span><span class="perfume-shadow"></span></div></div></div>
   </div>
   <p class="project-preview-note">실제 프로젝트 화면이 들어갈 자리입니다.</p>
   <div class="project-preview-tags"><span>WEB RENEWAL</span><span>TEAM 향수병동</span></div>
  </div>
  <div class="project-details">
   <div class="project-index"><span>01</span><small>SELECTED PROJECT</small></div>
   <p class="project-type">딥티크 웹사이트 리뉴얼 · 팀 프로젝트</p>
   <h3 id="diptyque-title">DIPTYQUE <em>renewal</em></h3>
   <div class="project-team"><span>TEAM NAME</span><strong>향수병동</strong></div>
   <div class="project-brief"><h4>PROJECT BRIEF</h4><p>향수 브랜드 <strong>딥티크(DIPTYQUE)</strong>의 웹사이트를 새롭게 구성하는 팀 프로젝트입니다.</p></div>
   <dl class="project-facts"><div><dt>PROJECT TYPE</dt><dd>웹사이트 리뉴얼</dd></div><div><dt>WORK STYLE</dt><dd>팀 프로젝트</dd></div></dl>
   <div class="project-link-slots" aria-label="프로젝트 링크 준비 중"><span>WEBSITE <small>준비 중</small></span><span>PROPOSAL <small>준비 중</small></span></div>
  </div>
 </article>
</section>
`;
const marker='<section class="section-mejiro-data"';
if(!html.includes(marker)||html.includes('id="projects"'))throw new Error('Project insertion target invalid');
html=html.replace(marker,section+marker);
fs.writeFileSync(file,html);
