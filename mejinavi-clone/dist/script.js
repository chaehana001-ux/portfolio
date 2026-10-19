/** Small, editable enhancements layered over the reference animation runtime. */
(() => {
  'use strict';
  const galleryMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const albumCards = [...document.querySelectorAll('.messages-list > .item')].slice(0,8);
  const albumGroups = [];
  albumCards.forEach(card => {
    // Leave the reference runtime's transforms alone; animate a separate wrapper.
    const contents = card.querySelector('.item-contents');
    if (!contents) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'album-card-motion';
    contents.before(wrapper);
    wrapper.append(contents);
  });
  for (let index=0;index<albumCards.length;index+=2) albumGroups.push(albumCards.slice(index,index+2));
  const albumEntrance = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const group = albumGroups.find(cards => cards[0]===entry.target);
      if (!group) return;
      albumEntrance.unobserve(entry.target);
      const boxes = group.map(card => card.getBoundingClientRect());
      const centerX = boxes.reduce((sum,box)=>sum+box.left+box.width/2,0)/boxes.length;
      group.forEach((card,index) => {
        const wrapper = card.querySelector('.album-card-motion');
        wrapper.classList.add('album-dealt');
        if (galleryMotion.matches) return;
        const box = boxes[index];
        const x = centerX-box.left-box.width/2;
        wrapper.animate([
          {translate:x+'px 35px',rotate:(index ? 7 : -7)+'deg',scale:'.88',opacity:1},
          {translate:'0px -8px',rotate:(index ? -1 : 1)+'deg',scale:'1',opacity:1,offset:.82},
          {translate:'0px 0px',rotate:'0deg',scale:'1',opacity:1}
        ],{duration:1100,delay:index*100,easing:'cubic-bezier(.22,.75,.2,1)',fill:'backwards'});
      });
    });
  },{threshold:.2});
  albumGroups.forEach(group=>albumEntrance.observe(group[0]));
  const galleryReveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.target.classList.toggle('gallery-in-view',entry.isIntersecting);
  }),{threshold:.12});
  document.querySelectorAll('.messages-list .photo-sample').forEach((card,index)=>{
    const contents=card.querySelector('.item-contents');
    const source=card.querySelector('.img-off picture');
    if(!contents||!source)return;
    const surface=document.createElement('div');surface.className='gallery-photo-surface';
    const backdrop=source.cloneNode(true);backdrop.className='gallery-photo-backdrop';
    backdrop.setAttribute('aria-hidden','true');backdrop.querySelector('img').alt='';
    const picture=source.cloneNode(true);picture.className='gallery-photo-original';
    surface.append(backdrop,picture);contents.append(surface);
    card.style.setProperty('--gallery-delay',(index%4)*90+'ms');
    card.style.setProperty('--gallery-phase',index*-.9+'s');
    galleryReveal.observe(card);
    let frame=0,pointer=null;
    const render=()=>{
      frame=0;
      const box=surface.getBoundingClientRect();
      const x=pointer?(pointer.x-box.left)/box.width-.5:0;
      const y=pointer?(pointer.y-box.top)/box.height-.5:0;
      surface.style.setProperty('--gallery-rx',(-y*5)+'deg');
      surface.style.setProperty('--gallery-ry',(x*5)+'deg');
    };
    card.addEventListener('pointermove',event=>{
      if(galleryMotion.matches||event.pointerType!=='mouse')return;
      pointer={x:event.clientX,y:event.clientY};
      if(!frame)frame=requestAnimationFrame(render);
    });
    card.addEventListener('pointerleave',()=>{pointer=null;if(!frame)frame=requestAnimationFrame(render);});
  });
  document.querySelectorAll('.culita-preview').forEach(preview=>{
    const screen=preview.closest('.culita-preview-screen');
    const width=Number(screen.dataset.previewWidth);
    let visible=false;
    const sync=()=>preview.contentWindow?.postMessage({type:'culita-preview-visibility',visible:visible&&!document.hidden},location.origin);
    new ResizeObserver(()=>screen.style.setProperty('--culita-scale',String(screen.clientWidth/width))).observe(screen);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(screen);
    preview.addEventListener('load',sync);
    addEventListener('message',event=>{
      if(event.origin===location.origin&&event.source===preview.contentWindow&&event.data?.type==='culita-preview-ready') sync();
    });
    document.addEventListener('visibilitychange',sync);
  });
  const brandHeader = document.querySelector('.header');
  if (brandHeader?.querySelector('.hana-brand-logo')) {
    let brandFrame = 0;
    const updateBrand = () => {
      brandFrame = 0;
      const about = document.querySelector('.about-hana')?.getBoundingClientRect();
      const hero = document.querySelector('.hero-creative')?.getBoundingClientRect();
      const portalCopy = document.querySelector('.hero-portal-copy');
      const onAbout = about && about.top < 85 && about.bottom > 85;
      const onHero = hero && hero.top < innerHeight && hero.bottom > 0;
      const onPortal = hero && hero.top <= 85 && hero.bottom > 85 && portalCopy && Number(getComputedStyle(portalCopy).opacity) > .5;
      brandHeader.classList.toggle('hana-brand-dark-surface', Boolean(onAbout));
      brandHeader.classList.toggle('hana-header-on-hero', Boolean(onHero));
    };
    const queueBrand = () => { if (!brandFrame) brandFrame = requestAnimationFrame(updateBrand); };
    addEventListener('scroll',queueBrand,{passive:true});addEventListener('resize',queueBrand);
    updateBrand();
  }
  const creativeHero = document.querySelector('.hero-creative');
  if (creativeHero) {
    const scene = creativeHero.querySelector('.hero-creative-scene');
    const portal = creativeHero.querySelector('.hero-design-portal');
    const intro = creativeHero.querySelector('.hero-introduction');
    const art = creativeHero.querySelector('.hero-art-world') || creativeHero.querySelector('.hero-ideas-art');
    const originalWorld = creativeHero.querySelector('.hero-original-world');
    const copy = creativeHero.querySelector('.hero-portal-copy');
    const figmaWindow = creativeHero.querySelector('.hero-figma-window');
    // One live window contains both the Figma preview and the character introduction.
    figmaWindow.append(copy);
    portal.remove();
    figmaWindow.removeAttribute('aria-hidden');
    figmaWindow.setAttribute('role','button');
    figmaWindow.setAttribute('tabindex','0');
    figmaWindow.setAttribute('aria-label','ABOUT ME 열기');
    const design = figmaWindow.querySelector('.figma-window-design');
    const cursor = document.createElement('span');
    cursor.className = 'hero-click-cursor';
    const cursorVector = document.createElement('object');
    cursorVector.className = 'hero-cursor-vector';
    cursorVector.type = 'image/svg+xml';
    cursorVector.data = './assets/img/figma/cursor.svg';
    cursorVector.setAttribute('tabindex','-1');
    cursor.append(cursorVector);
    cursor.setAttribute('aria-hidden','true');
    const ring = document.createElement('span');
    ring.className = 'hero-click-ring';
    ring.setAttribute('aria-hidden','true');
    scene.append(ring,cursor);
    const cue = creativeHero.querySelector('.hero-scroll-cue');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = value => Math.max(0,Math.min(1,value));
    const smooth = value => value*value*(3-2*value);
    const openAbout = () => {
      const distance=creativeHero.offsetHeight-scene.offsetHeight;
      scrollTo({top:scrollY+creativeHero.getBoundingClientRect().top+distance,behavior:reduced.matches?'instant':'smooth'});
    };
    figmaWindow.addEventListener('click',openAbout);
    figmaWindow.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();openAbout();}
    });
    let queued = false;
    let clickPlayed = false;
    let clickUntil = 0;
    let displayedProgress = 0;
    let lastHeroFrame = performance.now();
    const playHeroClick = now => {
      clickPlayed = true;
      clickUntil = now + 440;
      cursor.animate([
        {transform:'translate(-10%,-10%) scale(1) rotate(0deg)',offset:0},
        {transform:'translate(-10%,-10%) scale(.72) rotate(-8deg)',offset:.22},
        {transform:'translate(-10%,-10%) scale(.72) rotate(-8deg)',offset:.4},
        {transform:'translate(-10%,-10%) scale(1.12) rotate(3deg)',offset:.7},
        {transform:'translate(-10%,-10%) scale(1) rotate(0deg)',offset:1}
      ],{duration:440,easing:'cubic-bezier(.2,.7,.3,1)'});
      figmaWindow.animate([{scale:1},{scale:.965,offset:.25},{scale:1.008,offset:.72},{scale:1}],{duration:440,easing:'ease-out'});
      ring.animate([
        {opacity:0,transform:'translate(-50%,-50%) scale(.3)'},
        {opacity:1,transform:'translate(-50%,-50%) scale(.7)',offset:.25},
        {opacity:0,transform:'translate(-50%,-50%) scale(2.2)'}
      ],{duration:440,easing:'ease-out'});
    };
    const updateHero = () => {
      queued = false;
      const distance = Math.max(1,creativeHero.offsetHeight-scene.offsetHeight);
      const rawProgress = clamp(-creativeHero.getBoundingClientRect().top/distance);
      const now = performance.now();
      const delta = Math.min(.05,(now-lastHeroFrame)/1000);
      lastHeroFrame = now;
      if(rawProgress<.12) { clickPlayed=false;clickUntil=0;cursor.getAnimations().forEach(animation=>animation.cancel()); }
      if(rawProgress>=.18&&!clickPlayed&&!reduced.matches) playHeroClick(now);
      const target = now<clickUntil ? Math.min(rawProgress,.26) : rawProgress;
      displayedProgress = reduced.matches || target<displayedProgress ? target : Math.min(target,displayedProgress+delta*2.8);
      const progress = displayedProgress;
      const zoom = smooth(clamp((progress-.28)/.57));
      const imageWidth = Math.min(art.clientWidth,art.clientHeight*1.5);
      const imageHeight = imageWidth/1.5;
      const baseWidth = imageWidth*.284;
      const baseHeight = baseWidth*.625;
      const baseLeft = art.offsetLeft+(art.clientWidth-imageWidth)/2+imageWidth*.626-baseWidth/2;
      const baseTop = art.offsetTop+(art.clientHeight-imageHeight)/2+imageHeight*.382-baseHeight/2;
      const width = baseWidth+(scene.clientWidth-baseWidth)*zoom;
      const height = baseHeight+(scene.clientHeight-baseHeight)*zoom;
      const press = 0;
      figmaWindow.style.width = width+'px';
      figmaWindow.style.height = height+'px';
      figmaWindow.style.left = baseLeft*(1-zoom)+'px';
      figmaWindow.style.top = baseTop*(1-zoom)+'px';
      figmaWindow.style.transform = 'rotate('+(7*(1-zoom))+'deg) scale('+(1-.018*press)+')';
      figmaWindow.style.borderRadius = (20*(1-zoom))+'px';
      figmaWindow.style.boxShadow = 'inset 0 0 0 '+(2*(1-zoom))+'px var(--palette-navy)';
      design.style.transform = 'scale('+(width/400)+')';
      design.style.opacity = String(1-clamp((progress-.3)/.2));
      const reveal = clamp((progress-.32)/.2);
      copy.style.width = scene.clientWidth+'px';
      copy.style.height = scene.clientHeight+'px';
      copy.style.transform = 'translate(-50%,-50%) scale('+Math.min(width/scene.clientWidth,height/scene.clientHeight)+')';
      copy.style.opacity = String(reveal);
      copy.style.visibility = reveal>0?'visible':'hidden';
      const approach = smooth(clamp(progress/.18));
      const cursorX = baseLeft+baseWidth*(.94-.52*approach);
      const cursorY = baseTop+baseHeight*(.84-.44*approach);
      cursor.style.left = cursorX+'px';
      cursor.style.top = cursorY+'px';
      cursor.style.transform = 'translate(-10%,-10%) scale('+(1-.14*press)+')';
      cursor.style.opacity = String(1-clamp((progress-.28)/.12));
      const ripple = clamp((progress-.2)/.1);
      ring.style.left = cursorX+'px';
      ring.style.top = cursorY+'px';
      ring.style.transform = 'translate(-50%,-50%) scale('+(.4+ripple*1.8)+')';
      ring.style.opacity = String(reduced.matches||progress<.2?0:1-ripple);
      const fade = clamp((progress-.28)/.35);
      intro.style.opacity = String(1-fade);
      art.style.opacity = String(1-fade);
      if(originalWorld) originalWorld.style.opacity = String(1-fade);
      cue.style.opacity = String(1-fade);
      scene.dataset.heroPhase=progress<.18?'cursor':progress<.28?'click':progress<.85?'zoom':'about';
      if(now<clickUntil || Math.abs(displayedProgress-rawProgress)>.001) queueHero();
    };
    const queueHero = () => { if (!queued) { queued = true; requestAnimationFrame(updateHero); } };
    addEventListener('scroll', queueHero, {passive:true});
    addEventListener('resize', queueHero);
    reduced.addEventListener('change', queueHero);
    new ResizeObserver(queueHero).observe(scene);
    updateHero();
  }
  const aboutSection = document.querySelector('.about-hana');
  if (aboutSection && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const pictures = [...aboutSection.querySelectorAll('.about-story-opening .story-picture')];
    const cards = [...aboutSection.querySelectorAll('.about-values .about-value article')];
    if (pictures.length === 3 && cards.length >= 3) {
      const values = aboutSection.querySelector('.about-values');
      const valuesPin = document.createElement('div');
      valuesPin.className = 'about-values-pin';
      values.before(valuesPin);
      valuesPin.append(values);
      const layer = document.createElement('div');
      layer.className = 'about-card-morph-layer';
      layer.setAttribute('aria-hidden','true');
      const opening = aboutSection.querySelector('.about-story-opening');
      const morphs = pictures.map((picture,index) => {
        const morph = cards[index].querySelector('.about-art').cloneNode(true);
        morph.className = 'about-card-morph is-'+(index+1);
        layer.append(morph);
        return morph;
      });
      aboutSection.append(layer);
      aboutSection.classList.add('is-icon-card-stage');
      cards.forEach(card => {
        const back = card.querySelector('.about-value-copy');
        const icon = card.querySelector('.about-art svg');
        if (back && icon) {
          const backIcon = icon.cloneNode(true);
          backIcon.classList.add('about-back-icon');
          back.prepend(backIcon);
        }
      });
      const clamp01 = value => Math.max(0,Math.min(1,value));
      const easeMorph = value => value*value*(3-2*value);
      let flightAnchors = [];
      const measureCardFlight = () => {
        const openingRect = opening.getBoundingClientRect();
        const valuesRect = values.getBoundingClientRect();
        flightAnchors = pictures.map((picture,index) => {
          const source = picture.getBoundingClientRect();
          const target = cards[index].getBoundingClientRect();
          const targetSlot = cards[index].closest('.about-value')?.getBoundingClientRect() || target;
          return {
            start:{
              left:source.left,
              top:source.top-openingRect.top,
              width:source.width,
              height:source.height,
              radius:parseFloat(getComputedStyle(picture).borderRadius)||source.width*.15
            },
            end:{
              left:targetSlot.left,
              top:targetSlot.top-valuesRect.top,
              width:targetSlot.width,
              height:targetSlot.height,
              radius:parseFloat(getComputedStyle(cards[index].querySelector('.about-art')).borderRadius)||20
            }
          };
        });
      };
      let morphFrame = 0;
      const updateCardMorph = () => {
        morphFrame = 0;
        if (innerWidth < 901) {
          aboutSection.classList.remove('is-card-morphing','is-card-docked');
          morphs.forEach(morph => { morph.style.opacity = '0'; });
          pictures.forEach(picture => { picture.style.opacity = '1'; });
          cards.forEach(card => {
            card.style.opacity = '1';
            card.closest('.about-value')?.style.removeProperty('transform');
          });
          return;
        }
        const pinRect = valuesPin.getBoundingClientRect();
        const raw = clamp01((innerHeight-pinRect.top)/innerHeight);
        const progress = easeMorph(raw);
        const active = raw > .002 && raw < .998;
        aboutSection.classList.toggle('is-card-morphing',active);
        aboutSection.classList.toggle('is-card-docked',raw >= .998);
        pictures.forEach((picture,index) => {
          const anchor = flightAnchors[index];
          if (!anchor) return;
          const morph = morphs[index];
          const start = anchor.start;
          const end = anchor.end;
          // Settle each icon into its own card before the pinned flip begins.
          const growProgress = easeMorph(clamp01((raw-.08)/.74));
          morph.style.left=(start.left+(end.left-start.left)*growProgress)+'px';
          morph.style.top=(start.top+(end.top-start.top)*growProgress)+'px';
          morph.style.width=(start.width+(end.width-start.width)*growProgress)+'px';
          morph.style.height=(start.height+(end.height-start.height)*growProgress)+'px';
          morph.style.borderRadius=(start.radius+(end.radius-start.radius)*growProgress)+'px';
          morph.style.setProperty('--morph-details',String(clamp01((growProgress-.55)/.35)));
          morph.style.transform='rotate('+(Number([-6,5,-4][index])*(1-growProgress))+'deg)';
          picture.style.opacity = String(1-clamp01(raw/.16));
          const handoff=easeMorph(clamp01((raw-.80)/.04));
          morph.style.opacity=raw>.002?String(1-handoff):'0';
          cards[index].style.opacity=String(handoff);
          cards[index].closest('.about-value')?.style.removeProperty('transform');
        });
      };
      const queueCardMorph = () => {
        if (!morphFrame) morphFrame = requestAnimationFrame(updateCardMorph);
      };
      addEventListener('scroll',queueCardMorph,{passive:true});
      const refreshCardFlight = () => {
        measureCardFlight();
        queueCardMorph();
      };
      addEventListener('resize',refreshCardFlight);
      new ResizeObserver(refreshCardFlight).observe(aboutSection);
      measureCardFlight();
      updateCardMorph();

      const initValuesFlip = () => {
        if (!window.gsap || !window.ScrollTrigger) return;
        const {gsap,ScrollTrigger} = window;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',() => {
          gsap.set(cards,{'--flip-angle':'0deg'});
          const flipTween = gsap.timeline({paused:true})
            .to({}, {duration:.3})
            .to(cards,{
              '--flip-angle':'180deg',
              duration:.8,
              ease:'power2.inOut'
            },.3);
          const trigger = ScrollTrigger.create({
            id:'about-values-flip',
            trigger:valuesPin,
            start:'top top',
            end:() => '+='+(innerHeight*.62),
            animation:flipTween,
            scrub:.35,
            pin:true,
            pinSpacing:true,
            anticipatePin:1,
            invalidateOnRefresh:true
          });
          requestAnimationFrame(() => ScrollTrigger.refresh());
          return () => {
            flipTween.kill();
            trigger.kill(true);
            gsap.set(cards,{'--flip-angle':'0deg'});
          };
        });
        addEventListener('pagehide',() => media.revert(),{once:true});
      };
      if (document.readyState === 'complete') initValuesFlip();
      else addEventListener('load',initValuesFlip,{once:true});
    }
  }
  const cloneSection = document.querySelector('.section-admissions');
  if (cloneSection) {
    const heading = cloneSection.querySelector('.portfolio-capabilities-heading');
    if (heading) heading.innerHTML = '<span>PERSONAL STUDY · MEJINAVI</span><h2>CLONE CODING</h2><p>메지로대학교 MEJINAVI 사이트를 분석하며 익힌<br>레이아웃, 비주얼, 인터랙션과 반응형 구현을 정리했습니다.</p>';
    const cloneCards = [
      {title:'메인 레이아웃',label:'LAYOUT & STRUCTURE',items:['긴 페이지의 섹션 구성과 콘텐츠 흐름 분석','카드·슬라이더의 배치와 여백 재현'],tag:'HTML · CSS · LAYOUT'},
      {title:'비주얼 스타일',label:'VISUAL & TYPOGRAPHY',items:['큰 타이포그래피와 둥근 카드 스타일 분석','컬러와 테두리·그림자로 화면의 깊이 표현'],tag:'TYPOGRAPHY · COLOR · DETAIL'},
      {title:'스크롤 모션',label:'SCROLL & INTERACTION',items:['스크롤에 따른 콘텐츠 등장과 움직임 관찰','슬라이드 전환과 호버 반응을 구현하며 학습'],tag:'JAVASCRIPT · SLIDER · MOTION'},
      {title:'반응형 화면',label:'RESPONSIVE & REFINE',items:['PC·모바일에 맞춰 카드와 텍스트 배치 조정','화면 크기별 가독성과 넘침 현상 점검'],tag:'DESKTOP · MOBILE · TEST'}
    ];
    cloneSection.querySelectorAll('.capability-card-content').forEach((card,index) => {
      const data = cloneCards[index];
      if (!data) return;
      card.innerHTML = '<span class="capability-index">CLONE STUDY '+String(index+1).padStart(2,'0')+'</span><div class="capability-title"><small>'+data.label+'</small><h3>'+data.title+'</h3></div><ul>'+data.items.map(item => '<li>'+item+'</li>').join('')+'</ul><span class="capability-tag">'+data.tag+'</span>';
    });
    const sourceLink = document.createElement('a');
    sourceLink.className = 'clone-study-source';
    sourceLink.href = 'https://www.mejiro.ac.jp/univ/mejinavi2026/';
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = 'MEJINAVI 원본 사이트 보기 ↗';
    heading?.append(sourceLink);
  }
  const workDataSection = document.querySelector('.section-mejiro-data');
  if (workDataSection) {
    workDataSection.classList.add('is-retrospective');
    const workSteps = [
      {label:'OBSERVE',title:'관찰하고 발견하기',description:'사용자의 입장에서 문제와 필요한 정보를 찾아요.',icon:'<svg viewBox="0 0 160 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 34h78v92H24z"/><path d="M42 58h42M42 76h30M42 94h38"/><circle cx="108" cy="42" r="22"/><path d="m124 58 22 22"/><path d="M94 42h28M108 28v28"/></svg>'},
      {label:'ORGANIZE',title:'정리하고 연결하기',description:'정보와 아이디어를 구조화해 명확한 방향을 잡아요.',icon:'<svg viewBox="0 0 160 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="19" y="20" width="122" height="32" rx="10"/><rect x="19" y="63" width="55" height="67" rx="10"/><rect x="86" y="63" width="55" height="67" rx="10"/><path d="M38 36h55M36 81h22M36 98h22M103 81h21M103 98h21"/></svg>'},
      {label:'CREATE',title:'디자인하고 구현하기',description:'아이디어를 실제로 사용할 수 있는 화면으로 만들어요.',icon:'<svg viewBox="0 0 160 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="15" y="18" width="130" height="100" rx="12"/><path d="M15 43h130M36 30h1M51 30h1M66 30h1M49 65 32 80l17 15M111 65l17 15-17 15M91 58 69 102M59 134h42"/></svg>'},
      {label:'REFINE',title:'확인하고 개선하기',description:'작은 부분까지 확인하며 더 나은 경험으로 다듬어요.',icon:'<svg viewBox="0 0 160 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="31" y="13" width="98" height="124" rx="12"/><path d="M55 44h51M55 70h30M55 98h51"/><path d="m91 70 9 9 24-28"/><circle cx="43" cy="44" r="2"/><circle cx="43" cy="70" r="2"/><circle cx="43" cy="98" r="2"/></svg>'}
    ];
    const retrospectiveSteps = [
      {label:'LEARNED',title:'What I Learned',description:'사용자의 목적을 이해하고 정보를 정리하는 일이 디자인의 출발점이라는 것을 배웠습니다.'},
      {label:'PRACTICED',title:'What I Practiced',description:'기획과 UI 디자인, 화면 구현을 연결하며 반응형 레이아웃과 인터랙션을 연습했습니다.'},
      {label:'IMPROVE',title:'What I Want to Improve',description:'어떤 화면에서도 내용이 자연스럽게 이어지도록 콘텐츠와 컴포넌트 구조를 더 개선하고 싶습니다.'},
      {label:'NEXT STEP',title:'My Next Step',description:'작은 시도와 반복을 이어가며, 피드백을 반영해 디자인과 구현 경험을 넓히겠습니다.'}
    ];
    retrospectiveSteps.splice(0,4,
      {label:'DISCOVER & DEFINE',title:'UX 기획',description:'사용자 관점에서 문제와 목표를 정의하고, 정보 구조와 화면 흐름을 설계합니다.\nRESEARCH · IA · USER FLOW'},
      {label:'DESIGN THE EXPERIENCE',title:'UI 디자인',description:'브랜드에 맞는 비주얼 시스템을 구성하고, Figma 기반 반응형 화면을 제작합니다.\nFIGMA · PROTOTYPE · RESPONSIVE'},
      {label:'BUILD & INTERACT',title:'프론트엔드',description:'HTML·CSS·JavaScript 기반 구현과 React·GSAP 인터랙션을 제작합니다.\nHTML · CSS · JS · REACT'},
      {label:'SHIP & IMPROVE',title:'협업과 개선',description:'Git 기반 협업과 배포를 경험하고, 피드백을 반영해 반복적으로 개선합니다.\nGIT · GITHUB · VERCEL'}
    );
    workSteps.forEach((step,index) => Object.assign(step,retrospectiveSteps[index]));
    const mainTitle = workDataSection.querySelector('.section-heading .text-main');
    const subTitle = workDataSection.querySelector('.section-heading .text-sub');
    if (mainTitle) mainTitle.innerHTML = '<span class="work-data-title">RETROSPECTIVE</span>';
    if (subTitle) subTitle.textContent = '아이디어를 결과물로 만드는 나만의 방식';
    const guideItems = workDataSection.querySelectorAll('.icon-guide li');
    if (guideItems[0]) guideItems[0].innerHTML = '<div class="icon-shinjuku">思</div><p class="icon-text">문제를 이해하는 과정</p>';
    if (guideItems[1]) guideItems[1].innerHTML = '<div class="icon-iwatsuki">作</div><p class="icon-text">화면으로 만드는 과정</p>';
    if (subTitle) subTitle.textContent = '배운 점과 다음 작업에서 발전시키고 싶은 방향';
    if (guideItems[0]) guideItems[0].innerHTML = '<div class="icon-shinjuku">学</div><p class="icon-text">프로젝트에서 배운 점</p>';
    if (guideItems[1]) guideItems[1].innerHTML = '<div class="icon-iwatsuki">次</div><p class="icon-text">다음 작업의 방향</p>';
    if (mainTitle) mainTitle.innerHTML = '<span class="work-data-title">CAPABILITIES</span>';
    if (subTitle) subTitle.textContent = '아이디어를 구조화하고, 화면으로 설계해, 실제 웹 경험으로 완성합니다.';
    if (guideItems[0]) guideItems[0].innerHTML = '<div class="icon-shinjuku">01</div><p class="icon-text">기획과 디자인</p>';
    if (guideItems[1]) guideItems[1].innerHTML = '<div class="icon-iwatsuki">02</div><p class="icon-text">구현과 개선</p>';
    const capabilityGuide = workDataSection.querySelector('.icon-guide');
    if (capabilityGuide) {
      capabilityGuide.classList.add('capability-overview');
      capabilityGuide.setAttribute('aria-label','네 가지 핵심 역량');
      capabilityGuide.innerHTML = ['UX 기획','UI 디자인','프론트엔드','협업과 개선'].map(title => '<li><span>'+title+'</span></li>').join('');
    }
    document.querySelector('.work-retrospective')?.remove();
    const imageSlides = [...workDataSection.querySelectorAll('.img-slider .swiper-wrapper > .swiper-slide')];
    const textSlides = [...workDataSection.querySelectorAll('.text-slider .swiper-wrapper > .swiper-slide')];
    imageSlides.slice(4).forEach(slide => slide.remove());
    textSlides.slice(4).forEach(slide => slide.remove());
    imageSlides.slice(0,4).forEach((slide,index) => {
      const step = workSteps[index];
      const image = slide.querySelector('.img-container .img');
      const icons = slide.querySelector('.icon-container');
      const heading = slide.querySelector('.heading');
      const number = slide.querySelector('.num-container');
      if (image) image.innerHTML = '<div class="work-data-illustration">'+step.icon+'</div>';
      if (icons) icons.innerHTML = '<div class="icon-shinjuku">'+String(index+1).padStart(2,'0')+'</div><div class="icon-iwatsuki">STEP</div>';
      if (heading) heading.textContent = step.title;
      if (heading) {
        const summary = document.createElement('p');
        summary.className = 'retro-summary';
        summary.textContent = step.description;
        heading.after(summary);
      }
      if (number) number.innerHTML = '<span class="num">'+String(index+1).padStart(2,'0')+'</span><span class="num-text">/ 04</span>';
      slide.querySelector('.btn-container')?.remove();
      slide.querySelectorAll('.visually-hidden,.notes').forEach(item => item.remove());
    });
    textSlides.slice(0,4).forEach((slide,index) => {
      const text = slide.querySelector('.text p');
      if (text) text.textContent = workSteps[index].description;
      slide.querySelector('.notes')?.remove();
    });
    // Centered, auto-width Swiper needs enough slides to loop across wide screens.
    ['.img-slider','.text-slider'].forEach(selector => {
      const wrapper = workDataSection.querySelector(selector+' .swiper-wrapper');
      if (!wrapper) return;
      const originals = [...wrapper.children];
      for (let repeat=0;repeat<2;repeat++) {
        originals.forEach(slide => wrapper.append(slide.cloneNode(true)));
      }
    });
    workDataSection.querySelectorAll('.slider-btn-next,.slider-btn-prev').forEach(button => {
      button.addEventListener('click',event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const swiper = workDataSection.querySelector('.img-slider')?.swiper;
        if (!swiper || swiper.animating) return;
        swiper.autoplay?.stop();
        if (button.classList.contains('slider-btn-next')) swiper.slideNext(500);
        else swiper.slidePrev(500);
      },true);
    });
    const bullets = workDataSection.querySelector('.slider-pagination-bullets');
    if (bullets) bullets.innerHTML = '<span class="slider-pagination-bullet slider-pagination-bullet-active"></span>'.repeat(1)+'<span class="slider-pagination-bullet"></span>'.repeat(3);
    addEventListener('load',() => setTimeout(() => {
      workDataSection.querySelector('.img-slider')?.swiper?.slideTo(0,0);
      workDataSection.querySelector('.text-slider')?.swiper?.slideTo(0,0);
      workDataSection.querySelector('.img-slider')?.swiper?.autoplay?.stop();
    },100));
  }
  const projectCase = document.querySelector('.portfolio-projects .project-case');
  if (projectCase) {
    const projectPin = document.createElement('div');
    projectPin.className = 'project-case-pin';
    projectCase.before(projectPin);
    projectPin.append(projectCase);
    const projectDetails = projectCase.querySelector('.project-details');
    const projectWalkthrough = document.querySelector('.portfolio-projects .project-walkthrough');
    const reduceProjectMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let projectFrame = 0;
    const updateProjectDetails = () => {
      projectFrame = 0;
      if (!projectDetails) return;
      if (reduceProjectMotion.matches) {
        projectDetails.style.transform = 'none';
        projectDetails.style.opacity = '1';
        return;
      }
      projectDetails.style.transform = 'none';
      projectDetails.style.opacity = '1';
      if (projectWalkthrough && innerWidth > 900) {
        const walkthroughRect = projectWalkthrough.getBoundingClientRect();
        const walkthroughRaw = Math.max(0,Math.min(1,(-walkthroughRect.top)/(innerHeight*.25)));
        const walkthroughProgress = walkthroughRaw*walkthroughRaw*(3-2*walkthroughRaw);
        projectWalkthrough.style.setProperty('--walkthrough-enter',walkthroughProgress.toFixed(4));
      } else if (projectWalkthrough) {
        projectWalkthrough.style.setProperty('--walkthrough-enter','1');
      }
    };
    const queueProjectDetails = () => {
      if (!projectFrame) projectFrame = requestAnimationFrame(updateProjectDetails);
    };
    addEventListener('scroll',queueProjectDetails,{passive:true});
    addEventListener('resize',queueProjectDetails);
    reduceProjectMotion.addEventListener('change',queueProjectDetails);
    updateProjectDetails();
  }
  const caseData = document.querySelector('#case-process-data');
  if (caseData) {
    const steps = JSON.parse(caseData.textContent);
    const orderedPanels = [...document.querySelectorAll('[data-case-step]')];
    if (orderedPanels.length === 6) {
      const implementationPanel = orderedPanels.pop();
      orderedPanels[0].before(implementationPanel);
      orderedPanels.unshift(implementationPanel);
      steps.unshift(steps.pop());
      orderedPanels.forEach((panel,index) => {
        panel.dataset.caseStep = String(index);
        const count = panel.querySelector('.case-step-count');
        if (count) count.textContent = 'PROCESS '+String(index+1).padStart(2,'0')+' / 06';
        const note = panel.querySelector('.case-doc-content > small');
        if (note) note.textContent = 'PROCESS NOTE · '+String(index+1).padStart(2,'0');
      });
    }
    const dialog = document.querySelector('.case-document-dialog');
    const renderDocument = (container, data) => {
      container.querySelector('h4').textContent = data.title;
      const body = container.querySelector('.case-doc-body');
      body.replaceChildren();
      if (data.image) {
        const img = document.createElement('img');
        img.className = 'case-live-image';img.src = data.image;
        img.alt = '딥티크 팀 프로젝트 실제 웹사이트 화면';
        body.append(img);
      } else {
        const columns = document.createElement('div');columns.className = 'case-doc-columns';
        data.columns.forEach(([heading,...lines]) => {
          const column = document.createElement('div');
          const title = document.createElement('h5');title.textContent = heading;column.append(title);
          lines.forEach(line => { const p = document.createElement('p');p.textContent = line;column.append(p); });
          columns.append(column);
        });
        body.append(columns);
      }
      container.querySelector('.case-doc-note').textContent = data.image ? 'LIVE WEBSITE · 실제 구현 화면' : 'PROJECT PROCESS · 기획 구성 예시';
    };
    document.querySelectorAll('[data-case-step]').forEach(section => {
      const stepIndex = Number(section.dataset.caseStep);
      const data = steps[stepIndex];
      const documentPanel=section.querySelector('.case-document');
      if (data.title === '시장과 브랜드 이해') {
        section.querySelector('.case-step-description').textContent = '딥티크의 현재 온라인 경험을 자사·경쟁사 관점에서 살펴보고, 향수 시장에 영향을 주는 외부 환경과 고객·시장·브랜드의 관계를 분석했습니다. 네 가지 자료를 통해 브랜드의 강점과 개선 방향을 구체화했습니다.';
        const analysisCards = [
          { label: '자사분석', src: './assets/img/portfolio/analysis-company-original.jpg', alt: '딥티크 자사 분석 자료' },
          { label: '경쟁사 분석', src: './assets/img/portfolio/analysis-competitor-original.jpg', alt: '조 말론, 르 라보, 바이레도 경쟁사 분석 자료' },
          { label: 'STEEP', src: './assets/img/portfolio/analysis-steep-original.png', alt: '향수 시장 STEEP 분석 자료' },
          { label: '3C 분석', src: './assets/img/portfolio/analysis-3c-original.jpg', alt: '고객, 경쟁사, 자사 3C 분석 자료' }
        ];
        const deck = document.createElement('div');
        deck.className = 'case-analysis-deck';
        analysisCards.forEach((card,index) => {
          const figure = document.createElement('figure');
          figure.className = 'case-analysis-card';
          figure.dataset.analysisCard = String(index);
          const image = document.createElement('img');
          image.src = card.src;
          image.alt = card.alt;
          image.loading = index === 0 ? 'eager' : 'lazy';
          const caption = document.createElement('figcaption');
          caption.textContent = card.label;
          figure.append(image,caption);
          deck.append(figure);
        });
        documentPanel.replaceWith(deck);
        const tabs = section.querySelector('.case-tabs');
        tabs.replaceChildren(...analysisCards.map((card,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.analysisTab = String(index);
          button.setAttribute('aria-pressed',String(index === 0));
          button.textContent = card.label;
          return button;
        }));
        const selectCard = index => {
          deck.querySelectorAll('.case-analysis-card').forEach((card,cardIndex) => {
            const relative = (cardIndex - index + analysisCards.length) % analysisCards.length;
            card.style.setProperty('--stack-order',String(relative));
            card.classList.toggle('is-active',cardIndex === index);
            card.setAttribute('aria-hidden',String(cardIndex !== index));
          });
          tabs.querySelectorAll('button').forEach((button,buttonIndex) => button.setAttribute('aria-pressed',String(buttonIndex === index)));
        };
        tabs.querySelectorAll('button').forEach((button,index) => button.addEventListener('click',() => selectCard(index)));
        selectCard(0);
        section.querySelector('.case-enlarge').addEventListener('click',() => {
          const active = deck.querySelector('.case-analysis-card.is-active');
          const copy = active.cloneNode(true);
          copy.classList.add('is-dialog-card');
          copy.removeAttribute('aria-hidden');
          dialog.querySelector('.case-dialog-content').replaceChildren(copy);
          dialog.querySelector('#case-dialog-title').textContent = active.querySelector('figcaption').textContent;
          dialog.showModal();
        });
        return;
      }
      if (data.title === '문제 정의와 기획') {
        const groups = [
          { label: '페르소나', files: ['persona-1.jpg','persona-2.jpg','persona-3.jpg'] },
          { label: '린캔버스', files: ['lean-canvas-1.jpg','lean-canvas-2.jpg','lean-canvas-3.jpg'] },
          { label: '저니맵', files: ['journey-1.jpg','journey-2.png','journey-3.jpg'] }
        ];
        section.classList.add('has-planning-gallery');
        const gallery = document.createElement('div');
        gallery.className = 'case-planning-gallery';
        documentPanel.replaceWith(gallery);
        const tabs = section.querySelector('.case-tabs');
        const openImages = (group, index) => {
          const content = document.createElement('div');
          content.className = 'case-planning-full';
          const indices = index === undefined ? [0,1,2] : [index];
          indices.forEach(i => {
            const image = document.createElement('img');
            image.src = './assets/img/portfolio/' + group.files[i];
            image.alt = group.label + ' ' + (i+1);
            content.append(image);
          });
          dialog.querySelector('.case-dialog-content').replaceChildren(content);
          dialog.querySelector('#case-dialog-title').textContent = group.label + (index === undefined ? ' 1 · 2 · 3' : ' ' + (index+1));
          dialog.showModal();
        };
        let currentGroup = groups[0];
        const selectGroup = group => {
          currentGroup = group;
          gallery.replaceChildren(...group.files.map((file,index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'case-planning-image-card';
            card.setAttribute('aria-label',group.label + ' ' + (index+1) + ' 크게 보기');
            const image = document.createElement('img');
            image.src = './assets/img/portfolio/' + file;
            image.alt = group.label + ' ' + (index+1) + ' 원본 자료';
            const label = document.createElement('span');
            label.textContent = group.label + ' ' + (index+1) + ' ↗';
            card.append(image,label);
            card.addEventListener('click',() => openImages(group,index));
            return card;
          }));
          [...tabs.children].forEach((button,index) => button.setAttribute('aria-pressed',String(groups[index] === group)));
        };
        tabs.replaceChildren(...groups.map(group => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = group.label;
          button.addEventListener('click',() => selectGroup(group));
          return button;
        }));
        selectGroup(groups[0]);
        section.querySelector('.case-enlarge').addEventListener('click',() => openImages(currentGroup));
        return;
      }
      if (data.docs[0].image) {
        const laptop=document.createElement('div');laptop.className='case-macbook';
        const display=document.createElement('div');display.className='case-macbook-display';
        const screen=document.createElement('div');screen.className='case-macbook-screen';
        const base=document.createElement('div');base.className='case-macbook-base';base.setAttribute('aria-hidden','true');
        documentPanel.before(laptop);laptop.append(display,base);display.append(screen);screen.append(documentPanel);
        const preview = document.createElement('iframe');
        preview.className = 'case-live-preview';
        preview.title = '딥티크 팀 프로젝트 메인부터 푸터까지 자동 재생';
        preview.src = './team-preview.html';
        preview.loading = 'lazy';
        preview.allow = 'autoplay';
        preview.setAttribute('sandbox','allow-scripts allow-same-origin');
        screen.append(preview);
        documentPanel.hidden = true;
        let previewVisible = false;
        const syncPreview = () => preview.contentWindow?.postMessage({type:'team-preview-visibility',visible:previewVisible&&!document.hidden&&!preview.hidden},location.origin);
        preview.addEventListener('load',syncPreview);
        new IntersectionObserver(entries=>{
          previewVisible=entries[0].isIntersecting;
          syncPreview();
        },{threshold:.15}).observe(screen);
        document.addEventListener('visibilitychange',syncPreview);
        new ResizeObserver(()=>screen.style.setProperty('--preview-scale',String(screen.clientWidth/1440))).observe(screen);
        section.querySelectorAll('[data-case-tab]').forEach(button=>button.addEventListener('click',()=>{
          const showLive=button.dataset.caseTab==='0';
          preview.hidden=!showLive;
          documentPanel.hidden=showLive;
          syncPreview();
        }));
      } else {
        const stack=document.createElement('div');stack.className='case-planning-stack';
        documentPanel.before(stack);stack.append(documentPanel);
        data.docs.slice(1,3).forEach((doc,index) => {
          const note=document.createElement('div');note.className='case-stack-note case-stack-note-'+(index+1);
          const label=document.createElement('span');label.textContent='0'+(index+2)+' · '+doc.title.toUpperCase();
          const title=document.createElement('strong');title.textContent=doc.title;
          const summary=document.createElement('p');
          summary.textContent=(doc.columns || []).map(column=>column[1]).filter(Boolean).slice(0,2).join(' · ');
          note.append(label,title,summary);stack.append(note);
        });
      }
      section.querySelectorAll('[data-case-tab]').forEach(button => button.addEventListener('click',() => {
        section.querySelectorAll('[data-case-tab]').forEach(tab => tab.setAttribute('aria-pressed',String(tab===button)));
        renderDocument(section.querySelector('.case-document'),data.docs[Number(button.dataset.caseTab)]);
      }));
      section.querySelector('.case-enlarge').addEventListener('click',() => {
        const copy = section.querySelector('.case-document').cloneNode(true);
        dialog.querySelector('.case-dialog-content').replaceChildren(copy);
        dialog.querySelector('#case-dialog-title').textContent = copy.querySelector('h4').textContent;
        dialog.showModal();
      });
    });
    dialog.querySelector('.case-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      const box=dialog.getBoundingClientRect();
      if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)) dialog.close();
    });
    const walkthrough = document.querySelector('.project-walkthrough');
    const panels = [...walkthrough.querySelectorAll('.case-process-step')];
    const viewport = document.createElement('div');viewport.className='case-horizontal-viewport';
    const track = document.createElement('div');track.className='case-horizontal-track';
    walkthrough.querySelector('.case-process-heading')?.remove();
    walkthrough.append(viewport);
    viewport.append(track);panels.forEach(panel=>track.append(panel));
    const sticky = document.createElement('div');sticky.className='case-horizontal-sticky';
    walkthrough.prepend(sticky);
    sticky.append(viewport);
    panels.forEach((panel,index)=>{
      panel.dataset.folderLabel=steps[index].title;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('case-folder-outline');svg.setAttribute('aria-hidden','true');
      svg.append(document.createElementNS('http://www.w3.org/2000/svg','path'));
      panel.prepend(svg);
    });
    const horizontalMode=matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    let horizontalFrame=0;
    let walkthroughHeld=false;
    let pausedPanel=-1;
    let walkthroughRelease=null;
    let walkthroughHoldTimer=0;
    const walkthroughBlockedKeys=new Set(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ']);
    const preventWalkthroughScroll=event=>event.preventDefault();
    const preventWalkthroughKey=event=>{
      if(walkthroughBlockedKeys.has(event.key)) event.preventDefault();
    };
    const holdWalkthrough=()=>{
      if(walkthroughHeld||!horizontalMode.matches) return;
      walkthroughHeld=true;
      addEventListener('wheel',preventWalkthroughScroll,{passive:false,capture:true});
      addEventListener('touchmove',preventWalkthroughScroll,{passive:false,capture:true});
      addEventListener('keydown',preventWalkthroughKey,{capture:true});
      walkthroughRelease=()=>{
        removeEventListener('wheel',preventWalkthroughScroll,{capture:true});
        removeEventListener('touchmove',preventWalkthroughScroll,{capture:true});
        removeEventListener('keydown',preventWalkthroughKey,{capture:true});
        walkthroughRelease=null;
      };
      clearTimeout(walkthroughHoldTimer);
      walkthroughHoldTimer=setTimeout(()=>{
        walkthroughRelease?.();
        walkthroughHeld=false;
      },500);
    };
    const updateHorizontal=()=>{
      horizontalFrame=0;
      const travel=viewport.clientWidth*(panels.length-1);
      const firstPanelHold=horizontalMode.matches?innerHeight*.25:0;
      walkthrough.classList.toggle('case-horizontal-pinned',horizontalMode.matches);
      panels.forEach(panel=>{
        const css=getComputedStyle(panel);
        const left=parseFloat(css.paddingLeft),right=parseFloat(css.paddingRight);
        const w=panel.clientWidth-left-right,h=panel.offsetHeight-parseFloat(css.paddingBottom);
        const tabTopEnd=Math.min(w*.3,190),r=26;
        const shoulder=60;
        const svg=panel.querySelector('.case-folder-outline');
        svg.setAttribute('viewBox','0 0 '+w+' '+h);
        svg.style.left=left+'px';svg.style.width=w+'px';svg.style.height=h+'px';
        svg.querySelector('path').setAttribute('d',
          'M 0 '+shoulder+
          ' L 31 13'+
          ' Q 38 0 53 0'+
          ' H '+tabTopEnd+
          ' Q '+(tabTopEnd+14)+' 0 '+(tabTopEnd+22)+' 13'+
          ' L '+(tabTopEnd+60)+' '+shoulder+
          ' H '+(w-r)+
          ' Q '+w+' '+shoulder+' '+w+' '+(shoulder+r)+' V '+(h-r)+
          ' Q '+w+' '+h+' '+(w-r)+' '+h+' H '+r+
          ' Q 0 '+h+' 0 '+(h-r)+' Z');
      });
      walkthrough.style.height=horizontalMode.matches?sticky.offsetHeight+firstPanelHold+travel+'px':'';
      const walkthroughRect=walkthrough.getBoundingClientRect();
      const rawOffset=horizontalMode.matches?Math.max(0,Math.min(travel,-walkthroughRect.top-firstPanelHold)):viewport.scrollLeft;
      const nextPanel=Math.min(panels.length-1,Math.floor((rawOffset+viewport.clientWidth*.08)/Math.max(1,viewport.clientWidth)));
      const hasReachedProjectWalkthrough = walkthroughRect.top <= -firstPanelHold;
      if(horizontalMode.matches && hasReachedProjectWalkthrough && nextPanel>pausedPanel){
        const sectionTop=window.scrollY+walkthroughRect.top;
        const snapY=sectionTop+firstPanelHold+(nextPanel*viewport.clientWidth);
        pausedPanel=nextPanel;
        if(Math.abs(window.scrollY-snapY)>1) window.scrollTo({top:snapY,behavior:'smooth'});
        holdWalkthrough();
        return;
      }
      if(walkthroughRect.top>2){
        walkthroughHeld=false;
        pausedPanel=-1;
        clearTimeout(walkthroughHoldTimer);
        walkthroughRelease?.();
      }
      const offset=rawOffset;
      track.style.transform=horizontalMode.matches?'translate3d('+(-offset)+'px,0,0)':'none';
      const active=Math.round(offset/Math.max(1,viewport.clientWidth));
      panels.forEach((panel,index)=>{
        const distance=Math.min(1,Math.abs(index-offset/Math.max(1,viewport.clientWidth)));
        panel.style.setProperty('--scene-visibility',String(1-distance*.16));
        panel.style.setProperty('--scene-shift','0px');
        panel.style.setProperty('--scene-scale','1');
      });
      walkthrough.dataset.activeStep=String(active);
    };
    const queueHorizontal=()=>{if(!horizontalFrame)horizontalFrame=requestAnimationFrame(updateHorizontal);};
    addEventListener('scroll',queueHorizontal,{passive:true});addEventListener('resize',queueHorizontal);
    viewport.addEventListener('scroll',queueHorizontal,{passive:true});
    horizontalMode.addEventListener('change',queueHorizontal);
    new ResizeObserver(queueHorizontal).observe(sticky);
    updateHorizontal();
  }
  const skills = document.querySelector('.skills-tools');
  if (skills && !skills.classList.contains('skills-scroll')) {
    const buttons = [...skills.querySelectorAll('[data-tool]')];
    const icons = [...skills.querySelectorAll('[data-tool-icon]')];
    let selected = null;
    const showTool = name => {
      skills.classList.toggle('has-active-tool', !!name);
      icons.forEach(icon => icon.classList.toggle('is-active', icon.dataset.toolIcon === name));
    };
    buttons.forEach(button => {
      button.addEventListener('pointerenter', () => showTool(button.dataset.tool));
      button.addEventListener('pointerleave', () => showTool(selected));
      button.addEventListener('focus', () => showTool(button.dataset.tool));
      button.addEventListener('blur', () => showTool(selected));
      button.addEventListener('click', () => {
        selected = selected === button.dataset.tool ? null : button.dataset.tool;
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.tool === selected)));
        showTool(selected);
      });
    });
    skills.addEventListener('keydown', event => {
      if (event.key === 'Escape') { selected = null; buttons.forEach(button => button.setAttribute('aria-pressed', 'false')); showTool(null); }
    });
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    skills.addEventListener('pointermove', event => {
      if (motion.matches || event.pointerType !== 'mouse') return;
      const rect = skills.getBoundingClientRect();
      skills.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 18}px`);
      skills.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 12}px`);
    });
    skills.addEventListener('pointerleave', () => { skills.style.setProperty('--pointer-x', '0px'); skills.style.setProperty('--pointer-y', '0px'); showTool(selected); });
  }
  if (skills?.classList.contains('skills-scroll')) {
    const reel = skills.querySelector('.skills-logo-reel');
    const track = skills.querySelector('.skills-logo-track');
    const originals = [...skills.querySelectorAll('.skill-logo-box')];
    const cards = [...track.children];
    skills.classList.add('skills-orbit');
    const caption = document.createElement('div');
    caption.className = 'skills-orbit-caption';
    caption.innerHTML = '<span>MY TOOLKIT</span><small>DESIGN · CODE · MOTION</small>';
    reel.append(caption);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    skills.classList.add('skills-linear');
    skills.querySelector('.skills-tool-columns').after(reel);
    let frame = 0;
    let loopFrame = 0, lastTime = 0, autoOffset = 0, cycle = 2200;
    // Reduce the previous time between successive tools by half a second.
    const secondsPerTool = Math.max(.5, cycle / (65 * originals.length) - .5);
    const autoSpeed = cycle / (secondsPerTool * 1000 * originals.length);

    let visible = false;
    let drag = null, manualOffset = 0;
    const paint = () => {
      const position = manualOffset + (motion.matches ? 0 : autoOffset);
      const offset = ((position % cycle) + cycle) % cycle;
      const pitch = (cards[0]?.offsetWidth || 104) + 14;
      const span = pitch * cards.length;
      const y = innerWidth < 768 ? 174 : 195;
      cards.forEach((card,index) => {
        const x = (((index*pitch-offset/cycle*span+span/2)%span)+span)%span-span/2;
        card.style.transform = 'translate(-50%,-50%) translate3d('+x+'px,'+y+'px,0)';
        card.style.opacity = '1';
        card.style.zIndex = '2';
      });
    };
    const tick = time => {
      loopFrame = 0;
      if (!visible || document.hidden || motion.matches) { lastTime = 0; return; }
      if (lastTime && !drag) autoOffset = (autoOffset + Math.min(time - lastTime, 64) * autoSpeed) % cycle;
      lastTime = time;
      paint();
      loopFrame = requestAnimationFrame(tick);
    };
    const syncLoop = () => {
      if (loopFrame) cancelAnimationFrame(loopFrame);
      loopFrame = 0; lastTime = 0;
      if (visible && !document.hidden && !motion.matches) loopFrame = requestAnimationFrame(tick);
    };
    const render = () => { frame=0;paint(); };
    const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
    reel.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: manualOffset, horizontal: false };
      reel.setPointerCapture(event.pointerId);
    });
    reel.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.horizontal && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        drag.horizontal = true;
        reel.classList.add('is-dragging');
      }
      if (!drag.horizontal) return;
      manualOffset = drag.offset - dx;
      paint();
    });
    const finishDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      reel.classList.remove('is-dragging');
      if (reel.hasPointerCapture(event.pointerId)) reel.releasePointerCapture(event.pointerId);
      lastTime = 0;
    };
    reel.addEventListener('pointerup', finishDrag);
    reel.addEventListener('pointercancel', finishDrag);
    reel.addEventListener('lostpointercapture', finishDrag);
    reel.addEventListener('dragstart', event => event.preventDefault());
    // Continuous motion runs only while the reel is visible in the active tab.

    addEventListener('resize', requestRender);
    motion.addEventListener('change', () => { requestRender(); syncLoop(); });
    document.addEventListener('visibilitychange', syncLoop);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncLoop(); }).observe(reel);
    new ResizeObserver(requestRender).observe(skills);
    render();
  }
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.rel = 'noopener noreferrer';
  });

  // Keep the footer Q&A compact by leaving only the latest answer open.
  const qaItems = [...document.querySelectorAll('.portfolio-qa-item')];
  qaItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      qaItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  // Give icon-only carousel buttons accessible names.
  document.querySelectorAll('button.slider-btn-next').forEach(button => {
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', '다음 / Next');
  });
  document.querySelectorAll('button.slider-btn-prev').forEach(button => {
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', '이전 / Previous');
  });

  // Escape also works with the reference runtime's animated close buttons.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const visible = element => {
      const style = getComputedStyle(element);
      return element.getClientRects().length && style.visibility !== 'hidden' && Number(style.opacity) > 0;
    };
    const close = [...document.querySelectorAll('[data-modal-close], .btn-menu-close')]
      .filter(visible).find(element => element.tagName === 'BUTTON');
    close?.click();
  });
})();
