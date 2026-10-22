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
  const movie = document.querySelector('.section-movie');
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
