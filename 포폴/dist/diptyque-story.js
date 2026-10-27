(() => {
  'use strict';
  const research = document.querySelector('.project-walkthrough');
  if (!research) return;
  const image = './assets/img/portfolio/diptyque-planet-main.png';
  const detailImage = './assets/img/portfolio/diptyque-planet-detail.png';
  const homeImage = './assets/img/portfolio/diptyque-live-home.png';
  const shot = (alt, className = '', src = image) => `<img class="${className}" src="${src}" alt="${alt}" loading="lazy">`;
  const laptop = (alt, src = image) => `<div class="case-macbook story-unified-laptop"><div class="case-macbook-display"><div class="case-macbook-screen">${shot(alt, '', src)}</div></div><div class="case-macbook-base" aria-hidden="true"></div></div>`;
  const liveLaptop = (title, page = '', mode = 'full') => `<div class="team-device-stage team-device-stage--paired"><div class="case-macbook story-unified-laptop team-desktop-device"><div class="case-macbook-display"><div class="case-macbook-screen team-preview-screen" data-device-width="1440"><iframe class="team-device-preview" src="./team-preview.html${page ? `?page=${page}&mode=${mode}` : ''}" title="${title}" width="1440" height="930" loading="lazy" allow="autoplay"></iframe></div></div><div class="case-macbook-base" aria-hidden="true"></div></div><div class="team-iphone team-iphone--story" aria-label="모바일 미리보기"><div class="team-iphone-screen team-preview-screen" data-device-width="402"><iframe class="team-device-preview" src="./team-preview.html${page ? `?page=${page}&mode=${mode}` : ''}" title="${title} 모바일 화면" width="402" height="874" loading="lazy" allow="autoplay"></iframe></div><span class="team-iphone-island" aria-hidden="true"></span><span class="team-iphone-home" aria-hidden="true"></span></div></div>`;
  const livePlanetPanel = (title, mode) => `<div class="planet-ipad-pro" aria-label="M5 iPad Pro 가로형 목업"><div class="planet-work-preview team-preview-screen" data-device-width="1440"><iframe class="team-device-preview" src="./team-preview.html?page=planet&mode=${mode}" title="${title}" width="1440" height="930" loading="lazy" allow="autoplay"></iframe></div><span class="planet-ipad-camera" aria-hidden="true"></span></div>`;
  const livePlanetDisplay = (title, mode) => `<div class="planet-studio-xdr" aria-label="Apple 디스플레이 목업"><div class="planet-studio-screen planet-work-preview team-preview-screen" data-device-width="1440"><iframe class="team-device-preview" src="./team-preview.html?page=planet&mode=${mode}" title="${title}" width="1440" height="930" loading="lazy" allow="autoplay"></iframe></div><img class="planet-studio-frame" src="./assets/img/portfolio/apple-display-frame.png" alt="" aria-hidden="true" loading="lazy"></div>`;
  const planetWorkShowcase = index => `<div class="planet-work-showcase">
    <span class="diptyque-story-kicker">TEAM PROJECT · ${String(index+1).padStart(2,'0')} / 06</span>
    <header class="planet-work-heading"><h2><strong>MY</strong> contribution</h2><p>딥티크 팀 프로젝트에서 제가 담당한 작업과 디자인 과정입니다.</p></header>
    <article class="planet-work-card planet-work-card--main" aria-labelledby="diptyque-story-title-${index}">
      ${livePlanetDisplay('다람쥐를 클릭하면 도토리가 떨어지는 인터랙션', 'planet-squirrel')}
      <div class="planet-work-copy"><h3 id="diptyque-story-title-${index}">For The Planet 서브페이지 디자인</h3><p>딥티크가 추구하는 지속가능성과 자연을 향한 가치를 브랜드의 감성에 맞게 표현하고자 했습니다.</p><p>자연 이미지와 제품을 조화롭게 배치하고, 브랜드의 철학이 시각적으로 전달될 수 있도록 페이지를 구성했습니다.</p></div>
    </article>
    <article class="planet-work-card">
      <figure class="planet-work-collage"><img src="./assets/img/portfolio/diptyque-planet-collage.png" alt="For The Planet 페이지의 네 가지 주요 화면 콜라주" loading="lazy"></figure>
      <div class="planet-work-copy"><h3>브랜드 감성을 담은 비주얼 구성</h3><p>자연 풍경과 제품 이미지를 조화롭게 배치하여 딥티크 특유의 감각적인 분위기와 자연 친화적인 브랜드 이미지를 표현했습니다.</p></div>
    </article>
    <article class="planet-work-card">
      ${livePlanetPanel('아치형 이미지 확대와 화면 전환 인터랙션', 'planet-arch')}
      <div class="planet-work-copy"><h3>시각적 흐름을 연결하는 인터랙션</h3><p>아치형 이미지 확대와 이미지 전환, 좌우 스와이프 등을 통해 사용자가 콘텐츠를 자연스럽게 탐색할 수 있도록 화면의 움직임을 구성했습니다.</p></div>
    </article>
  </div>`;
  const slides = [
    {
      title: 'BEYOND <em>the SCENT</em>',
      en: 'DESIGNING <em>the</em> EXPERIENCE',
      description: 'Connecting fragrance, storytelling, and visual experiences to bring Diptyque’s unique brand world to life.',
      ko: '향을 넘어 브랜드의 이야기를 경험할 수 있도록, 딥티크의 고유한 세계관을 시각적 스토리텔링과 인터랙션으로 풀어냈습니다.',
      visual: `<div class="team-device-stage"><div class="case-macbook team-desktop-device"><div class="case-macbook-display"><div class="case-macbook-screen team-preview-screen" data-device-width="1440"><iframe class="team-device-preview" src="./team-preview.html" title="딥티크 메인페이지 PC 느린 자동 스크롤 반복" width="1440" height="930" loading="lazy" allow="autoplay"></iframe></div></div><div class="case-macbook-base" aria-hidden="true"></div></div><div class="team-iphone" aria-label="iPhone 17 Pro 모바일 미리보기"><div class="team-iphone-screen team-preview-screen" data-device-width="402"><iframe class="team-device-preview" src="./team-preview.html" title="딥티크 메인페이지 모바일 느린 자동 스크롤 반복" width="402" height="874" loading="lazy" allow="autoplay"></iframe></div><span class="team-iphone-island" aria-hidden="true"></span><span class="team-iphone-home" aria-hidden="true"></span></div></div>`
    },
    {
      title: 'VISUAL <em>storytelling</em>',
      en: 'Through expressive visuals and subtle interactions, we bring Diptyque’s fragrance stories to life, turning each moment into an immersive brand experience.',
      ko: '감각적인 비주얼과 섬세한 인터랙션을 통해 딥티크의 향에 담긴 이야기를 시각적으로 풀어내고, 각각의 장면이 하나의 몰입감 있는 브랜드 경험으로 이어지도록 구성했습니다.',
      visual: liveLaptop('딥티크 브랜드 히스토리 페이지 느린 자동 스크롤', 'history', 'brand-history')
    },
    {
      title: 'BEFORE &amp; AFTER',
      en: 'We connected previously fragmented product information, brand stories, and fragrance discovery into a more cohesive and intuitive digital experience.',
      ko: '기존에 분리되어 있던 제품 정보와 브랜드 스토리, 향 탐색 경험을 하나의 흐름으로 연결하여 딥티크만의 브랜드 감성을 자연스럽게 경험할 수 있도록 구성했습니다.',
      visual: liveLaptop('딥티크 갤러리 페이지 주요 장면 느린 자동 스크롤', 'gallery', 'flow')
    },
    {
      title: 'SENSORY <em>design</em>',
      en: 'Through botanical imagery, delicate illustrations, and layered visual compositions, we translated Diptyque’s fragrance stories into an expressive and immersive digital experience.',
      ko: '자연에서 영감을 받은 이미지와 섬세한 일러스트, 감각적인 화면 구성을 통해 딥티크의 향에 담긴 이야기를 시각적으로 표현하고, 브랜드의 분위기를 더욱 깊이 경험할 수 있도록 디자인했습니다.',
      visual: liveLaptop('딥티크 향 스토리 페이지의 감각적 인터랙션 일부 자동 재생', 'fragrance', 'sensory')
    },
    {
      title: '<em>What I do</em>',
      en: 'My contribution: the For The Planet page.',
      ko: '지속가능한 경영과 책임 있는 원료, 자연을 위한 활동을 담아 딥디크가 추구하는 브랜드의 태도를 보여주도록 구성했어요.',
      visual: liveLaptop('For The Planet 페이지 느린 자동 스크롤 반복', 'planet'),
      extra: `<div class="diptyque-story-role-list"><div><h4>페이지 구성과 콘텐츠 배치</h4><p>지속가능성 메시지와 관련 이미지를 배치하고 주제별 콘텐츠가 이어지는 화면을 구성했습니다.</p></div><div><h4>스크롤 인터랙션 구현</h4><p>이미지·텍스트의 등장과 장면 전개를 구현하고, 읽는 흐름에 맞춰 움직임을 조정했습니다.</p></div><div><h4>반응형과 팀 작업 연결</h4><p>화면 크기에 따라 크기와 간격을 조정하고, 팀의 공통 스타일과 메뉴 연결을 확인했습니다.</p></div></div>`
    },
    {
      title: '<em>better</em> TOGETHER',
      en: 'Through collaboration, I learned that great design is built on communication and shared ideas. Together, we refined every detail to achieve the best possible outcome.',
      ko: 'For The Planet 페이지를 작업하며 팀원들과 공통 스타일과 화면 연결을 확인했습니다. 각자 맡은 페이지가 하나의 딥티크 사이트로 이어지도록 의견을 나누었고, 소통과 협업이 완성도를 높이는 과정임을 배웠습니다.',
      visual: `<div class="collaboration-photos" aria-label="딥티크 팀 프로젝트 협업 사진"><figure class="collaboration-photo collaboration-photo-main"><img src="./assets/img/portfolio/team-collaboration-01.png" alt="팀원들과 노트북 화면을 함께 살펴보며 의견을 나누는 모습" loading="lazy"></figure><figure class="collaboration-photo collaboration-photo-sub"><img src="./assets/img/portfolio/team-collaboration-02.png" alt="딥티크 사용자 분석 화면을 함께 검토하는 모습" loading="lazy"></figure></div>`
    }
  ];
  const story = document.createElement('section');
  story.className = 'diptyque-story';
  story.setAttribute('aria-label', '딥티크 리디자인과 For The Planet 담당 작업');
  story.innerHTML = `<div class="diptyque-story-sticky"><div class="diptyque-story-viewport" tabindex="0" role="region" aria-label="딥티크 상세 가로 스크롤"><div class="diptyque-story-track">${slides.map((slide,index) => index === 4 ? `<section class="diptyque-story-panel diptyque-story-panel--planet-work" aria-labelledby="diptyque-story-title-${index}">${planetWorkShowcase(index)}</section>` : `<article class="diptyque-story-panel" aria-labelledby="diptyque-story-title-${index}"><div class="diptyque-story-visual">${slide.visual}</div><div class="diptyque-story-copy"><span class="diptyque-story-kicker">TEAM PROJECT · ${String(index+1).padStart(2,'0')} / 06</span><h3 id="diptyque-story-title-${index}">${slide.title}</h3><p class="diptyque-story-en" lang="en">${slide.en}</p>${slide.description ? `<p class="diptyque-story-description" lang="en">${slide.description}</p>` : ''}<p class="diptyque-story-ko">${slide.ko}</p>${slide.extra || ''}</div></article>`).join('')}</div></div><nav class="diptyque-story-nav" aria-label="딥티크 상세 이동"><button type="button" data-direction="-1" aria-label="이전 내용">←</button><span class="diptyque-story-status" aria-live="polite">01 / 06</span><span class="diptyque-story-hint">SCROLL TO EXPLORE →</span><button type="button" data-direction="1" aria-label="다음 내용">→</button></nav></div>`;
  research.after(story);
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
  const viewport = story.querySelector('.diptyque-story-viewport');
  const track = story.querySelector('.diptyque-story-track');
  const panels = [...story.querySelectorAll('.diptyque-story-panel')];
  const mode = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  const textReveals = panels.map(panel => {
    const paragraph = panel.querySelector('.diptyque-story-ko, .planet-work-heading > p');
    if (!paragraph) return null;
    const label = paragraph.textContent;
    paragraph.setAttribute('aria-label', label);
    paragraph.textContent = '';
    const characters = Array.from(label, character => {
      const span = document.createElement('span');
      span.className = 'diptyque-story-tone-character';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = character;
      paragraph.append(span);
      return span;
    });
    return {paragraph, characters, progress: -1};
  });
  let queued = false;
  let current = -1;
  let storyInView = false;
  let textHoldTimer = 0;
  let textHoldActive = false;
  const completedTextHolds = new Set();
  const holdKeys = new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);
  const blockTextHoldScroll = event => {
    if (event.type !== 'keydown' || holdKeys.has(event.key)) event.preventDefault();
  };
  const releaseTextHold = () => {
    if (!textHoldActive) return;
    textHoldActive = false;
    clearTimeout(textHoldTimer);
    removeEventListener('wheel',blockTextHoldScroll,{capture:true});
    removeEventListener('touchmove',blockTextHoldScroll,{capture:true});
    removeEventListener('keydown',blockTextHoldScroll,{capture:true});
  };
  const holdAtTextEnd = (index,centerScrollTop) => {
    if (document.documentElement.dataset.progressNavigating === 'true' || textHoldActive || completedTextHolds.has(index) || !usesScrollDrivenStory()) return;
    completedTextHolds.add(index);
    textHoldActive = true;
    textHoldTimer = setTimeout(releaseTextHold,500);
  };
  const usesScrollDrivenStory = () => mode.matches && !story.closest('[hidden]');
  const update = () => {
    queued = false;
    const stride = panels[0].getBoundingClientRect().width + 30;
    const travel = stride * (panels.length-1);
    const scrollDriven = usesScrollDrivenStory();
    story.classList.toggle('is-pinned',scrollDriven);
    if (scrollDriven && viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
    story.style.height = scrollDriven ? `${innerHeight+travel}px` : '';
    const distance = scrollDriven ? Math.max(0,Math.min(travel,-story.getBoundingClientRect().top)) : viewport.scrollLeft;
    track.style.transform = scrollDriven ? `translate3d(${-distance}px,0,0)` : '';
    const position = stride ? distance/stride : 0;
    const storyTop = story.getBoundingClientRect().top;
    textReveals.forEach((reveal,index) => {
      if (!reveal) return;
      const progress = index === 0 && scrollDriven
        ? Math.max(0,Math.min(1,(innerHeight*.3-storyTop)/(innerHeight*.3)))
        : Math.max(0,Math.min(1,(position-(index-.42))/.42));
      const litCount = Math.round(progress*reveal.characters.length);
      reveal.characters.forEach((character,characterIndex) => character.classList.toggle('is-deep',characterIndex<litCount));
      if (storyInView && progress >= .999 && reveal.progress < .999) {
        holdAtTextEnd(index,scrollY+storyTop+index*stride);
      }
      reveal.progress = progress;
    });
    const next = Math.max(0,Math.min(panels.length-1,Math.round(distance/stride)));
    if(next!==current){
      current=next;
      story.dataset.activeStory=String(current);
      story.querySelector('.diptyque-story-status').textContent=`${String(current+1).padStart(2,'0')} / 06`;
      story.querySelector('[data-direction="-1"]').disabled=current===0;
      story.querySelector('[data-direction="1"]').disabled=current===panels.length-1;
    }
    const settled = Math.abs(distance-next*stride) <= Math.max(8,stride*.1);
    panels.forEach((panel,index)=>panel.classList.toggle('is-current',storyInView&&settled&&index===next));
  };
  const queue = () => {if(!queued){queued=true;requestAnimationFrame(update);}};
  const go = index => {
    const next=Math.max(0,Math.min(panels.length-1,index));
    const stride = panels[0].getBoundingClientRect().width + 30;
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
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const entry = entries[0];
      storyInView = entry.isIntersecting && entry.intersectionRatio >= .22;
      if (!storyInView) {
        panels.forEach(panel => panel.classList.remove('is-current'));
        completedTextHolds.clear();
        textReveals.forEach(reveal => { if (reveal) reveal.progress = -1; });
        releaseTextHold();
      }
      queue();
    }, {threshold:[0,.22],rootMargin:'0px 0px -4% 0px'}).observe(viewport);
  } else {
    storyInView = true;
  }
  addEventListener('pagehide',releaseTextHold,{once:true});
  update();
})();
