(() => {
  'use strict';
  const research = document.querySelector('.project-walkthrough');
  if (!research) return;
  const image = './assets/img/portfolio/diptyque-planet-main.png';
  const detailImage = './assets/img/portfolio/diptyque-planet-detail.png';
  const homeImage = './assets/img/portfolio/diptyque-live-home.png';
  const shot = (alt, className = '', src = image) => `<img class="${className}" src="${src}" alt="${alt}" loading="lazy">`;
  const laptop = (alt, src = image) => `<div class="case-macbook story-unified-laptop"><div class="case-macbook-display"><div class="case-macbook-screen">${shot(alt, '', src)}</div></div><div class="case-macbook-base" aria-hidden="true"></div></div>`;
  const slides = [
    {
      title: 'DIPTYQUE <em>brand experience</em>',
      en: 'A team redesign connecting Diptyque’s fragrances, stories and inspiration from nature.',
      ko: '팀은 딥티크의 향과 브랜드 이야기를 온라인에서 감각적으로 경험할 수 있도록 사이트를 리디자인했습니다. 브랜드 스토리와 제품 탐색, 아침과 저녁의 케어 리추얼이 하나의 흐름으로 이어지도록 정보 구조와 비주얼 방향, 반응형 화면을 함께 설계하고 구현했습니다.',
      visual: `<div class="team-device-stage"><div class="case-macbook team-desktop-device"><div class="case-macbook-display"><div class="case-macbook-screen team-preview-screen" data-device-width="1440"><iframe class="team-device-preview" src="./team-preview.html" title="딥티크 메인페이지 PC 3초 자동 스크롤" width="1440" height="930" loading="lazy" allow="autoplay"></iframe></div></div><div class="case-macbook-base" aria-hidden="true"></div></div><div class="team-iphone" aria-label="iPhone 17 Pro 모바일 미리보기"><div class="team-iphone-screen team-preview-screen" data-device-width="402"><iframe class="team-device-preview" src="./team-preview.html" title="딥티크 메인페이지 모바일 3초 자동 스크롤" width="402" height="874" loading="lazy" allow="autoplay"></iframe></div><span class="team-iphone-island" aria-hidden="true"></span><span class="team-iphone-home" aria-hidden="true"></span></div></div>`
    },
    {
      title: 'FOR THE PLANET <em>our commitment</em>',
      en: 'Making Diptyque’s commitment to nature visible through an immersive page experience.',
      ko: 'For The Planet은 딥티크의 지속가능성, 원료와 생산 과정, 환경·사회적 책임을 소개하는 페이지입니다. 자연을 담은 이미지와 브랜드 메시지가 이어지도록 담당 페이지의 화면을 구성했습니다.',
      visual: laptop('For The Planet 페이지 첫 화면')
    },
    {
      title: 'CONTENT <em>with purpose</em>',
      en: 'Connecting ingredients, responsible production and environmental impact into one story.',
      ko: '지속가능한 생산과 원료의 출처, 환경·사회에 미치는 영향을 하나의 이야기로 연결했습니다. 긴 설명도 주제별로 나누고 이미지와 함께 배치해 브랜드의 실천을 차례로 살펴볼 수 있도록 구성했습니다.',
      visual: laptop('For The Planet 스크롤 콘텐츠 화면', detailImage)
    },
    {
      title: 'SCROLL <em>interaction</em>',
      en: 'Letting scroll reveal the page, its imagery and the stories behind each commitment.',
      ko: '스크롤에 따라 이미지와 텍스트가 등장하고 장면이 확장되는 인터랙션을 구현했습니다. 움직임의 순서와 속도를 조정하며 메시지를 읽는 흐름과 시각적인 전개가 자연스럽게 이어지도록 다듬었습니다.',
      visual: laptop('스크롤로 전개되는 For The Planet 페이지', detailImage)
    },
    {
      title: '<em>What I do</em>',
      en: 'My contribution: the For The Planet page.',
      ko: '딥티크 리디자인 팀 프로젝트에서 For The Planet 페이지를 담당했습니다.',
      visual: laptop('직접 담당한 For The Planet 페이지'),
      extra: `<div class="zara-story-role-list"><div><h4>페이지 구성과 콘텐츠 배치</h4><p>지속가능성 메시지와 관련 이미지를 배치하고 주제별 콘텐츠가 이어지는 화면을 구성했습니다.</p></div><div><h4>스크롤 인터랙션 구현</h4><p>이미지·텍스트의 등장과 장면 전개를 구현하고, 읽는 흐름에 맞춰 움직임을 조정했습니다.</p></div><div><h4>반응형과 팀 작업 연결</h4><p>화면 크기에 따라 크기와 간격을 조정하고, 팀의 공통 스타일과 메뉴 연결을 확인했습니다.</p></div></div>`
    },
    {
      title: '<em>better</em> TOGETHER',
      en: 'Through collaboration, I learned that great design is built on communication and shared ideas. Together, we refined every detail to achieve the best possible outcome.',
      ko: 'For The Planet 페이지를 작업하며 팀원들과 공통 스타일과 화면 연결을 확인했습니다. 각자 맡은 페이지가 하나의 딥티크 사이트로 이어지도록 의견을 나누었고, 소통과 협업이 완성도를 높이는 과정임을 배웠습니다.',
      visual: `<div class="collaboration-photos" aria-label="협업 사진 준비 영역"><div class="collaboration-photo collaboration-photo-main"><span>PHOTO 01</span><small>함께 작업한 순간</small></div><div class="collaboration-photo collaboration-photo-sub"><span>PHOTO 02</span><small>생각을 나누는 과정</small></div></div>`
    }
  ];
  const story = document.createElement('section');
  story.className = 'zara-story';
  story.setAttribute('aria-label', '딥티크 리디자인과 For The Planet 담당 작업');
  story.innerHTML = `<div class="zara-story-sticky"><div class="zara-story-viewport" tabindex="0" role="region" aria-label="딥티크 상세 가로 스크롤"><div class="zara-story-track">${slides.map((slide,index) => `<article class="zara-story-panel" aria-labelledby="zara-story-title-${index}"><div class="zara-story-visual">${slide.visual}</div><div class="zara-story-copy"><span class="zara-story-kicker">TEAM PROJECT · ${String(index+1).padStart(2,'0')} / 06</span><h3 id="zara-story-title-${index}">${slide.title}</h3><p class="zara-story-en" lang="en">${slide.en}</p><p class="zara-story-ko">${slide.ko}</p>${slide.extra || ''}</div></article>`).join('')}</div></div><nav class="zara-story-nav" aria-label="딥티크 상세 이동"><button type="button" data-direction="-1" aria-label="이전 내용">←</button><span class="zara-story-status" aria-live="polite">01 / 06</span><span class="zara-story-hint">SCROLL TO EXPLORE →</span><button type="button" data-direction="1" aria-label="다음 내용">→</button></nav></div>`;
  research.before(story);
  story.querySelectorAll('.team-device-preview').forEach(preview => {
    const screen = preview.closest('.team-preview-screen');
    let visible = false;
    const sync = () => preview.contentWindow?.postMessage({type:'team-preview-visibility',visible:visible&&!document.hidden},location.origin);
    new ResizeObserver(() => screen.style.setProperty('--device-scale',String(screen.clientWidth/Number(screen.dataset.deviceWidth)))).observe(screen);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); },{threshold:.35}).observe(screen);
    preview.addEventListener('load',sync);
    addEventListener('message',event => {
      if(event.origin===location.origin&&event.source===preview.contentWindow&&event.data?.type==='team-preview-ready')sync();
    });
    document.addEventListener('visibilitychange',sync);
  });
  const viewport = story.querySelector('.zara-story-viewport');
  const track = story.querySelector('.zara-story-track');
  const panels = [...story.querySelectorAll('.zara-story-panel')];
  const mode = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  let queued = false;
  let current = -1;
  const usesScrollDrivenStory = () => mode.matches && !story.closest('[hidden]');
  const update = () => {
    queued = false;
    const stride = viewport.clientWidth + 30;
    const travel = stride * (panels.length-1);
    const scrollDriven = usesScrollDrivenStory();
    story.classList.toggle('is-pinned',scrollDriven);
    story.style.height = scrollDriven ? `${innerHeight+travel}px` : '';
    const distance = scrollDriven ? Math.max(0,Math.min(travel,-story.getBoundingClientRect().top)) : viewport.scrollLeft;
    track.style.transform = scrollDriven ? `translate3d(${-distance}px,0,0)` : '';
    const next = Math.max(0,Math.min(panels.length-1,Math.round(distance/stride)));
    if(next!==current){
      current=next;
      story.dataset.activeStory=String(current);
      story.querySelector('.zara-story-status').textContent=`${String(current+1).padStart(2,'0')} / 06`;
      panels.forEach((panel,index)=>panel.classList.toggle('is-current',index===current));
      story.querySelector('[data-direction="-1"]').disabled=current===0;
      story.querySelector('[data-direction="1"]').disabled=current===panels.length-1;
    }
  };
  const queue = () => {if(!queued){queued=true;requestAnimationFrame(update);}};
  const go = index => {
    const next=Math.max(0,Math.min(panels.length-1,index));
    const stride = viewport.clientWidth + 30;
    if(usesScrollDrivenStory()) scrollTo({top:scrollY+story.getBoundingClientRect().top+next*stride,behavior:'smooth'});
    else viewport.scrollTo({left:next*stride,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  story.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>go(current+Number(button.dataset.direction))));
  viewport.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(current+(event.key==='ArrowRight'?1:-1));}
  });
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue);
  viewport.addEventListener('scroll',queue,{passive:true});
  mode.addEventListener('change',()=>{viewport.scrollLeft=0;queue();});
  new ResizeObserver(queue).observe(viewport);
  update();
})();
