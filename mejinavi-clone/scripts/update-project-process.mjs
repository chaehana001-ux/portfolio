import fs from 'node:fs';
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const start=html.indexOf(' <article class="project-case"');
const end=html.indexOf('</article>',start)+10;
if(start<0||end<start)throw new Error('Project case not found');
const cells=[['01 · PROBLEM','원하는 향을 온라인에서 찾기 어려움'],['02 · CUSTOMER','취향에 맞는 향을 탐색하는 고객'],['03 · VALUE','직관적인 향 탐색과 브랜드 경험'],['04 · SOLUTION','향 계열·컬렉션 중심의 정보 구성'],['05 · CHANNEL','반응형 웹사이트'],['06 · VALIDATION','탐색 흐름과 정보 이해도 확인']].map(([title,body])=>`<div><h5>${title}</h5><p>${body}</p></div>`).join('');
const article=` <article class="project-case project-process" aria-labelledby="diptyque-title">
 <div class="project-process-visual">
  <span class="project-sticker">IDEA<br>TO DESIGN</span>
  <div class="process-sheet process-canvas"><div class="process-sheet-bar"><span aria-hidden="true">● ● ●</span><span>01 · PLANNING</span></div><div class="process-sheet-content"><small>DIPTYQUE RENEWAL · 향수병동</small><h4>Lean Canvas</h4><p class="process-sheet-sub">브랜드의 감각을, 더 쉬운 탐색으로.</p><div class="lean-canvas-grid">${cells}</div><span class="process-sheet-foot">PROJECT PLANNING · CONCEPT</span></div></div>
  <div class="process-sheet process-persona"><div class="process-sheet-bar">02 · PERSONA</div><div class="process-sheet-content"><h4>취향을 찾는 탐색자</h4><p>향의 분위기와 특징을 비교하고,<br>나에게 맞는 향을 찾고 싶은 고객</p><span class="process-mini-tag">NEEDS · 명확한 제품 정보</span></div></div>
  <div class="process-sheet process-requirements"><div class="process-sheet-bar">03 · REQUIREMENTS</div><div class="process-sheet-content"><h4>탐색의 기준</h4><ul><li>향 계열과 컬렉션 분류</li><li>제품 특징과 정보 위계</li><li>일관된 화면과 이동 흐름</li></ul></div></div>
 </div>
 <div class="project-details">
  <div class="project-index"><span>01</span><small>TEAM PROJECT / PROCESS</small></div>
  <p class="project-type">DIPTYQUE renewal · UX 기획 방법론</p>
  <h3 id="diptyque-title">LEAN CANVAS <em>methodology</em></h3>
  <div class="project-team"><span>TEAM NAME</span><strong>향수병동</strong></div>
  <div class="project-brief"><h4>DESIGN METHODOLOGY</h4><p>린캔버스는 사용자 문제와 핵심 가치, 해결 방향을 한 장으로 정리하는 기획 방법입니다. 딥티크 리뉴얼에서는 <strong>향과 제품을 탐색하는 과정</strong>을 중심으로, 브랜드의 감성과 직관적인 정보 구성을 함께 고민합니다.</p></div>
  <div class="project-concept"><h4>DIPTYQUE RENEWAL CONCEPT</h4><dl><div><dt>문제 가설</dt><dd>온라인에서 취향에 맞는 향을 찾기 어려움</dd></div><div><dt>핵심 사용자</dt><dd>향과 라이프스타일을 탐색하는 고객</dd></div><div><dt>핵심 가치</dt><dd>명확하고 직관적인 제품 탐색</dd></div><div><dt>해결 방향</dt><dd>향 계열·컬렉션 중심의 구조 정리</dd></div></dl><p class="project-concept-note">린캔버스와 자료는 기획 방향을 보여주는 예시입니다.</p></div>
  <div class="project-preview-tags process-tags"><span>LEAN CANVAS</span><span>UX PLANNING</span><span>TEAM PROJECT</span></div>
  <div class="project-link-slots"><span>REFERENCE <small>준비 중</small></span></div>
 </div>
</article>`;
html=html.slice(0,start)+article+html.slice(end);
fs.writeFileSync(file,html);
