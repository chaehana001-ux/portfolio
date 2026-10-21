/** Small, editable enhancements layered over the reference animation runtime. */
(() => {
  'use strict';
  // Place the clone-coding introduction directly after the movie section.
  const cloneIntroSection = document.querySelector('.clone-studies');
  const movieSection = document.querySelector('.section-movie');
  if (cloneIntroSection && movieSection) movieSection.after(cloneIntroSection);
  const galleryMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const albumCards = [...document.querySelectorAll('.messages-list > .item')].slice(0,8);
  const galleryPhotos = [
    ['photo-01','나이지리아의 빗속에서 함께한 뜻밖의 순간'],
    ['photo-02','좋은 사람들과 보낸 맑은 날의 기억'],
    ['photo-03','친구들과 함께 촬영한 포토부스 사진'],
    ['photo-04','직접 만든 뜨개 작품'],
    ['photo-05','직접 만든 작은 손뜨개 인형'],
    ['photo-06','나이지리아에서 친구들과 남긴 거울 사진'],
    ['photo-07','나이지리아에서 만난 아이와 함께한 순간'],
    ['photo-08','도시의 야경 앞에서 보낸 고요한 밤']
  ];
  albumCards.forEach(card => {
    const contents = card.querySelector('.item-contents');
    if (!contents) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'album-card-motion';
    contents.before(wrapper);
    wrapper.append(contents);
    card.classList.add('album-fan-card','photo-sample');
  });
  let albumFrame = 0;
  const updateAlbum = () => {
    albumFrame = 0;
    const rows = [];
    albumCards.forEach(card => {
      const box = card.getBoundingClientRect();
      let row = rows.find(group => Math.abs(group[0].box.top - box.top) < 12);
      if (!row) { row = []; rows.push(row); }
      row.push({card, box});
    });
    rows.forEach(row => {
      const centerX = row.reduce((sum,entry) => sum + entry.box.left + entry.box.width / 2, 0) / row.length;
      // Reversible progress: stacked at the bottom, spread as the row enters.
      const raw = Math.max(0, Math.min(1, (innerHeight * .85 - row[0].box.top) / (innerHeight * .4)));
      row.forEach(({card,box},index) => {
        const wrapper = card.querySelector('.album-card-motion');
        if (!wrapper) return;
        const stagger = index * .06;
        const t = galleryMotion.matches ? 1 : Math.max(0, Math.min(1, (raw - stagger) / (1 - stagger)));
        const eased = 1 - Math.pow(1 - t, 3);
        const remaining = 1 - eased;
        const x = (centerX - box.left - box.width / 2) * remaining;
        const angle = (index - (row.length - 1) / 2) * 4 * remaining;
        wrapper.classList.add('album-dealt');
        wrapper.style.translate = x + 'px ' + (24 * remaining) + 'px';
        wrapper.style.rotate = angle + 'deg';
        wrapper.style.scale = String(.86 + .14 * eased);
        card.style.zIndex = String(index + 1);
      });
    });
  };
  const queueAlbum = () => { if (!albumFrame) albumFrame = requestAnimationFrame(updateAlbum); };
  addEventListener('scroll',queueAlbum,{passive:true});
  addEventListener('resize',queueAlbum);
  addEventListener('load',queueAlbum);
  galleryMotion.addEventListener('change',queueAlbum);
  const albumList = document.querySelector('.messages-list');
  if (albumList) new ResizeObserver(queueAlbum).observe(albumList);
  queueAlbum();
  const galleryReveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.target.classList.toggle('gallery-in-view',entry.isIntersecting);
  }),{threshold:.12});
  const isolateGalleryWriting=async(photo,writing,preserveDarkInk=false,inkColor=[255,255,255])=>{
    try{
      await Promise.all([photo.decode(),writing.decode()]);
      const width=writing.naturalWidth;
      const height=writing.naturalHeight;
      const canvas=document.createElement('canvas');
      canvas.width=width;
      canvas.height=height;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      context.drawImage(photo,0,0,width,height);
      const clean=context.getImageData(0,0,width,height);
      context.clearRect(0,0,width,height);
      context.drawImage(writing,0,0,width,height);
      const marked=context.getImageData(0,0,width,height);
      const pixelCount=width*height;
      const differenceMap=new Uint8Array(pixelCount);
      const strokeCore=new Uint8Array(pixelCount);
      const stableCore=new Uint8Array(pixelCount);
      for(let index=0;index<pixelCount;index++){
        const pixel=index*4;
        const red=marked.data[pixel];
        const green=marked.data[pixel+1];
        const blue=marked.data[pixel+2];
        const markedLight=(red+green+blue)/3;
        const cleanLight=(clean.data[pixel]+clean.data[pixel+1]+clean.data[pixel+2])/3;
        const signedDifference=markedLight-cleanLight;
        const difference=Math.max(0,Math.min(255,Math.round(preserveDarkInk?Math.abs(signedDifference):signedDifference)));
        const chroma=Math.max(red,green,blue)-Math.min(red,green,blue);
        differenceMap[index]=difference;
        if(preserveDarkInk
          ? difference>=28&&markedLight<=190&&chroma<=70
          : difference>=38&&markedLight>=165&&chroma<=65)strokeCore[index]=1;
      }
      for(let index=0;index<pixelCount;index++){
        if(!strokeCore[index])continue;
        const x=index%width;
        const y=Math.floor(index/width);
        let neighbours=0;
        for(let offsetY=-1;offsetY<=1;offsetY++){
          const nextY=y+offsetY;
          if(nextY<0||nextY>=height)continue;
          for(let offsetX=-1;offsetX<=1;offsetX++){
            if(offsetX===0&&offsetY===0)continue;
            const nextX=x+offsetX;
            if(nextX>=0&&nextX<width&&strokeCore[nextY*width+nextX])neighbours++;
          }
        }
        if(neighbours>=2)stableCore[index]=1;
      }
      for(let index=0;index<pixelCount;index++){
        const pixel=index*4;
        let connected=stableCore[index]===1;
        if(!connected&&differenceMap[index]>=14){
          const x=index%width;
          const y=Math.floor(index/width);
          for(let offsetY=-2;offsetY<=2&&!connected;offsetY++){
            const nextY=y+offsetY;
            if(nextY<0||nextY>=height)continue;
            for(let offsetX=-2;offsetX<=2;offsetX++){
              const nextX=x+offsetX;
              if(nextX<0||nextX>=width)continue;
              if(stableCore[nextY*width+nextX]){connected=true;break;}
            }
          }
        }
        const alpha=connected?Math.max(0,Math.min(255,(differenceMap[index]-10)*6)):0;
        marked.data[pixel]=inkColor[0];
        marked.data[pixel+1]=inkColor[1];
        marked.data[pixel+2]=inkColor[2];
        marked.data[pixel+3]=alpha;
      }
      context.putImageData(marked,0,0);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!blob)return;
      const previous=writing.dataset.objectUrl;
      if(previous)URL.revokeObjectURL(previous);
      const objectUrl=URL.createObjectURL(blob);
      writing.dataset.objectUrl=objectUrl;
      writing.src=objectUrl;
      writing.classList.add('gallery-photo-writing--isolated','gallery-photo-writing--ready');
    }catch(error){
      console.warn('Gallery handwriting overlay could not be isolated.',error);
    }
  };
  albumCards.forEach((card,index)=>{
    const contents=card.querySelector('.item-contents');
    const asset=galleryPhotos[index];
    if(!contents||!asset)return;
    card.dataset.galleryIndex=String(index+1);
    const surface=document.createElement('div');surface.className='gallery-photo-surface';
    const photo=document.createElement('img');
    photo.className='gallery-photo-original';
    photo.src=index===2 ? './assets/img/portfolio/gallery/photo-03-diary.png' : `./assets/img/portfolio/gallery/${asset[0]}-clean.png`;
    photo.alt=asset[1];
    photo.loading='lazy';
    const writing=document.createElement('img');
    writing.className='gallery-photo-writing';
    writing.src=`./assets/img/portfolio/gallery/${asset[0]}-writing.png`;
    writing.alt='';
    writing.setAttribute('aria-hidden','true');
    writing.loading='lazy';
    surface.append(photo);
    if(index!==2) surface.append(writing);
    contents.replaceChildren(surface);
    if(index!==2) isolateGalleryWriting(photo,writing,false,index===4?[64,38,31]:[255,255,255]);
    card.style.setProperty('--gallery-delay',(index%4)*90+'ms');
    card.style.setProperty('--gallery-phase',index%2===0?'0s':'-1s');
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
    cursorVector.data = './assets/img/portfolio/cursor-plum.svg';
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
      // The Figma node already owns the 5px rounded outline. Keep the outer
      // viewport on the same curve so it only clips the expanding contents;
      // drawing an inset shadow here creates a second, square outline.
      figmaWindow.style.borderRadius = (20*(width/400)*(1-zoom))+'px';
      figmaWindow.style.boxShadow = `0 ${20*(1-zoom)}px ${60*(1-zoom)}px rgb(64 52 76 / ${.16*(1-zoom)}), inset 0 1px 0 rgb(255 255 255 / 80%)`;
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
  if (aboutSection) {
    const values = aboutSection.querySelector('.about-values');
    const cards = [...aboutSection.querySelectorAll('.about-value article')];
    const motion = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    if (values && cards.length) {
      const stage = document.createElement('div');
      stage.className = 'about-values-pin';
      values.before(stage);
      stage.append(values);
      // The complete cards enter from below; no icons travel from the heading.
      cards.forEach(card => {
        card.closest('.about-value').removeAttribute('data-anime');
      });
      const clamp = value => Math.max(0, Math.min(1, value));
      let frame = 0;
      const update = () => {
        frame = 0;
        aboutSection.classList.toggle('is-values-flip-stage', motion.matches);
        if (!motion.matches) {
          cards.forEach(card => {
            card.style.removeProperty('--flip-angle');
            card.style.removeProperty('opacity');
            card.style.removeProperty('translate');
          });
          return;
        }
        const rect = stage.getBoundingClientRect();
        const travel = Math.max(1, stage.offsetHeight - values.offsetHeight);
        const progress = clamp(-rect.top / travel);
        cards.forEach((card, index) => {
          const enter = clamp((innerHeight - rect.top) / (innerHeight * .65) - index * .08);
          const flip = clamp((progress - .12 - index * .05) / .65);
          const eased = flip * flip * (3 - 2 * flip);
          card.style.opacity = String(enter);
          card.style.translate = `0 ${(1 - enter) * 64}px`;
          card.style.setProperty('--flip-angle', `${eased * 180}deg`);
        });
      };
      const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
      addEventListener('scroll', queue, { passive: true });
      addEventListener('resize', queue);
      motion.addEventListener('change', queue);
      new ResizeObserver(queue).observe(values);
      update();
    }
  }
  const cloneSection = document.querySelector('.section-admissions');
  if (cloneSection) {
    const heading = cloneSection.querySelector('.portfolio-capabilities-heading');
    cloneSection.classList.add('is-clone-projects');
    if (heading) heading.innerHTML = '<span>PERSONAL STUDY · 02 PROJECTS</span><h2>CLONE CODING</h2><p>사이트의 개성을 관찰하고 코드로 구현하는 클론코딩 작업입니다.<br>레이아웃부터 인터랙션까지, 두 개의 프로젝트를 소개합니다.</p>';
    const cloneCards = [
      {title:"Whittaker’s<br>Chocolate",label:'CHOCOLATE BRAND WEBSITE',items:['초콜릿 브랜드의 비주얼과 콘텐츠 레이아웃','제품 소개 화면과 스크롤 인터랙션'],tag:'BRAND · VISUAL · INTERACTION',status:'프로젝트 소개 준비 중'},
      {title:'LIFESTYLE<br>SELECT SHOP',label:'SAMPLE PROJECT · 추후 교체 예정',items:['라이프스타일 제품을 소개하는 감각적인 화면','상품 그리드와 반응형 레이아웃'],tag:'LAYOUT · GRID · RESPONSIVE',status:'임시 콘텐츠 · 사이트 선정 예정'}
    ];
    cloneSection.querySelectorAll('.admissions-list .item').forEach((item,index) => {
      const data = cloneCards[index];
      if (!data) { item.hidden = true; return; }
      const card = item.querySelector('.capability-card-content');
      if (!card) return;
      const link = card.closest('a');
      link?.removeAttribute('href');
      card.innerHTML = '<span class="capability-index">CLONE PROJECT '+String(index+1).padStart(2,'0')+'</span><div class="capability-title"><small>'+data.label+'</small><h3>'+data.title+'</h3></div><ul>'+data.items.map(text => '<li>'+text+'</li>').join('')+'</ul><span class="capability-tag">'+data.tag+'</span><p class="clone-project-status">'+data.status+'</p>';
    });
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
    // Start at the middle copy of 01 in the Swiper options so 04 is
    // already visible on the left. Physical slideTo(0) breaks loop ordering.
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
      implementationPanel.remove();
      steps.pop();
      orderedPanels.forEach((panel,index) => {
        panel.dataset.caseStep = String(index);
        const count = panel.querySelector('.case-step-count');
        if (count) count.textContent = 'PROCESS '+String(index+1).padStart(2,'0')+' / 05';
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
      if (stepIndex === 1) {
        section.classList.add('has-interview-materials');
        section.querySelector('.case-step-copy h4').textContent = '사용자 인터뷰와 분석';
        section.querySelector('.case-step-english').textContent = 'Listening to users';
        section.querySelector('.case-step-description').textContent = '';
        const labels = ['인터뷰 원문','인터뷰 질문','응답 요약','어피니티 다이어그램'];
        const files = ['interview-full.jpg','interview-questions.png','interview-summary.jpg','interview-affinity.jpg'];
        const stage = document.createElement('div');
        stage.className = 'case-interview-material';
        const preview = document.createElement('button');
        preview.type = 'button';
        preview.className = 'case-interview-preview';
        const image = document.createElement('img');
        image.loading = 'lazy';
        preview.append(image);
        stage.append(preview);
        const caption = section.querySelector('.case-enlarge');
        caption.disabled = false;
        let selected = 0;
        const openMaterial = () => {
          const full = document.createElement('img');
          full.src = image.src;
          full.alt = labels[selected];
          full.style.cssText = 'display:block;width:100%;height:auto;';
          dialog.querySelector('.case-dialog-content').replaceChildren(full);
          dialog.querySelector('#case-dialog-title').textContent = labels[selected];
          dialog.showModal();
        };
        preview.addEventListener('click',openMaterial);
        caption.addEventListener('click',openMaterial);
        const selectMaterial = index => {
          selected = index;
          image.src = './assets/img/portfolio/' + files[index];
          image.alt = labels[index] + ' 원본 자료';
          preview.setAttribute('aria-label',labels[index] + ' 크게 보기');
          caption.replaceChildren(document.createTextNode(labels[index]));
          const hint = document.createElement('span');
          hint.textContent = '클릭하여 크게 보기 ↗';
          caption.append(hint);
          section.querySelectorAll('.case-tabs button').forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
        };
        documentPanel.replaceWith(stage);
        section.querySelector('.case-step-description').textContent = '딥티크 제품 구매와 웹사이트 이용 경험을 바탕으로 인터뷰를 진행하고, 응답을 주제별로 정리해 핵심 문제를 도출했습니다.';
        const tabs = section.querySelector('.case-tabs');
        tabs.replaceChildren(...labels.map((label,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = label;
          button.addEventListener('click',() => selectMaterial(index));
          return button;
        }));
        selectMaterial(0);
        return;
      }
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
      if (data.docs?.[0]?.title === 'Information architecture') {
        const flowCharts = [
          { label: 'GALERIE FLOW', src: './assets/img/portfolio/user-flow-galerie.png', alt: '향을 시각적으로 이해하고 탐색하는 갤러리 사용자 플로우차트' },
          { label: 'FULL SITE FLOW', src: './assets/img/portfolio/user-flow-full-site.png', alt: '공식 정보 탐색부터 재구매까지 이어지는 전체 사이트 사용자 플로우차트' },
          { label: 'IMMERSIVE FLOW', src: './assets/img/portfolio/user-flow-immersive.png', alt: '브랜드 경험에서 향수 히스토리까지 이어지는 몰입형 사용자 플로우차트' }
        ];
        section.classList.add('has-flow-gallery');
        const gallery = document.createElement('div');
        gallery.className = 'case-flow-gallery';
        const viewport = document.createElement('div');
        viewport.className = 'case-flow-viewport';
        const image = document.createElement('img');
        image.className = 'case-flow-image';
        image.loading = 'lazy';
        const flowSelector = document.createElement('div');
        flowSelector.className = 'case-flow-selector';
        viewport.append(image);
        documentPanel.replaceWith(gallery);
        // Keep chart choices above the document so they read as view tabs, not image captions.
        gallery.append(flowSelector,viewport,documentPanel);
        const tabs = section.querySelector('.case-tabs');
        const menuTree = { label: '메뉴트리', src: './assets/img/portfolio/menu-tree.png', alt: '딥티크 리디자인 메뉴 구조와 페이지 계층을 정리한 메뉴트리' };
        let activeChart = menuTree;
        const selectChart = (chart,index) => {
          activeChart = chart;
          image.src = chart.src;
          image.alt = chart.alt;
          viewport.scrollTop = 0;
          flowSelector.querySelectorAll('button').forEach((button,buttonIndex) => button.setAttribute('aria-pressed',String(buttonIndex === index)));
        };
        flowSelector.replaceChildren(...flowCharts.map((chart,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = chart.label;
          button.addEventListener('click',() => selectChart(chart,index));
          return button;
        }));
        const modes = [
          { label: '메뉴트리', show: () => { activeChart = menuTree; image.src = menuTree.src; image.alt = menuTree.alt; viewport.scrollTop = 0; viewport.hidden = false; flowSelector.hidden = true; documentPanel.hidden = true; gallery.classList.add('is-menu-tree'); gallery.classList.remove('has-flow-selector'); } },
          { label: '사용자 플로우', show: () => { viewport.hidden = false; flowSelector.hidden = false; documentPanel.hidden = true; gallery.classList.remove('is-menu-tree'); gallery.classList.add('has-flow-selector'); selectChart(flowCharts[0],0); } },
          { label: '요구사항', show: () => { viewport.hidden = true; flowSelector.hidden = true; gallery.classList.remove('is-menu-tree','has-flow-selector'); renderDocument(documentPanel,data.docs[2]); documentPanel.hidden = false; activeChart = null; } }
        ];
        tabs.replaceChildren(...modes.map((mode,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = mode.label;
          button.addEventListener('click',() => {
            modes.forEach((item,itemIndex) => tabs.children[itemIndex].setAttribute('aria-pressed',String(item === mode)));
            mode.show();
          });
          button.setAttribute('aria-pressed',String(index === 0));
          return button;
        }));
        modes[0].show();
        image.addEventListener('click',() => section.querySelector('.case-enlarge').click());
        section.querySelector('.case-enlarge').addEventListener('click',() => {
          if (!activeChart) {
            const copy = documentPanel.cloneNode(true);
            copy.hidden = false;
            dialog.querySelector('.case-dialog-content').replaceChildren(copy);
            dialog.querySelector('#case-dialog-title').textContent = '요구사항';
            dialog.showModal();
            return;
          }
          const content = document.createElement('div');
          content.className = 'case-flow-full';
          const fullImage = document.createElement('img');
          fullImage.src = activeChart.src;
          fullImage.alt = activeChart.alt;
          content.append(fullImage);
          dialog.querySelector('.case-dialog-content').replaceChildren(content);
          dialog.querySelector('#case-dialog-title').textContent = activeChart.label;
          dialog.showModal();
        });
        return;
      }
      if (data.docs?.[0]?.title === 'Visual direction') {
        const designBoards = [
          { label: '와이어프레임', src: './assets/img/portfolio/process-wireframe.png', alt: '정보 구조와 주요 화면 레이아웃을 정리한 딥티크 와이어프레임 보드', wide: true },
          { label: '디자인 시스템', src: './assets/img/portfolio/process-design-system.png', alt: '로고와 색상, 타이포그래피를 정리한 딥티크 디자인 시스템 보드', wide: true },
          { label: '컴포넌트', src: './assets/img/portfolio/process-components.png', alt: '내비게이션과 버튼, 상품 카드, 푸터를 정리한 딥티크 컴포넌트 보드', wide: false }
        ];
        section.classList.add('has-design-gallery');
        section.querySelector('.case-step-copy > h4').textContent = '화면 설계와 디자인 구체화';
        section.querySelector('.case-step-english').textContent = 'From Structure to Experience';
        section.querySelector('.case-step-description').textContent = '와이어프레임을 바탕으로 정보의 흐름과 화면 구조를 정리하고, 자연·예술·향의 이야기를 담은 디자인 요소를 적용하여 딥티크만의 브랜드 경험을 구체화했습니다.';
        const gallery = document.createElement('div');
        gallery.className = 'case-design-gallery';
        const viewport = document.createElement('div');
        viewport.className = 'case-design-viewport';
        const image = document.createElement('img');
        image.className = 'case-design-image';
        image.loading = 'lazy';
        viewport.append(image);
        gallery.append(viewport);
        documentPanel.replaceWith(gallery);
        const tabs = section.querySelector('.case-tabs');
        let activeBoard = designBoards[0];
        const selectBoard = (board,index) => {
          activeBoard = board;
          image.src = board.src;
          image.alt = board.alt;
          viewport.scrollTop = 0;
          gallery.classList.toggle('is-wide',board.wide);
          tabs.querySelectorAll('button').forEach((button,buttonIndex) => button.setAttribute('aria-pressed',String(buttonIndex === index)));
        };
        tabs.replaceChildren(...designBoards.map((board,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = board.label;
          button.addEventListener('click',() => selectBoard(board,index));
          return button;
        }));
        selectBoard(designBoards[0],0);
        section.querySelector('.case-enlarge').addEventListener('click',() => {
          const content = document.createElement('div');
          content.className = 'case-design-full';
          const fullImage = document.createElement('img');
          fullImage.src = activeBoard.src;
          fullImage.alt = activeBoard.alt;
          content.append(fullImage);
          dialog.querySelector('.case-dialog-content').replaceChildren(content);
          dialog.querySelector('#case-dialog-title').textContent = activeBoard.label;
          dialog.showModal();
        });
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

// A shallow pointer-responsive tilt on selected primary surfaces only.
(() => {
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const initDepth = () => document.querySelectorAll('.clone-value-card, .personal-case-images, .case-macbook, .project-category-tab, .retrospective-card, .project-details:not(.team-intro-copy), .case-scroll-card, .zara-story-panel, .section-admissions .admissions-list .item > a, .portfolio-film-frame, .monster-film-frame').forEach(surface => {
    if (surface.hasAttribute('data-depth-surface') || surface.parentElement.closest('[data-depth-surface]')) return;
    surface.dataset.depthSurface = '';
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      surface.style.removeProperty('--depth-axis');
      surface.style.removeProperty('--depth-angle');
    };
    surface.addEventListener('pointermove', event => {
      if (!motion.matches || surface.parentElement.closest('[data-depth-surface]')) return;
      const bounds = surface.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        surface.style.setProperty('--depth-axis', `${-y} ${x} 0`);
        surface.style.setProperty('--depth-angle', `${Math.min(2.5, Math.hypot(x, y) * 2)}deg`);
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    surface.addEventListener('focusout', reset);
    motion.addEventListener('change', reset);
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) reset();
    }).observe(surface);
  });
  initDepth();
  // Project tabs are constructed by the next deferred script.
  if (document.readyState !== 'complete') addEventListener('load', initDepth, { once: true });
})();
