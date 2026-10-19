import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await pause(2500);
  for(const index of [0,2,5]){
   await evaluate(`(()=>{const w=document.querySelector('.project-walkthrough'),v=document.querySelector('.case-horizontal-viewport');${name==='desktop'?`scrollTo({top:scrollY+w.getBoundingClientRect().top+v.clientWidth*${index},behavior:'instant'})`:`w.scrollIntoView({behavior:'instant'});v.scrollTo({left:v.clientWidth*${index},behavior:'instant'})`}})()`);await pause(250);
   const state=await evaluate(`(()=>{const w=document.querySelector('.project-walkthrough'),v=document.querySelector('.case-horizontal-viewport'),p=document.querySelectorAll('.case-process-step')[${index}];return {active:w.dataset.activeStep,removed:!document.querySelector('.case-horizontal-nav')&&!document.querySelector('.case-process-heading'),top:document.querySelector('.case-horizontal-sticky').getBoundingClientRect().top,left:p.getBoundingClientRect().left-v.getBoundingClientRect().left,width:document.documentElement.scrollWidth,folder:getComputedStyle(p,'::before').content}})()`);
   assert.equal(state.active,String(index));assert(state.removed);assert(state.folder.length>2);assert(Math.abs(state.left)<2);assert(state.width<=width);if(name==='desktop')assert(Math.abs(state.top)<2);
  }
  await fs.mkdir(new URL('../.preview/',import.meta.url),{recursive:true});
  await fs.writeFile(new URL('../.preview/project-macbook-'+name+'.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  if(name==='desktop'){
   await evaluate(`(()=>{const w=document.querySelector('.project-walkthrough');scrollTo({top:scrollY+w.getBoundingClientRect().bottom+100,behavior:'instant'})})()`);await pause(200);
   assert(await evaluate(`document.querySelector('.case-horizontal-sticky').getBoundingClientRect().bottom<innerHeight`));
  }
  console.log('PASS '+name+': six horizontal panels, active navigation, no page overflow'+(name==='desktop'?', pinned scroll and release':''));
 }
}finally{ws.close();}
