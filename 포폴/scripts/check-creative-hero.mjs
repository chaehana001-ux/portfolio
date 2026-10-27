import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir(new URL('../.preview/',import.meta.url),{recursive:true});
const pages=await(await fetch('http://localhost:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:'http://localhost:4173/'});await pause(7000);
  assert(await evaluate(`document.querySelector('.hero-ideas-art').naturalWidth>0`));
  assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth`));
  await fs.writeFile(new URL(`../.preview/creative-hero-${name}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  for (const [progress, phase] of [[.24,'click'],[.55,'zoom']]) {
   await evaluate(`(()=>{const h=document.querySelector('.hero-creative');const s=document.querySelector('.hero-creative-scene');scrollTo({top:(h.offsetHeight-s.offsetHeight)*${progress},behavior:'instant'})})()`);await pause(phase==='click'?200:700);
   assert.equal(await evaluate(`document.querySelector('.hero-creative-scene').dataset.heroPhase`),phase);
   if(phase==='click') {
    assert(await evaluate(`Number(getComputedStyle(document.querySelector('.hero-click-ring')).opacity)>0`));
    assert(await evaluate(`document.querySelector('.hero-click-cursor').getAnimations().some(animation=>animation.playState==='running')`));
   }
   await fs.writeFile(new URL(`../.preview/creative-hero-${phase}-${name}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  }
  await evaluate(`(()=>{const h=document.querySelector('.hero-creative');const s=document.querySelector('.hero-creative-scene');scrollTo({top:h.offsetHeight-s.offsetHeight,behavior:'instant'})})()`);await pause(700);
  const portal=await evaluate(`(()=>{const p=document.querySelector('.hero-figma-window').getBoundingClientRect();return {left:p.left,right:p.right,top:p.top,bottom:p.bottom,copy:getComputedStyle(document.querySelector('.hero-portal-copy')).opacity}})()`);
  assert(portal.left<=1&&portal.right>=width-20&&portal.top<=1&&portal.bottom>=height-1);
  assert.equal(portal.copy,'1');
  await fs.writeFile(new URL(`../.preview/creative-hero-transition-${name}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate(`document.querySelector('#lookbook').scrollIntoView({behavior:'instant'})`);await pause(150);
  assert(await evaluate(`Math.abs(document.querySelector('#lookbook').getBoundingClientRect().top)<2`));
  console.log(`PASS ${name}: illustration, width, full-screen portal expansion, ABOUT ME handoff`);
 }
}finally{ws.close();}
