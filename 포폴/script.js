/** Small, editable enhancements layered over the reference animation runtime. */
(() => {
  'use strict';
  const lazyImage=()=>{const image=document.createElement('img');image.loading='lazy';image.decoding='async';return image;};
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
  if (albumList) {
    new ResizeObserver(queueAlbum).observe(albumList);
    // One clock for all eight cards, independent of loading or scroll entry.
    const handwritingEpoch = performance.now();
    const syncHandwriting = () => {
      const phase = Math.floor((performance.now() - handwritingEpoch) / 1000) % 2;
      albumList.dataset.inkPhase = phase === 0 ? 'a' : 'b';
    };
    syncHandwriting();
    setInterval(syncHandwriting, 1000);
    document.addEventListener('visibilitychange', syncHandwriting);
  }
  queueAlbum();
  const galleryReveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.target.classList.toggle('gallery-in-view',entry.isIntersecting);
  }),{threshold:.12});
  const isolateGalleryWriting=async(photo,writing,preserveDarkInk=false,inkColor=[255,255,255],inkRegions=null)=>{
    try{
      await Promise.all([photo.decode(),writing.decode()]);
      const ratio=Math.min(1,1024/writing.naturalWidth);
      const width=Math.round(writing.naturalWidth*ratio);
      const height=Math.round(writing.naturalHeight*ratio);
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
        if(inkRegions){
          const x=(index%width)/width;
          const y=Math.floor(index/width)/height;
          if(!inkRegions.some(([left,top,right,bottom])=>x>=left&&x<=right&&y>=top&&y<=bottom))continue;
        }
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
        // Give every gallery annotation the same visual stroke weight and opacity.
        // The source lettering shape and per-card ink colour remain untouched.
        const alpha=connected?(stableCore[index]===1?232:156):0;
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
  // Decode and process one nearby gallery card at a time, outside initial rendering.
  const galleryJobs=[];
  let galleryBusy=false;
  const runGalleryJob=()=>{
    if(galleryBusy||!galleryJobs.length)return;
    galleryBusy=true;
    const run=async()=>{
      try{await galleryJobs.shift()();}
      finally{galleryBusy=false;runGalleryJob();}
    };
    if('requestIdleCallback' in window) requestIdleCallback(run,{timeout:1500});
    else setTimeout(run,32);
  };
  const galleryPreparation=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      galleryPreparation.unobserve(entry.target);
      galleryJobs.push(entry.target.prepareHandwriting);
      runGalleryJob();
    });
  },{rootMargin:'600px 0px'});
  albumCards.forEach((card,index)=>{
    const contents=card.querySelector('.item-contents');
    const asset=galleryPhotos[index];
    if(!contents||!asset)return;
    card.dataset.galleryIndex=String(index+1);
    const surface=document.createElement('div');surface.className='gallery-photo-surface';
    const photo=lazyImage();
    photo.className='gallery-photo-original';
    photo.src=index===1
      ? './assets/img/portfolio/gallery/photo-02-clean-v2-preview.jpg'
      : index===2
        ? './assets/img/portfolio/gallery/photo-03-clean-v4-preview.jpg'
        : `./assets/img/portfolio/gallery/${asset[0]}-clean-preview.jpg`;
    photo.alt=asset[1];
    photo.loading='lazy';
    const writing=lazyImage();
    writing.className='gallery-photo-writing';
    writing.src=index===0
      ? './assets/img/portfolio/gallery/photo-01-writing-v2-preview.png'
      : index===1
        ? './assets/img/portfolio/gallery/photo-02-writing-v2-preview.png'
      : index===2
        ? './assets/img/portfolio/gallery/photo-03-writing-v4-preview.png'
        : `./assets/img/portfolio/gallery/${asset[0]}-writing-preview.png`;
    writing.alt='';
    writing.setAttribute('aria-hidden','true');
    writing.loading='lazy';
    surface.append(photo,writing);
    contents.replaceChildren(surface);
    photo.decoding='async';
    writing.decoding='async';
    if(index===2) photo.alt='숙소 거울 앞에서 친구들과 함께 찍은 사진';
    card.prepareHandwriting=()=>isolateGalleryWriting(photo,writing,false,index===4?[64,38,31]:[255,255,255]);
    galleryPreparation.observe(card);
    if(index===2) card.tabIndex=0;
    card.style.setProperty('--gallery-delay',(index%4)*90+'ms');
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
    const aboutTitle = copy.querySelector('.about-intro-message h2');
    if (aboutTitle && aboutTitle.dataset.letterRevealReady !== 'true') {
      aboutTitle.dataset.letterRevealReady = 'true';
      const label = aboutTitle.textContent.replace(/\s+/g, ' ').trim();
      aboutTitle.setAttribute('aria-label', label);
      let aboutLetterIndex = 0;
      const textNodes = [];
      const walker = document.createTreeWalker(aboutTitle, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(textNode => {
        const fragment = document.createDocumentFragment();
        [...textNode.textContent].forEach(character => {
          const letter = document.createElement('span');
          letter.className = `about-title-letter${character === ' ' ? ' about-title-space' : ''}`;
          letter.setAttribute('aria-hidden', 'true');
          letter.textContent = character === ' ' ? '\u00a0' : character;
          letter.style.setProperty('--about-letter-delay', `${aboutLetterIndex * 55}ms`);
          fragment.append(letter);
          aboutLetterIndex += 1;
        });
        textNode.replaceWith(fragment);
      });
      aboutTitle.classList.add('is-about-title-ready');
    }
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
    let aboutHoldPlayed = false;
    let aboutHoldTimer = 0;
    const aboutBlockedKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
    const blockAboutScroll = event => {
      if (event.type !== 'keydown' || aboutBlockedKeys.has(event.key)) event.preventDefault();
    };
    const releaseAboutScroll = () => {
      clearTimeout(aboutHoldTimer);
      window.removeEventListener('wheel', blockAboutScroll, { capture: true });
      window.removeEventListener('touchmove', blockAboutScroll, { capture: true });
      window.removeEventListener('keydown', blockAboutScroll, { capture: true });
      document.documentElement.classList.remove('is-about-pin-holding');
    };
    document.addEventListener('portfolio:navigate', releaseAboutScroll);
    const holdAboutScroll = () => {
      releaseAboutScroll();
      if (document.documentElement.dataset.progressNavigating === 'true') return;
      document.documentElement.classList.add('is-about-pin-holding');
      aboutHoldTimer = window.setTimeout(releaseAboutScroll, 1000);
    };
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
      // Complete the zoom before the sticky hero ends, leaving a readable
      // hold on the fully opened ABOUT ME screen.
      const progress = clamp(displayedProgress / .70);
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
      const aboutTitleVisible = reduced.matches || reveal >= .38;
      aboutTitle?.classList.toggle('is-about-title-visible', aboutTitleVisible);
      if (!reduced.matches && aboutTitleVisible && !aboutHoldPlayed) {
        aboutHoldPlayed = true;
        holdAboutScroll();
      } else if (reveal < .12) {
        aboutHoldPlayed = false;
      }
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
    addEventListener('pagehide', releaseAboutScroll, { once: true });
    new ResizeObserver(queueHero).observe(scene);
    updateHero();
  }
  const aboutSection = document.querySelector('.about-hana');
  if (aboutSection) {
    const values = aboutSection.querySelector('.about-values');
    const cards = [...aboutSection.querySelectorAll('.about-value article')];
    const motion = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    const mobileValuesMotion = matchMedia('(max-width: 900px) and (prefers-reduced-motion: no-preference)');
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
        aboutSection.classList.toggle('is-values-flip-stage', motion.matches || mobileValuesMotion.matches);
        if (mobileValuesMotion.matches) {
          cards.forEach(card => {
            const top = card.closest('.about-value').getBoundingClientRect().top;
            const flip = clamp((innerHeight * .62 - top) / (innerHeight * .35));
            const eased = flip * flip * (3 - 2 * flip);
            card.style.opacity = '1';
            card.style.translate = 'none';
            card.style.setProperty('--flip-angle', `${eased * 180}deg`);
          });
          return;
        }
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
          const flip = clamp((progress - .22 - index * .04) / .48);
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
      mobileValuesMotion.addEventListener('change', queue);
      new ResizeObserver(queue).observe(values);
      update();
    }
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
    const revealMaterialImage = (card, image) => {
      const reveal = () => {
        if (image.naturalWidth > 0) card.classList.add('is-image-ready');
      };
      image.addEventListener('load', reveal, {once: true});
      if (image.complete) reveal();
    };
    const renderDocument = (container, data) => {
      container.querySelector('h4').textContent = data.title;
      const body = container.querySelector('.case-doc-body');
      body.replaceChildren();
      if (data.image) {
        const img = lazyImage();
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
        const labels = ['인터뷰 원문','응답 요약','어피니티 다이어그램'];
        const files = ['interview-full.jpg','interview-summary.jpg','interview-affinity.jpg'];
        const deck = document.createElement('div');
        deck.className = 'case-analysis-deck case-interview-deck';
        files.forEach((file,index) => {
          const figure = document.createElement('figure');
          figure.className = 'case-analysis-card';
          figure.dataset.interviewCard = String(index);
          const image = lazyImage();
          image.src = './assets/img/portfolio/' + file;
          image.alt = labels[index] + ' 원본 자료';
          image.loading = 'lazy';
          const figureCaption = document.createElement('figcaption');
          figureCaption.textContent = labels[index];
          figure.append(image,figureCaption);
          revealMaterialImage(figure, image);
          deck.append(figure);
        });
        const caption = section.querySelector('.case-enlarge');
        caption.disabled = false;
        let selected = 0;
        const openMaterial = () => {
          const full = lazyImage();
          full.src = deck.querySelector('.case-analysis-card.is-active img').src;
          full.alt = labels[selected];
          full.style.cssText = 'display:block;width:100%;height:auto;';
          dialog.querySelector('.case-dialog-content').replaceChildren(full);
          dialog.querySelector('#case-dialog-title').textContent = labels[selected];
          dialog.showModal();
        };
        deck.addEventListener('click',event => {
          if (event.target.tagName === 'IMG' && event.target.closest('.case-analysis-card.is-active')) openMaterial();
        });
        caption.addEventListener('click',openMaterial);
        const selectMaterial = index => {
          selected = index;
          deck.querySelectorAll('.case-analysis-card').forEach((card,cardIndex) => {
            const relative = (cardIndex - index + files.length) % files.length;
            card.style.setProperty('--stack-order',String(relative));
            card.classList.toggle('is-active',cardIndex === index);
            card.setAttribute('aria-hidden',String(cardIndex !== index));
            card.tabIndex = cardIndex === index ? 0 : -1;
            card.setAttribute('aria-label', labels[cardIndex] + ', 스크롤하여 전체 보기');
            if (cardIndex === index) card.scrollTop = 0;
          });
          deck.setAttribute('aria-label',labels[index] + ' 크게 보기');
          caption.replaceChildren(document.createTextNode(labels[index]));
          const hint = document.createElement('span');
          hint.textContent = '클릭하여 크게 보기 ↗';
          caption.append(hint);
          section.querySelectorAll('.case-tabs button').forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
        };
        documentPanel.replaceWith(deck);
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
          const image = lazyImage();
          image.src = card.src;
          image.alt = card.alt;
          image.loading = 'lazy';
          const caption = document.createElement('figcaption');
          caption.textContent = card.label;
          figure.append(image,caption);
          revealMaterialImage(figure, image);
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
            card.tabIndex = cardIndex === index ? 0 : -1;
            card.setAttribute('aria-label', analysisCards[cardIndex].label + ', 스크롤하여 전체 보기');
            if (cardIndex === index) card.scrollTop = 0;
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
            const image = lazyImage();
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
            card.setAttribute('aria-label', group.label + ' ' + (index + 1) + ' 크게 보기');
            const image = lazyImage();
            image.src = './assets/img/portfolio/' + file;
            image.alt = group.label + ' ' + (index + 1) + ' 원본 자료';
            const label = document.createElement('span');
            label.textContent = group.label + ' ' + (index + 1);
            card.append(image, label);
            card.addEventListener('click', () => openImages(group, index));
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
        const requirementsChart = { label: '요구사항 정의서', src: './assets/img/portfolio/process-requirements.png', alt: '딥티크 웹사이트 요구사항 정의서 수정본, 페이지별 58개 요구사항과 상세 기능' };
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
        const image = lazyImage();
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
        const flowDeck = document.createElement('div');
        flowDeck.className = 'case-flow-deck';
        flowDeck.hidden = true;
        flowDeck.setAttribute('aria-label', '사용자 플로우 자료 3개');
        flowCharts.forEach(chart => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'case-planning-image-card';
          card.setAttribute('aria-label', chart.label + ' 크게 보기');
          const preview = lazyImage();
          preview.src = chart.src;
          preview.alt = chart.alt;
          const label = document.createElement('span');
          label.textContent = chart.label;
          card.append(preview, label);
          card.addEventListener('click', () => {
            activeChart = chart;
            section.querySelector('.case-enlarge').click();
          });
          flowDeck.append(card);
        });
        gallery.append(flowDeck);
        const modes = [
          { label: '메뉴트리', show: () => { activeChart = menuTree; image.src = menuTree.src; image.alt = menuTree.alt; viewport.scrollTop = 0; viewport.hidden = false; flowSelector.hidden = true; documentPanel.hidden = true; gallery.classList.add('is-menu-tree'); gallery.classList.remove('has-flow-selector'); } },
          { label: '사용자 플로우', show: () => { activeChart = flowCharts[0]; viewport.hidden = true; flowSelector.hidden = true; documentPanel.hidden = true; gallery.classList.remove('is-menu-tree','has-flow-selector'); } },
          { label: '요구사항', show: () => { activeChart = requirementsChart; image.src = requirementsChart.src; image.alt = requirementsChart.alt; viewport.scrollTop = 0; viewport.hidden = false; flowSelector.hidden = true; documentPanel.hidden = true; gallery.classList.remove('is-menu-tree','has-flow-selector'); } }
        ];
        tabs.replaceChildren(...modes.map((mode,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = mode.label;
          button.addEventListener('click',() => {
            modes.forEach((item,itemIndex) => tabs.children[itemIndex].setAttribute('aria-pressed',String(item === mode)));
            gallery.classList.toggle('is-requirements', mode.label === '요구사항');
            gallery.classList.toggle('is-flow-deck', mode.label === '사용자 플로우');
            flowDeck.hidden = mode.label !== '사용자 플로우';
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
          const fullImage = lazyImage();
          fullImage.src = activeChart.src;
          fullImage.alt = activeChart.alt;
          content.append(fullImage);
          if (activeChart === requirementsChart) {
            const original = document.createElement('a');
            original.href = requirementsChart.src;
            original.target = '_blank';
            original.rel = 'noopener noreferrer';
            original.textContent = '고화질 원본 보기 ↗';
            original.style.cssText = 'display:inline-block;margin:0 0 16px;color:inherit;text-underline-offset:4px';
            content.prepend(original);
          }
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
        const image = lazyImage();
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
          const fullImage = lazyImage();
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
        preview.dataset.src = './team-preview.html';
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
          if(previewVisible&&!preview.hasAttribute('src')) preview.src=preview.dataset.src;
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
    walkthrough.classList.add('is-materials-ready');
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
    const englishTextReveals=panels.map(panel=>{
      const line=panel.querySelector('.case-step-english');
      if(!line) return null;
      const label=line.textContent;
      line.setAttribute('aria-label',label);
      line.textContent='';
      const characters=Array.from(label,character=>{
        const span=document.createElement('span');
        span.className='case-step-tone-character';
        span.setAttribute('aria-hidden','true');
        span.textContent=character;
        line.append(span);
        return span;
      });
      return {characters,progress:-1};
    });
    const horizontalMode=matchMedia('(prefers-reduced-motion: no-preference)');
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
      const trackGap=parseFloat(getComputedStyle(track).columnGap)||0;
      const stride=(panels[0]?.getBoundingClientRect().width||viewport.clientWidth)+trackGap;
      const travel=stride*(panels.length-1);
      const firstPanelHold=horizontalMode.matches?innerHeight*.25:0;
      walkthrough.classList.toggle('case-horizontal-pinned',horizontalMode.matches);
      if (horizontalMode.matches && viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
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
      walkthrough.style.setProperty('height', horizontalMode.matches ? sticky.offsetHeight+firstPanelHold+travel+'px' : 'auto', horizontalMode.matches ? 'important' : '');
      const walkthroughRect=walkthrough.getBoundingClientRect();
      const rawOffset=horizontalMode.matches?Math.max(0,Math.min(travel,-walkthroughRect.top-firstPanelHold)):viewport.scrollLeft;
      const nextPanel=Math.min(panels.length-1,Math.floor(rawOffset/Math.max(1,stride)));
      const hasReachedProjectWalkthrough = walkthroughRect.top <= -firstPanelHold;
      const panelPosition=rawOffset/Math.max(1,stride);
      englishTextReveals.forEach((reveal,index)=>{
        if(!reveal) return;
        const progress=index===0&&horizontalMode.matches
          ? Math.max(0,Math.min(1,-walkthroughRect.top/Math.max(1,firstPanelHold)))
          : Math.max(0,Math.min(1,(panelPosition-(index-.9))/.9));
        const litCount=Math.round(progress*reveal.characters.length);
        reveal.characters.forEach((character,characterIndex)=>character.classList.toggle('is-deep',characterIndex<litCount));
        reveal.progress=progress;
      });
      if(horizontalMode.matches && document.documentElement.dataset.progressNavigating !== 'true' && hasReachedProjectWalkthrough && nextPanel>pausedPanel){
        const sectionTop=window.scrollY+walkthroughRect.top;
        const snapY=sectionTop+firstPanelHold+(nextPanel*stride);
        pausedPanel=nextPanel;
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
      track.style.setProperty('transform', horizontalMode.matches ? 'translate3d('+(-offset)+'px,0,0)' : 'none', horizontalMode.matches ? 'important' : '');
      const active=Math.round(offset/Math.max(1,stride));
      panels.forEach((panel,index)=>{
        const distance=Math.min(1,Math.abs(index-offset/Math.max(1,stride)));
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

// Reveal whole design-value cards after their title crosses the viewport midpoint.
(() => {
  const initDesignValuesReveal = () => {
    const values = document.querySelector('.design-values-content');
    if (!values || values.dataset.revealReady === 'true') return;
    values.dataset.revealReady = 'true';
    const cards = [...values.querySelectorAll('.clone-value-card')];
    let revealTimers = [];
    let sectionVisible = false;

    const revealCards = (immediate = false) => {
      if (values.classList.contains('is-values-revealed')) return;
      values.classList.add('is-values-revealed');
      cards.forEach((card, index) => {
        if (immediate) card.classList.add('is-value-revealed');
        else revealTimers.push(window.setTimeout(() => card.classList.add('is-value-revealed'), index * 320));
      });
    };
    const resetCards = () => {
      revealTimers.forEach(timer => window.clearTimeout(timer));
      revealTimers = [];
      values.classList.remove('is-values-revealed');
      cards.forEach(card => card.classList.remove('is-value-revealed'));
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealCards(true);
      return;
    }

    const heading = values.closest('section')?.querySelector('.clone-intro .section-heading');
    if (!heading) {
      revealCards(true);
      return;
    }
    let frame = 0;
    const checkTitle = () => {
      frame = 0;
      if (!sectionVisible) return;
      const bounds = heading.getBoundingClientRect();
      if (bounds.top + bounds.height / 2 > window.innerHeight / 2) return;
      revealCards();
    };
    const queueCheck = () => {
      if (!frame) frame = requestAnimationFrame(checkTitle);
    };
    window.addEventListener('scroll', queueCheck, { passive: true, capture: true });
    window.addEventListener('resize', queueCheck);
    new IntersectionObserver(entries => {
      const entry = entries[0];
      sectionVisible = entry.isIntersecting;
      if (sectionVisible) queueCheck();
      else resetCards();
    }, { threshold: 0 }).observe(values);
    queueCheck();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesignValuesReveal, { once: true });
  } else {
    initDesignValuesReveal();
  }
})();

// Fly every primary section title into place with one shared interaction.
(() => {
  const initSectionTitleFlights = () => {
    const footerLogo = document.querySelector('[data-layout="page-home"] .footer .logo');
    if (footerLogo && !footerLogo.querySelector('.footer-contact-flight-title')) {
      const contactTitle = document.createElement('span');
      contactTitle.className = 'footer-contact-flight-title';
      contactTitle.textContent = 'CONTACT';
      footerLogo.append(contactTitle);
      footerLogo.classList.add('has-flight-title');
    }
    if (footerLogo && !footerLogo.querySelector('.footer-hana-brand')) {
      const contactTitle = footerLogo.querySelector('.footer-contact-flight-title');
      const brand = document.createElement('img');
      brand.loading = 'lazy';
      brand.className = 'footer-hana-brand';
      brand.src = './assets/img/brand/hana-lavender-optimized.png';
      brand.alt = 'HANA';
      brand.width = 2172;
      brand.height = 724;
      brand.decoding = 'async';
      contactTitle?.after(brand);
    }

    const titles = document.querySelectorAll([
      '.all-projects-heading h2',
      '.team-personal-heading h3',
      '.clone-intro h2.section-heading',
      '.skills-heading h2',
      '.gallery-heading h2'
    ].join(','));

    titles.forEach(title => {
      const heading = title.parentElement;
      if (!heading || title.dataset.titleFlightReady === 'true') return;
      title.dataset.titleFlightReady = 'true';

      const label = title.textContent.replace(/\s+/g, ' ').trim();
      title.setAttribute('aria-label', label);
      title.textContent = '';
      [...label].forEach((character, index) => {
        const letter = document.createElement('span');
        letter.className = `section-flight-letter${character === ' ' ? ' section-flight-space' : ''}`;
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character === ' ' ? '\u00a0' : character;
        const direction = index % 4;
        letter.style.setProperty('--section-fly-x', `${[-90, 48, -38, 82][direction]}px`);
        letter.style.setProperty('--section-fly-y', `${[54, 88, 110, 62][direction]}px`);
        letter.style.setProperty('--section-fly-r', `${[-12, 8, -6, 11][direction]}deg`);
        letter.style.setProperty('--section-fly-delay', `${index * 46}ms`);
        title.append(letter);
      });
      title.classList.add('section-title-flight');
      heading.classList.add('section-title-flight-host', 'is-flight-ready');

      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        heading.classList.add('is-title-arrived');
        return;
      }

    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(initSectionTitleFlights), { once: true });
  } else {
    requestAnimationFrame(initSectionTitleFlights);
  }
  document.addEventListener('portfolio:sections-ready', () => requestAnimationFrame(initSectionTitleFlights));
})();

// Match the movie introduction to the shared portfolio heading system.
(() => {
  const initMovieHeading = () => {
    const heading = document.querySelector('[data-layout="page-home"] .section-movie .section-heading');
    if (!heading || heading.dataset.movieHeadingReady === 'true') return;

    heading.dataset.movieHeadingReady = 'true';
    heading.removeAttribute('data-anime');
    heading.classList.add('movie-section-heading');
    heading.innerHTML = `
      <span class="movie-heading-kicker team-intro-eyebrow movie-project-eyebrow project-sparkle-label"><span class="gallery-label-sparkle project-label-sparkle" aria-hidden="true"><svg viewBox="0 0 90 90" aria-hidden="true" focusable="false"><path d="M45 15Q48 43 75 46Q48 49 45 77Q42 49 15 46Q42 43 45 15Z" fill="#f9ecf0" stroke="#c5b0de" stroke-width="3"/><path d="M17 2Q18 15 30 17Q18 19 17 32Q15 19 3 17Q15 15 17 2Z" fill="#e7d7f6" stroke="#c5b0de" stroke-width="1.5"/><circle cx="76" cy="72" r="5" fill="#e2cdef"/><circle cx="85" cy="84" r="2.5" fill="#f4dfce"/></svg></span><span class="project-label-number">03</span><span class="project-label-name">MOVIE <span lang="ko">영상</span></span><span class="gallery-label-sparkle project-label-sparkle gallery-label-sparkle-right" aria-hidden="true"><svg viewBox="0 0 90 90" aria-hidden="true" focusable="false"><path d="M45 15Q48 43 75 46Q48 49 45 77Q42 49 15 46Q42 43 45 15Z" fill="#f9ecf0" stroke="#c5b0de" stroke-width="3"/><path d="M17 2Q18 15 30 17Q18 19 17 32Q15 19 3 17Q15 15 17 2Z" fill="#e7d7f6" stroke="#c5b0de" stroke-width="1.5"/><circle cx="76" cy="72" r="5" fill="#e2cdef"/><circle cx="85" cy="84" r="2.5" fill="#f4dfce"/></svg></span></span>
      <span class="movie-heading-title" aria-label="MOVIE"></span>
      <span class="movie-heading-description">감각과 이야기를 움직임으로 담아낸 영상 작업입니다.</span>
    `;

    const title = heading.querySelector('.movie-heading-title');
    const offsets = [
      ['-90px', '45px', '-10deg'],
      ['-46px', '-62px', '7deg'],
      ['0px', '72px', '-5deg'],
      ['48px', '-54px', '8deg'],
      ['92px', '40px', '-8deg']
    ];

    [...'MOVIE'].forEach((character, index) => {
      const letter = document.createElement('span');
      const [x, y, rotation] = offsets[index];
      letter.className = 'movie-title-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.textContent = character;
      letter.style.setProperty('--fly-x', x);
      letter.style.setProperty('--fly-y', y);
      letter.style.setProperty('--fly-r', rotation);
      letter.style.setProperty('--fly-delay', `${index * 55}ms`);
      title.append(letter);
    });
    heading.classList.add('is-flight-ready');

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      heading.classList.add('is-title-arrived');
      return;
    }

  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMovieHeading, { once: true });
  } else {
    initMovieHeading();
  }
})();

// Deepen the journey statement one character at a time while preserving its mixed fonts.
(() => {
  const initJourneyToneReveal = () => {
    const opening = document.querySelector('.about-story-opening');
    const lines = [...(opening?.querySelectorAll('.opening-line') || [])];
    if (!opening || !lines.length || opening.dataset.journeyToneReady === 'true') return;
    opening.dataset.journeyToneReady = 'true';

    // Give the reveal its own scroll distance while keeping the statement in view.
    if (!opening.parentElement.classList.contains('journey-pin-stage')) {
      const stage = document.createElement('div');
      stage.className = 'journey-pin-stage';
      opening.before(stage);
      stage.append(opening);
    }

    let characterIndex = 0;
    lines.forEach(line => {
      const label = line.textContent.replace(/\s+/g, ' ').trim();
      line.setAttribute('aria-label', label);
      const textNodes = [];
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(textNode => {
        // The line already has a flex gap between its styled word groups.
        // Removing indentation/bridge whitespace prevents that gap doubling.
        if (textNode.parentElement === line && !textNode.textContent.trim()) {
          textNode.remove();
          return;
        }
        const fragment = document.createDocumentFragment();
        [...textNode.textContent].forEach(character => {
          const letter = document.createElement('span');
          letter.className = `journey-tone-letter${character === ' ' ? ' journey-tone-space' : ''}`;
          letter.setAttribute('aria-hidden', 'true');
          letter.textContent = character === ' ' ? '\u00a0' : character;
          letter.style.setProperty('--journey-tone-progress', '0');
          fragment.append(letter);
          characterIndex += 1;
        });
        textNode.replaceWith(fragment);
      });
    });
    opening.classList.add('is-journey-tone-ready');

    const letters = [...opening.querySelectorAll('.journey-tone-letter')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) {
      letters.forEach(letter => letter.style.setProperty('--journey-tone-progress', '1'));
      return;
    }

    const stage = opening.parentElement;
    let frame = 0;
    const renderToneProgress = () => {
      frame = 0;
      const bounds = stage.getBoundingClientRect();
      const pinDistance = stage.offsetHeight - innerHeight;
      const progress = pinDistance > 1
        ? Math.max(0, Math.min(1, -bounds.top / (pinDistance * .72)))
        : Math.max(0, Math.min(1, (innerHeight * .76 - bounds.top) / (innerHeight * .62)));
      const sweep = letters.length + 7;
      letters.forEach((letter, index) => {
        const letterProgress = Math.max(0, Math.min(1, (progress * sweep - index) / 7));
        letter.style.setProperty('--journey-tone-progress', letterProgress.toFixed(3));
      });
    };
    const queueToneProgress = () => {
      if (!frame) frame = requestAnimationFrame(renderToneProgress);
    };
    addEventListener('scroll', queueToneProgress, { passive: true });
    addEventListener('resize', queueToneProgress, { passive: true });
    renderToneProgress();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJourneyToneReveal, { once: true });
  } else {
    initJourneyToneReveal();
  }
})();

// Portfolio progress navigation: move the heart with scroll and make each dot a section shortcut.
(() => {
  const initProgressNavigation = () => {
    const container = document.querySelector('[data-scrollbar="container"]');
    if (!container || container.dataset.progressNavigationReady === 'true') return;

    const bar = container.querySelector('[data-scrollbar="bar"]');
    const points = [...container.querySelectorAll('[data-progress-target]')];
    const sections = points.map(point => ({
      point,
      section: document.getElementById(point.dataset.progressTarget)
    }));
    // Wait for the personal projects wrapper inserted by all-projects.js.
    if (!bar || points.length !== 6 || sections.some(item => !item.section)) return;

    container.dataset.progressNavigationReady = 'true';
    let frame = 0;
    let navigationTarget = null;
    let navigationTimer = 0;
    const getDocumentTop = element => element.getBoundingClientRect().top + window.scrollY;

    const render = () => {
      frame = 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const anchors = sections.map((item, index) => index === 0
        ? 0
        : Math.max(0, Math.min(maxScroll, getDocumentTop(item.section) - 80)));
      let positionIndex = navigationTarget ? sections.indexOf(navigationTarget) : 0;
      if (!navigationTarget && scrollY > 0) {
        positionIndex = sections.length - 1;
        for (let index = 0; index < anchors.length - 1; index++) {
          if (scrollY <= anchors[index + 1]) {
            const distance = Math.max(1, anchors[index + 1] - anchors[index]);
            const between = Math.max(0, Math.min(1, (scrollY - anchors[index]) / distance));
            positionIndex = index + between;
            break;
          }
        }
      }
      const currentIndex = Math.max(0, Math.min(sections.length - 1, Math.round(positionIndex)));
      const current = sections[currentIndex];
      const trackProgress = sections.length > 1
        ? 2 + (positionIndex / (sections.length - 1)) * 96
        : 2;
      bar.style.setProperty('--page-progress', `${trackProgress}%`);

      sections.forEach(item => {
        const active = item === current;
        item.point.classList.toggle('is-current', active);
        if (active) item.point.setAttribute('aria-current', 'location');
        else item.point.removeAttribute('aria-current');
      });
    };

    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const navigateTo = item => {
      if (!item) return;
      document.documentElement.dataset.progressNavigating = 'true';
      navigationTarget = item;
      clearTimeout(navigationTimer);
      render();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const top = item === sections[0]
        ? 0
        : Math.max(0, Math.min(maxScroll, getDocumentTop(item.section) - 80));
      window.scrollTo({ top, behavior: 'auto' });
      navigationTimer = setTimeout(() => {
        delete document.documentElement.dataset.progressNavigating;
        navigationTarget = null;
        requestRender();
      }, 120);
    };

    sections.forEach(item => {
      item.point.addEventListener('click', event => {
        event.preventDefault();
        navigateTo(item);
      });
    });

    addEventListener('scroll', requestRender, { passive: true });
    addEventListener('resize', requestRender, { passive: true });
    addEventListener('load', requestRender, { once: true });
    const layoutObserver = new ResizeObserver(requestRender);
    layoutObserver.observe(document.body);
    sections.forEach(item => layoutObserver.observe(item.section));
    render();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProgressNavigation, { once: true });
  else initProgressNavigation();
  document.addEventListener('portfolio:sections-ready', initProgressNavigation);
})();

// Move the floating controls outside animated footer ancestors so positioning uses the viewport.
(() => {
  const mountFloatingTopButton = () => {
    const button = document.querySelector('.footer .page-top');
    const chatbot = document.querySelector('.footer .hana-chatbot');
    if (!button || button.classList.contains('is-floating-top')) return;
    button.classList.add('is-floating-top');
    const actions = document.createElement('div');
    actions.className = 'hana-floating-actions';
    if (chatbot) actions.append(chatbot);
    actions.append(button);
    document.body.append(actions);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountFloatingTopButton, { once: true });
  else mountFloatingTopButton();
})();

// Compact portfolio chatbot attached to the floating HANA avatar.
(() => {
  const initHanaChatbot = () => {
    const chatbot = document.querySelector('[data-hana-chatbot]');
    if (!chatbot) return;

    const launcher = chatbot.querySelector('.hana-chatbot-launcher');
    const panel = chatbot.querySelector('.hana-chatbot-panel');
    const closeButton = chatbot.querySelector('.hana-chatbot-close');
    const form = chatbot.querySelector('.hana-chatbot-form');
    const input = chatbot.querySelector('#hana-chatbot-input');
    const body = chatbot.querySelector('.hana-chatbot-body');
    const topicButtons = chatbot.querySelectorAll('.hana-chatbot-topics button');
    const answers = {
      '자기소개': '안녕하세요. 사무직 경험을 바탕으로 웹디자인과 코딩을 배우며 성장하고 있는 HANA입니다. 사용자가 편리하게 이용할 수 있는 화면을 만들기 위해 작은 부분까지 꼼꼼하게 살피고 있습니다.',
      '사무직 경험': '여러 업무를 경험하며 정보를 꼼꼼하게 정리하고 일정에 맞춰 작업하는 습관을 길렀습니다. 업무 방식이 바뀌었을 때 다른 사람도 쉽게 이해할 수 있도록 인수인계 자료를 직접 만든 경험도 있습니다. 이를 바탕으로 사용자 입장에서 정보를 이해하기 쉽게 구성하려고 합니다.',
      '디자인을 시작한 이유': '기존 업무를 하며 앞으로의 성장 방향을 고민하던 중, 새로운 기술을 배우고 직접 결과물을 만드는 일에 관심이 생겨 웹디자인을 공부하기 시작했습니다. 생각했던 디자인이 실제 화면으로 구현될 때 가장 큰 재미와 보람을 느낍니다.',
      '딥티크 프로젝트': '가장 기억에 남는 작업은 딥티크 웹사이트 리뉴얼 팀 프로젝트입니다. 브랜드의 분위기를 화면에 담기 위해 시안을 만들고 피드백을 반영하며 완성도를 높였고, 팀원들과 하나의 결과물을 함께 만들었다는 점에서 특히 기억에 남습니다.',
      '담당 역할': '딥티크 팀 프로젝트에서 ‘For The Planet’ 페이지를 중심으로 일부 서브페이지 디자인과 발표를 담당했습니다.',
      '성장 방향': '보기 좋은 디자인을 넘어 사용자가 편리하게 이용할 수 있는 화면을 만들고 싶습니다. 디자인과 코딩 경험을 꾸준히 쌓으며 작은 부분도 놓치지 않는 디자이너로 성장하는 것이 목표입니다.',
      '개인 작업': '브랜드의 인상을 화면과 움직임으로 표현한 개인 웹 프로젝트들을 소개하고 있어요.',
      '클론 코딩': '기존 사이트의 구조와 표현을 분석한 뒤 직접 구현하며 레이아웃과 반응형 감각을 익혔습니다.',
      '사용 기술': 'HTML, CSS, JavaScript와 GSAP을 중심으로 디자인을 실제 웹 화면으로 구현합니다.',
      '연락처': '이메일 cogksk001@gmail.com 으로 편하게 연락해주세요.'
    };

    const setOpen = (open) => {
      chatbot.classList.toggle('is-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if (open) window.setTimeout(() => input.focus({ preventScroll: true }), 220);
    };

    const addMessage = (text, kind = 'answer') => {
      const message = document.createElement('div');
      message.className = `hana-chatbot-message is-${kind}`;
      message.textContent = text;
      body.append(message);
      body.scrollTop = body.scrollHeight;
    };

    let nudgeTimer = 0;
    let nudgeClearTimer = 0;
    let hasBeenOpened = false;
    const stopAutoNudge = () => {
      hasBeenOpened = true;
      clearInterval(nudgeTimer);
      clearTimeout(nudgeClearTimer);
      chatbot.classList.remove('is-auto-nudging');
    };

    launcher.addEventListener('click', () => {
      stopAutoNudge();
      setOpen(!chatbot.classList.contains('is-open'));
    });
    closeButton.addEventListener('click', () => setOpen(false));
    topicButtons.forEach((button) => button.addEventListener('click', () => {
      addMessage(button.textContent.trim(), 'question');
      addMessage(answers[button.textContent.trim()] || '해당 내용은 포트폴리오에서 자세히 확인하실 수 있어요.');
    }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      addMessage(question, 'question');
      const normalized = question.replace(/\s+/g, '').toLowerCase();
      const topicKeywords = {
        '자기소개': ['자기소개', '누구', '소개'],
        '사무직 경험': ['사무직', '직장경험', '강점', '인수인계'],
        '디자인을 시작한 이유': ['시작', '전환', '이유', '웹디자인'],
        '딥티크 프로젝트': ['딥티크', '프로젝트', '기억'],
        '담당 역할': ['담당', '역할', '포더플래닛'],
        '성장 방향': ['성장', '목표', '디자이너'],
        '개인 작업': ['개인작업', '온다'],
        '클론 코딩': ['클론', '코딩'],
        '사용 기술': ['기술', 'html', 'css', 'javascript', 'gsap'],
        '연락처': ['연락', '이메일', '메일']
      };
      const matchedTopic = Object.keys(answers).find((topic) =>
        (topicKeywords[topic] || [topic]).some((keyword) => normalized.includes(keyword.replace(/\s+/g, '').toLowerCase()))
      );
      addMessage(matchedTopic ? answers[matchedTopic] : '질문 감사합니다! 현재는 포트폴리오 안내용 챗봇이며, 더 자세한 문의는 cogksk001@gmail.com 으로 보내주세요.');
      input.value = '';
    });
    document.addEventListener('pointerdown', (event) => {
      if (chatbot.classList.contains('is-open') && !chatbot.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && chatbot.classList.contains('is-open')) {
        setOpen(false);
        launcher.focus();
      }
    });

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nudgeTimer = window.setInterval(() => {
        if (hasBeenOpened || chatbot.classList.contains('is-open') || launcher.matches(':hover')) return;
        chatbot.classList.remove('is-auto-nudging');
        void chatbot.offsetWidth;
        chatbot.classList.add('is-auto-nudging');
        clearTimeout(nudgeClearTimer);
        nudgeClearTimer = window.setTimeout(() => chatbot.classList.remove('is-auto-nudging'), 1100);
      }, 5000);
      addEventListener('pagehide', () => {
        clearInterval(nudgeTimer);
        clearTimeout(nudgeClearTimer);
      }, { once: true });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHanaChatbot, { once: true });
  else initHanaChatbot();
})();

// Re-arm legacy entrance classes whenever their section leaves and re-enters the viewport.
(() => {
  const initReplayableEntrances = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const targets = new Set(document.querySelectorAll([
      '[data-global="admissions"]',
      '[data-global="movie"]',
      '[data-global="more-information"]',
      '[data-global="official-account"]',
      '[data-global="admissions"] [data-item*="panel-"]',
      '[data-global="admissions"] [data-item*="button"]',
      '[data-global="movie"] [data-item*="panel-"]',
      '[data-global="movie"] [data-item*="button"]',
      '[data-global="movie"] [data-css-anime]',
      '[data-global="messages"] [data-css-anime]'
    ].join(',')));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= .12) entry.target.classList.add('is-action');
        else if (!entry.isIntersecting) entry.target.classList.remove('is-action');
      });
    }, { threshold: [0, .12], rootMargin: '0px 0px -6% 0px' });

    targets.forEach(target => observer.observe(target));
  };

  if (document.readyState === 'complete') initReplayableEntrances();
  else addEventListener('load', initReplayableEntrances, { once: true });
})();

// Original staggered title flight, using lightweight one-time observation.
(() => {
  const root=document.documentElement;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const completed=new WeakSet();
  let timer=0;
  let holding=false;
  const keys=new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);
  const block=event=>{
    if(event.type!=='keydown'||keys.has(event.key))event.preventDefault();
  };
  const release=()=>{
    clearTimeout(timer);
    holding=false;
    root.classList.remove('is-title-pin-holding');
    window.removeEventListener('wheel',block,true);
    window.removeEventListener('touchmove',block,true);
    window.removeEventListener('keydown',block,true);
  };
  const reveal=heading=>{
    if(completed.has(heading))return;
    completed.add(heading);
    heading.classList.add('is-title-arrived');
    if(motion.matches||root.dataset.progressNavigating==='true'||document.hidden||holding)return;
    holding=true;
    root.classList.add('is-title-pin-holding');
    window.addEventListener('wheel',block,{passive:false,capture:true});
    window.addEventListener('touchmove',block,{passive:false,capture:true});
    window.addEventListener('keydown',block,{capture:true});
    const letters=heading.querySelectorAll('.section-flight-letter,.movie-title-letter').length;
    const stagger=heading.matches('.movie-section-heading')?55:46;
    const duration=Math.max(1170,850+Math.max(0,letters-1)*stagger)+80;
    timer=setTimeout(release,Math.min(2400,duration));
  };
  const observed=new WeakSet();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);
      reveal(entry.target);
    });
  },{rootMargin:'-30% 0px -30% 0px',threshold:0});
  const init=()=>{
    document.querySelectorAll('.section-title-flight-host:not(.logo),.movie-section-heading').forEach(heading=>{
      if(observed.has(heading))return;
      observed.add(heading);
      const rect=heading.getBoundingClientRect();
      if(motion.matches||rect.top<innerHeight*.3||rect.height>innerHeight*.7){
        completed.add(heading);
        heading.classList.add('is-title-arrived');
      }else observer.observe(heading);
    });
  };
  document.addEventListener('portfolio:navigate',()=>{
    release();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      document.querySelectorAll('.section-title-flight-host:not(.logo),.movie-section-heading').forEach(heading=>{
        const rect=heading.getBoundingClientRect();
        if(rect.bottom>0&&rect.top<innerHeight*.3){
          observer.unobserve(heading);
          completed.add(heading);
          heading.classList.add('is-title-arrived');
        }
      });
    }));
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  addEventListener('pagehide',release);
  motion.addEventListener('change',()=>{release();init();});
  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(init));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  document.addEventListener('portfolio:sections-ready',schedule);
})();

// A shallow pointer-responsive tilt on selected primary surfaces only.
(() => {
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const initDepth = () => document.querySelectorAll('.clone-value-card, .case-macbook, .retrospective-card, .project-details:not(.team-intro-copy), .case-scroll-card, .diptyque-story-panel, .section-admissions .admissions-list .item > a').forEach(surface => {
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

// Reveal navigation when the pointer approaches the header area.
(() => {
  const header = document.querySelector('header.header');
  if (!header) return;
  header.classList.add('has-scroll-navigation');
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  const mobileHeader = matchMedia('(max-width: 900px), (hover: none)');
  let pointerY = Infinity;
  let lastHeaderScrollY = Math.max(0, scrollY);
  let headerScrollDistance = 0;
  let mobileHeaderHidden = false;
  const update = () => {
    const currentY = Math.max(0, Math.min(scrollY, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
    const delta = currentY - lastHeaderScrollY;
    lastHeaderScrollY = currentY;
    if (mobileHeader.matches) {
      if (delta && Math.sign(delta) !== Math.sign(headerScrollDistance)) headerScrollDistance = 0;
      headerScrollDistance += delta;
      if (currentY <= 40) {
        mobileHeaderHidden = false;
        headerScrollDistance = 0;
      } else if (Math.abs(headerScrollDistance) >= 10) {
        mobileHeaderHidden = headerScrollDistance > 0;
        headerScrollDistance = 0;
      }
      const keyboardFocused = Boolean(header.querySelector(':focus-visible'));
      header.classList.toggle('is-scroll-hidden', mobileHeaderHidden && !keyboardFocused);
      return;
    }
    const nearHeader = pointerY <= header.offsetHeight + 16;
    const focused = header.contains(document.activeElement);
    const hidden = hoverPointer.matches && scrollY > 40 && !nearHeader && !focused;
    header.classList.toggle('is-scroll-hidden', hidden);
  };
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointerY = event.clientY;
    update();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointerY = Infinity;
    update();
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  hoverPointer.addEventListener('change', update);
  mobileHeader.addEventListener('change', () => {
    mobileHeaderHidden = false;
    headerScrollDistance = 0;
    lastHeaderScrollY = Math.max(0, scrollY);
    update();
  });
  header.addEventListener('focusin', update);
  header.addEventListener('focusout', () => requestAnimationFrame(update));
  update();
})();

// Header links bypass the reference runtime's anchor scrolling and title holds.
(() => {
  let navigationTimer = 0;
  window.addEventListener('click', event => {
    const link = event.target.closest?.('header.header a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    clearTimeout(navigationTimer);
    document.documentElement.dataset.progressNavigating = 'true';
    document.dispatchEvent(new Event('portfolio:navigate'));
    window.ScrollTrigger?.refresh();
    requestAnimationFrame(() => {
      const headerHeight = document.querySelector('header.header').getBoundingClientRect().height;
      const top = Math.max(0, target.getBoundingClientRect().top + scrollY - headerHeight - 16);
      window.scrollTo({ top, behavior: 'instant' });
      history.replaceState(null, '', link.hash);
      navigationTimer = setTimeout(() => {
        delete document.documentElement.dataset.progressNavigating;
      }, 300);
    });
  }, true);
})();

// Coalesce layout updates instead of refreshing the animation runtime per asset.
(() => {
  let refreshTimer=0;
  const refresh=()=>{
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{
      if(document.documentElement.classList.contains('is-title-pin-holding')){refresh();return;}
      window.ScrollTrigger?.refresh();
    },180);
  };
  document.fonts?.ready.then(refresh);
  document.addEventListener('load',event=>{
    if(event.target instanceof HTMLImageElement) refresh();
  },true);
})();
