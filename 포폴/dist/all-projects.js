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
  hub.innerHTML = `<div class="all-projects-heading"><span>SELECTED WORK</span><h2 id="all-projects-title">ALL PROJECT</h2><p>궁금한 작업을 선택해 살펴보세요.</p></div><div class="project-category-tabs" role="tablist" aria-label="프로젝트 종류">${categories.map((category,index)=>`<div class="project-category"><button type="button" class="project-category-tab" role="tab" id="project-tab-${category.key}" data-project-tab="${category.key}" aria-selected="${index===0}" tabindex="${index===0?0:-1}" aria-describedby="project-tab-description-${category.key}"><span class="project-category-number">0${index+1}</span><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${category.icon}</svg><strong>${category.label.replace(' PROJECT','<br>PROJECT')}</strong><span class="project-category-arrow" aria-hidden="true">↘</span></button><p id="project-tab-description-${category.key}">${category.description}</p></div>`).join('')}</div>`;
  team.before(hub);
  const personalItems = [...document.querySelectorAll('.personal-case')];
  const personal = document.createElement('div');
  personal.id = 'personal-projects';
  if (personalItems[0]) personalItems[0].before(personal);
  personalItems.forEach(item=>personal.append(item));
  const movie = document.querySelector('.section-movie');
  const clone = document.querySelector('.section-admissions');
  clone.id = 'clone-projects';
  const panels = {team, personal, movie, clone};
  const buttons = [...hub.querySelectorAll('[role="tab"]')];
  Object.entries(panels).forEach(([key,panel])=>{
    panel.classList.add('all-project-panel');
    panel.setAttribute('role','tabpanel');
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
    Object.entries(panels).forEach(([name,panel])=>{ panel.hidden=name!==key; });
    buttons.forEach(button=>{
      const selected=button.dataset.projectTab===key;
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex=selected?0:-1;
    });
    document.body.dataset.projectCategory=key;
    if (userAction && hub.getBoundingClientRect().top < -hub.offsetHeight/2) {
      hub.scrollIntoView({behavior:'instant',block:'start'});
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
  // Existing navigation links also select the right category before scrolling.
  const hashCategory = hash => {
    if (['#projects','#all-projects','#mejiro-data'].includes(hash)) return 'team';
    if (['#personal-projects','#personal-luma','#personal-onda'].includes(hash)) return 'personal';
    if (hash==='#movie') return 'movie';
    if (['#admissions','#clone-projects'].includes(hash)) return 'clone';
    return null;
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if (!link) return;
    const key=hashCategory(link.getAttribute('href'));
    if (!key) return;
    select(key);
    if (link.hash==='#mejiro-data') { event.preventDefault(); hub.scrollIntoView({behavior:'smooth'}); }
  },true);
  // The research slides remain available without consuming six screens of scroll.
  select(hashCategory(location.hash)||'team');
  addEventListener('load',refresh,{once:true});
})();
