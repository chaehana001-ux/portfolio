(() => {
  'use strict';
  document.body.classList.add('has-project-tabs');
  const team = document.querySelector('.portfolio-projects');
  if (!team) return;
  const categories = [
    {key:'team',label:'TEAM PROJECT',description:'함께 기획하고 완성한 웹사이트',icon:'<rect x="12" y="17" width="56" height="38" rx="6"/><path d="M8 63h64M31 55v8M49 55v8"/><circle cx="32" cy="33" r="5"/><circle cx="49" cy="33" r="5"/><path d="M23 46c0-9 18-9 18 0m0 0c0-9 18-9 18 0"/>'},
    {key:'personal',label:'PERSONAL PROJECT',description:'나만의 시선으로 만든 브랜드 경험',icon:'<rect x="15" y="14" width="50" height="52" rx="7"/><path d="M15 27h50M23 21h1m6 0h1M25 38h29M25 47h18M25 56h24"/>'},
    {key:'movie',label:'MOVIE',description:'이야기를 움직임으로 담은 영상',icon:'<rect x="12" y="20" width="56" height="42" rx="8"/><path d="m34 31 18 10-18 10Z"/>'},
    {key:'clone',label:'CLONE CODING',description:'관찰하고 코드로 재현한 웹사이트',icon:'<rect x="10" y="18" width="60" height="44" rx="7"/><path d="m29 32-9 8 9 8m22-16 9 8-9 8M44 29l-8 22"/>'}
  ];
  const hub = document.createElement('section');
  hub.className = 'all-projects';
  hub.id = 'all-projects';
  hub.setAttribute('aria-labelledby','all-projects-title');
  hub.innerHTML = `<div class="all-projects-heading"><span>SELECTED WORK</span><h2 id="all-projects-title">ALL PROJECT</h2><p>스크롤로 모든 작업을 살펴보거나 원하는 작업으로 바로 이동하세요.</p></div><div class="project-category-tabs" role="navigation" aria-label="프로젝트 종류">${categories.map((category,index)=>`<div class="project-category"><button type="button" class="project-category-tab"  id="project-tab-${category.key}" data-project-tab="${category.key}" aria-describedby="project-tab-description-${category.key}"><span class="project-category-number">0${index+1}</span><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${category.icon}</svg><strong>${category.label.replace(' PROJECT','<br>PROJECT')}</strong></button><p id="project-tab-description-${category.key}">${category.description}</p></div>`).join('')}</div>`;
  team.before(hub);
  const personalItems = [...document.querySelectorAll('.personal-case')];
  const personal = document.createElement('div');
  personal.id = 'personal-projects';
  if (personalItems[0]) personalItems[0].before(personal);
  personalItems.forEach(item=>personal.append(item));
  const personalHeading = document.createElement('header');
  personalHeading.className = 'team-personal-heading personal-details-heading';
  personalHeading.innerHTML = '<div class="team-intro-eyebrow personal-project-eyebrow project-sparkle-label"><span class="gallery-label-sparkle project-label-sparkle" aria-hidden="true"><svg viewBox="0 0 90 90" aria-hidden="true" focusable="false"><path d="M45 15Q48 43 75 46Q48 49 45 77Q42 49 15 46Q42 43 45 15Z" fill="#f9ecf0" stroke="#c5b0de" stroke-width="3"/><path d="M17 2Q18 15 30 17Q18 19 17 32Q15 19 3 17Q15 15 17 2Z" fill="#e7d7f6" stroke="#c5b0de" stroke-width="1.5"/><circle cx="76" cy="72" r="5" fill="#e2cdef"/><circle cx="85" cy="84" r="2.5" fill="#f4dfce"/></svg></span><span class="project-label-number">02</span><span class="project-label-name">PERSONAL PROJECT <span lang="ko">개인 프로젝트</span></span><span class="gallery-label-sparkle project-label-sparkle gallery-label-sparkle-right" aria-hidden="true"><svg viewBox="0 0 90 90" aria-hidden="true" focusable="false"><path d="M45 15Q48 43 75 46Q48 49 45 77Q42 49 15 46Q42 43 45 15Z" fill="#f9ecf0" stroke="#c5b0de" stroke-width="3"/><path d="M17 2Q18 15 30 17Q18 19 17 32Q15 19 3 17Q15 15 17 2Z" fill="#e7d7f6" stroke="#c5b0de" stroke-width="1.5"/><circle cx="76" cy="72" r="5" fill="#e2cdef"/><circle cx="85" cy="84" r="2.5" fill="#f4dfce"/></svg></span></div><h3 id="personal-details-title">PERSONAL PROJECT</h3><p>브랜드의 인상을 화면과 인터랙션으로 풀어낸 두 개의 개인 웹 프로젝트입니다.</p>';
  personal.prepend(personalHeading);
  // Separate copy reserved for the work explanation above personal projects.
  const workExplanation = personal.cloneNode(true);
  workExplanation.id = 'work-explanation';
  workExplanation.querySelectorAll('.personal-case').forEach(project => project.remove());
  workExplanation.querySelector('h3').textContent = 'MY WORK';
  workExplanation.querySelector('.project-label-name').innerHTML = 'MY WORK <span lang="ko">작업 소개</span>';
  workExplanation.querySelector('.project-label-number')?.remove();
  workExplanation.querySelector('.personal-details-heading > p').textContent = '딥티크 팀 프로젝트에서 직접 디자인한 페이지를 소개합니다.';
  const designedPages = [
    {label:'컬렉션 소개', image:'./assets/img/portfolio/work-collection-intro.jpg', continuation:'./assets/img/portfolio/work-collection-categories.jpg', title:'향에서 일상으로 이어지는 브랜드 탐색', description:'향수와 익스클루시브 컬렉션에서 캔들·홈, 배스·바디, 홈 데코까지 이어지는 하나의 소개 페이지입니다.', point:'큰 제품 이미지와 간결한 이야기로 시작하고, 아래에서는 이미지와 설명을 교차 배치해 다양한 제품군을 자연스럽게 탐색하도록 디자인했습니다.'},
    {label:'장바구니 · 담김', image:'./assets/img/portfolio/work-cart-filled.jpg', title:'주문 정보를 한눈에', description:'담은 제품과 수량, 가격을 확인하고 주문을 이어가는 장바구니 화면입니다.', point:'제품 목록과 주문 요약을 분리하고, 종이 질감과 식물 일러스트로 브랜드의 감성을 더했습니다.'},
    {label:'장바구니 · 비어 있음', image:'./assets/img/portfolio/work-cart-empty.jpg', title:'빈 화면에도 다음 행동을', description:'장바구니에 제품이 없을 때 보여주는 안내 화면입니다.', point:'쇼핑백 일러스트와 짧은 안내, Shop Now 버튼을 중심에 모아 다시 상품을 둘러보도록 구성했습니다.'},
    {label:'상품문의', image:'./assets/img/portfolio/work-inquiries.jpg', title:'찾기 쉽고 구분하기 쉬운 문의', description:'상품 관련 질문을 찾아보고 답변 상태를 확인하는 목록 화면입니다.', point:'공개 여부 필터와 검색창을 배치하고, 자물쇠 아이콘과 상태 표시로 문의 정보를 구분했습니다.'},
    {label:'문의 상세', image:'./assets/img/portfolio/work-inquiry-detail.jpg', title:'질문과 답변을 명확하게', description:'선택한 문의의 내용과 브랜드의 답변을 확인하는 상세 화면입니다.', point:'질문과 답변 영역을 나누고 답변에 은은한 배경색을 더해, 정보의 흐름과 읽는 순서를 정리했습니다.'},
    {label:'1:1 문의', image:'./assets/img/portfolio/work-contact.jpg', title:'문의 작성부터 고객센터 안내까지', description:'문의 내용을 작성하고 고객센터 정보를 함께 확인하는 페이지입니다.', point:'입력 폼과 고객센터 안내를 나란히 배치하고, 필수 항목과 첨부파일 영역을 순서대로 정리했습니다.'}
  ];
  const designShowcase = document.createElement('div');
  designShowcase.className = 'work-design-showcase';
  designShowcase.innerHTML = `<nav class="work-design-choices" aria-label="직접 디자인한 페이지 선택">${designedPages.map((page,index)=>`<button type="button" data-design-page="${index}" aria-pressed="${index===0}">${page.label}</button>`).join('')}</nav><div class="work-design-layout"><figure class="work-design-preview"><div class="work-design-scroll" tabindex="0" role="region" aria-label="디자인 화면 미리보기, 스크롤하여 전체 보기"><img src="${designedPages[0].image}" alt="${designedPages[0].label} 직접 디자인한 화면" loading="lazy" decoding="async"></div><figcaption><span class="work-design-caption">01 / COLLECTION</span><span>스크롤하여 전체 화면 보기</span></figcaption></figure><div class="work-design-copy" aria-live="polite" aria-atomic="true"><span class="work-design-kicker">DIPTYQUE · MY DESIGN</span><h3></h3><p class="work-design-description"></p><div class="work-design-point"><h4>디자인 포인트</h4><p></p></div><span class="work-design-credit">담당 작업 · 페이지 UI 디자인</span></div></div>`;
  const showDesign = index => {
    const page = designedPages[index];
    designShowcase.querySelectorAll('[data-design-page]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.designPage)===index)));
    const preview = designShowcase.querySelector('.work-design-preview img');
    preview.src = page.image;
    preview.alt = page.label + ' 직접 디자인한 화면';
    designShowcase.querySelector('.work-design-continuation')?.remove();
    if (page.continuation) {
      const continuation = document.createElement('img');
      continuation.className = 'work-design-continuation';
      continuation.src = page.continuation;
      continuation.alt = '컬렉션 소개에 이어지는 캔들·홈, 배스·바디, 홈 데코 제품 카테고리 디자인';
      continuation.decoding = 'async';
      continuation.loading = 'eager';
      preview.after(continuation);
    }
    designShowcase.querySelector('.work-design-scroll').scrollTop = 0;
    designShowcase.querySelector('.work-design-caption').textContent = String(index+1).padStart(2,'0') + ' / ' + page.label;
    designShowcase.querySelector('.work-design-copy h3').textContent = page.title;
    designShowcase.querySelector('.work-design-description').textContent = page.description;
    designShowcase.querySelector('.work-design-point p').textContent = page.point;
    designShowcase.dispatchEvent(new Event('design-preview-change'));

  };
  designShowcase.querySelectorAll('[data-design-page]').forEach(button => button.addEventListener('click',()=>showDesign(Number(button.dataset.designPage))));
  showDesign(0);
  workExplanation.append(designShowcase);
  const designScroller = designShowcase.querySelector('.work-design-scroll');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayButton = document.createElement('button');
  autoplayButton.type = 'button';
  autoplayButton.className = 'work-design-autoplay';
  designShowcase.querySelector('figcaption > span:last-child').textContent = '직접 스크롤해서 볼 수도 있어요';
  designShowcase.querySelector('figcaption').append(autoplayButton);
  let designAutoplay = !motionPreference.matches;
  let designVisible = false;
  let designPointerDown = false;
  let designFrame = 0;
  let designPreviousTime = 0;
  let designPosition = 0;
  let designHoldUntil = performance.now() + 1400;
  let designAtEnd = false;
  const updateAutoplayButton = () => {
    autoplayButton.textContent = designAutoplay ? '자동 스크롤 일시정지' : '자동 스크롤 재생';
  };
  const runDesignScroll = now => {
    designFrame = 0;
    const elapsed = designPreviousTime ? Math.min(now - designPreviousTime, 64) : 0;
    designPreviousTime = now;
    if (designPointerDown || now < designHoldUntil) {
      designPosition = designScroller.scrollTop;
    } else {
      const bottom = designScroller.scrollHeight - designScroller.clientHeight;
      const loading = [...designScroller.querySelectorAll('img')].some(img => !img.complete);
      if (bottom > 1 && !loading) {
        if (designAtEnd) {
          designScroller.scrollTop = 0;
          designPosition = 0;
          designAtEnd = false;
          designHoldUntil = now + 1400;
        } else {
          designPosition = Math.min(bottom, designPosition + elapsed * .032);
          designScroller.scrollTop = designPosition;
          if (designPosition >= bottom) {
            designAtEnd = true;
            designHoldUntil = now + 2200;
          }
        }
      }
    }
    designFrame = requestAnimationFrame(runDesignScroll);
  };
  const syncDesignAutoplay = () => {
    cancelAnimationFrame(designFrame);
    designFrame = 0;
    designPreviousTime = 0;
    designPosition = designScroller.scrollTop;
    if (designAutoplay && designVisible && !document.hidden) {
      designFrame = requestAnimationFrame(runDesignScroll);
    }
  };
  const pauseForManualScroll = () => {
    designHoldUntil = performance.now() + 4500;
    designAtEnd = false;
    designPosition = designScroller.scrollTop;
  };
  designScroller.addEventListener('wheel', pauseForManualScroll, {passive: true});
  designScroller.addEventListener('touchmove', pauseForManualScroll, {passive: true});
  designScroller.addEventListener('pointerdown', () => {
    designPointerDown = true;
    pauseForManualScroll();
  });
  const releaseDesignPointer = () => {
    if (!designPointerDown) return;
    designPointerDown = false;
    pauseForManualScroll();
  };
  window.addEventListener('pointerup', releaseDesignPointer);
  window.addEventListener('pointercancel', releaseDesignPointer);
  window.addEventListener('blur', releaseDesignPointer);
  designScroller.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) pauseForManualScroll();
  });
  autoplayButton.addEventListener('click', () => {
    designAutoplay = !designAutoplay;
    designHoldUntil = performance.now() + 600;
    updateAutoplayButton();
    syncDesignAutoplay();
  });
  designShowcase.addEventListener('design-preview-change', () => {
    designAtEnd = false;
    designPosition = 0;
    designHoldUntil = performance.now() + 1400;
    syncDesignAutoplay();
  });
  new IntersectionObserver(([entry]) => {
    designVisible = entry.isIntersecting;
    designHoldUntil = performance.now() + 1400;
    syncDesignAutoplay();
  }, {threshold: .2}).observe(designScroller);
  document.addEventListener('visibilitychange', syncDesignAutoplay);
  motionPreference.addEventListener('change', () => {
    designAutoplay = !motionPreference.matches;
    updateAutoplayButton();
    syncDesignAutoplay();
  });
  updateAutoplayButton();
  const copiedIds = new Map();
  workExplanation.querySelectorAll('[id]').forEach(element => {
    const originalId = element.id;
    element.id = 'work-explanation-' + originalId;
    copiedIds.set(originalId, element.id);
  });
  workExplanation.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], a[href^="#"]').forEach(element => {
    ['aria-labelledby', 'aria-describedby', 'aria-controls'].forEach(attribute => {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map(id => copiedIds.get(id) || id).join(' '));
      }
    });
    const href = element.getAttribute('href');
    if (href && copiedIds.has(href.slice(1))) element.setAttribute('href', '#' + copiedIds.get(href.slice(1)));
  });
  workExplanation.setAttribute('role', 'region');
  workExplanation.setAttribute('aria-labelledby', 'work-explanation-personal-details-title');
  personal.before(workExplanation);
  const movie = document.querySelector('.section-movie');
  const movieList = movie?.querySelector('.portfolio-movies');
  if (movieList) {
    movieList.classList.add('movie-carousel');
    movieList.tabIndex = 0;
    movieList.setAttribute('aria-label', '영상 프로젝트 카드, 좌우 방향키로 이동');
    const movieCards = [...movieList.children];
    const movieNavigation = document.createElement('nav');
    movieNavigation.className = 'movie-carousel-nav';
    movieNavigation.setAttribute('aria-label', '영상 프로젝트 이동');
    movieNavigation.innerHTML = '<span>옆으로 넘겨 다른 영상 보기</span><div><button type="button" data-movie-prev aria-label="이전 영상 카드">←</button><span class="movie-carousel-status" aria-live="polite"></span><button type="button" data-movie-next aria-label="다음 영상 카드">→</button></div>';
    movieList.before(movieNavigation);
    const previous = movieNavigation.querySelector('[data-movie-prev]');
    const next = movieNavigation.querySelector('[data-movie-next]');
    const status = movieNavigation.querySelector('.movie-carousel-status');
    let movieIndex = 0;
    const updateMovieNavigation = () => {
      const left = movieList.getBoundingClientRect().left;
      movieIndex = movieCards.reduce((nearest, card, index) => Math.abs(card.getBoundingClientRect().left - left) < Math.abs(movieCards[nearest].getBoundingClientRect().left - left) ? index : nearest, 0);
      previous.disabled = movieList.scrollLeft <= 1;
      next.disabled = movieList.scrollLeft >= movieList.scrollWidth - movieList.clientWidth - 1;
      const label = String(movieIndex + 1).padStart(2, '0') + ' / ' + String(movieCards.length).padStart(2, '0');
      if (status.textContent !== label) status.textContent = label;
    };
    const moveMovie = direction => {
      const card = movieCards[Math.max(0, Math.min(movieCards.length - 1, movieIndex + direction))];
      const left = movieList.scrollLeft + card.getBoundingClientRect().left - movieList.getBoundingClientRect().left;
      movieList.scrollTo({left, behavior: motionPreference.matches ? 'instant' : 'smooth'});
    };
    previous.addEventListener('click', () => moveMovie(-1));
    next.addEventListener('click', () => moveMovie(1));
    movieList.addEventListener('scroll', updateMovieNavigation, {passive: true});
    movieList.addEventListener('keydown', event => {
      if (event.target !== movieList || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      moveMovie(event.key === 'ArrowLeft' ? -1 : 1);
    });
    new ResizeObserver(updateMovieNavigation).observe(movieList);
    updateMovieNavigation();
  }
  const clone = document.querySelector('#clone-coding');
  const panels = {team, personal, movie, clone};
  const buttons = [...hub.querySelectorAll('[data-project-tab]')];
  Object.entries(panels).forEach(([key,panel])=>{
    panel.classList.add('all-project-panel');
    panel.setAttribute('role','region');
    panel.setAttribute('aria-labelledby','project-tab-'+key);
    panel.setAttribute('tabindex','0');
    hub.querySelector('[data-project-tab="'+key+'"]').setAttribute('aria-controls',panel.id);
  });
  const refresh = () => {
    dispatchEvent(new Event('resize'));
    document.querySelectorAll('.swiper').forEach(element=>{
      if (element.getClientRects().length) element.swiper?.update();
    });
    window.ScrollTrigger?.refresh();
  };
  const select = (key, userAction=false) => {
    Object.values(panels).forEach(panel=>{ panel.hidden=false; });
    const cloneIntro = document.querySelector('.clone-studies');
    if (cloneIntro) cloneIntro.hidden = false;
    buttons.forEach(button=>{
      const selected=button.dataset.projectTab===key;
      if (selected) button.setAttribute('aria-current','location');
      else button.removeAttribute('aria-current');
      button.tabIndex=0;
    });
    document.body.dataset.projectCategory=key;
    if (userAction) {
      panels[key].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    }
    requestAnimationFrame(()=>{refresh();requestAnimationFrame(refresh);});
  };
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>select(button.dataset.projectTab,true));
    button.addEventListener('keydown',event=>{
      let next=index;
      if (event.key==='ArrowRight') next=(index+1)%buttons.length;
      else if (event.key==='ArrowLeft') next=(index+buttons.length-1)%buttons.length;
      else if (event.key==='Home') next=0;
      else if (event.key==='End') next=buttons.length-1;
      else return;
      event.preventDefault();buttons[next].focus();select(buttons[next].dataset.projectTab);
    });
  });
  // Keep every project visible when using section navigation.
  const hashCategory = hash => {
    if (['#projects','#all-projects'].includes(hash)) return 'team';
    if (['#personal-projects','#personal-luma','#personal-onda'].includes(hash)) return 'personal';
    if (hash==='#movie') return 'movie';
    if (['#admissions','#clone-projects','#clone-coding'].includes(hash)) return 'clone';
    return null;
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if (!link) return;
    const key=hashCategory(link.getAttribute('href'));
    if (!key) return;
    select(key);
  },true);
  // All project categories are visible from the initial page load.
  select(hashCategory(location.hash)||'team');
  document.dispatchEvent(new CustomEvent('portfolio:sections-ready'));
  addEventListener('load',refresh,{once:true});
})();
