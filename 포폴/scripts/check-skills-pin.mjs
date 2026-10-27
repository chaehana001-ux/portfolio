import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir(new URL('../.preview/',import.meta.url),{recursive:true});
const pages=await(await fetch('http://localhost:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setEmulatedMedia',{features:[]});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:'http://localhost:4173/'});await pause(6500);
  const position=await evaluate(`(()=>{const p=document.querySelector('.skills-sequence-pin');const v=p.firstElementChild;return {top:scrollY+p.getBoundingClientRect().top-parseFloat(getComputedStyle(v).top),distance:p.offsetHeight-v.offsetHeight}})()`);
  for(const phase of [.1,.5,.9]){
   await evaluate(`scrollTo({top:${position.top+position.distance*phase},behavior:'instant'})`);await pause(200);
   const state=await evaluate(`(()=>{const p=document.querySelector('.skills-sequence-pin');const v=p.firstElementChild;return {top:v.getBoundingClientRect().top,expected:parseFloat(getComputedStyle(v).top),progress:Number(p.dataset.progress),broken:[...p.querySelectorAll('img')].filter(i=>!i.naturalWidth).length,ys:[...p.querySelectorAll('.skill-logo-box')].map(c=>parseFloat(c.style.transform.split('translate3d(')[1].split(',')[1])),overflow:document.documentElement.scrollWidth>innerWidth}})()`);
   assert(Math.abs(state.top-state.expected)<2,'Scene must stay pinned');assert(!state.overflow);assert.equal(state.broken,0);
   if(phase===.9){assert.equal(state.progress,1);assert(Math.max(...state.ys)-Math.min(...state.ys)<1,'All logos settle onto one row before release');}
   await fs.writeFile(new URL(`../.preview/skills-pin-${name}-${phase}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  }
  await evaluate(`scrollTo({top:${position.top+position.distance+160},behavior:'instant'})`);await pause(200);
  assert(await evaluate(`document.querySelector('.skills-sequence-viewport').getBoundingClientRect().top`) < (name==='mobile'?58:64)-100,'Scene must release after settling');
  console.log(`PASS ${name}: scene pins throughout descent, row settles before release, logos load, no horizontal overflow`);
 }
}finally{ws.close();}
