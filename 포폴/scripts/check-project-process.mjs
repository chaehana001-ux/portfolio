import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir(new URL('../.preview/',import.meta.url),{recursive:true});
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await pause(2500);
  assert.equal(await evaluate(`document.querySelectorAll('.case-process-step').length`),6);
  for(let i=0;i<6;i++){
   await evaluate(`document.querySelectorAll('.case-process-step')[${i}].scrollIntoView({behavior:'instant',block:'center'})`);await pause(650);
   const state=await evaluate(`(()=>{const s=document.querySelectorAll('.case-process-step')[${i}];return {active:s.classList.contains('is-active'),width:document.documentElement.scrollWidth,opacity:getComputedStyle(s.querySelector('.case-scroll-card')).opacity}})()`);
   assert(state.active);assert.equal(state.opacity,'1');assert(state.width<=width);
   await evaluate(`document.querySelectorAll('.case-process-step')[${i}].querySelectorAll('[data-case-tab]')[1].click()`);
   assert.equal(await evaluate(`document.querySelectorAll('.case-process-step')[${i}].querySelectorAll('[data-case-tab]')[1].getAttribute('aria-pressed')`),'true');
   await evaluate(`document.querySelectorAll('.case-process-step')[${i}].querySelector('.case-enlarge').click()`);
   assert(await evaluate(`document.querySelector('.case-document-dialog').open`));
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   assert.equal(await evaluate(`document.querySelector('.case-document-dialog').open`),false);
  }
  await evaluate(`document.querySelector('.case-process-step').scrollIntoView({behavior:'instant',block:'center'})`);await pause(200);
  await fs.writeFile(new URL('../.preview/project-process-'+name+'.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  assert.equal(await evaluate(`document.querySelector('.case-website-link').href`),'https://mbc-teamproject-alpha.vercel.app/');
  console.log('PASS '+name+': six scroll stages, document tabs, enlarge/Escape, site link and width');
 }
}finally{ws.close();}
