let active=false,last=0,position=0,waitUntil=0,ending=false,stable=0,height=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const videos=()=>document.querySelectorAll('video').forEach(video=>{
  video.muted=true;video.playsInline=true;video.playbackRate=1;
  if(active&&!reduced.matches)video.play().catch(()=>{});else video.pause();
});
addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='culita-preview-visibility')return;
  if(!waitUntil)waitUntil=performance.now()+1500;
  active=event.data.visible;last=0;videos();
});
// The iframe load event can fire before this module finishes importing.
// Request the current visibility again once the player is ready.
parent.postMessage({type:'culita-preview-ready'},location.origin);
new MutationObserver(videos).observe(document.body,{childList:true,subtree:true});
function frame(now){
  requestAnimationFrame(frame);
  if(!active||document.hidden||reduced.matches){last=0;return;}
  const elapsed=last?Math.min(now-last,50):0;last=now;
  if(now<waitUntil)return;
  const nextHeight=document.documentElement.scrollHeight;
  stable=height===nextHeight?stable+elapsed:0;height=nextHeight;
  const bottom=Math.max(0,height-innerHeight);
  if(bottom<100)return;
  if(ending){position=0;scrollTo({top:0,behavior:'instant'});ending=false;waitUntil=now+4500;return;}
  const speed=innerWidth<600?.32:.65;
  position=Math.min(bottom,Math.max(position,scrollY)+elapsed*speed);
  scrollTo({top:position,behavior:'instant'});
  const footer=document.querySelector('footer')?.getBoundingClientRect();
  if(position>=bottom-2&&stable>3000&&footer&&footer.bottom<=innerHeight+4){ending=true;waitUntil=now+4500;}
}
requestAnimationFrame(frame);
