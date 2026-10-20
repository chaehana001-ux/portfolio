import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
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
  await evaluate(`document.querySelector('#projects').scrollIntoView({behavior:'instant'})`);await pause(300);
  const state=await evaluate(`(()=>{const p=document.querySelector('#projects');return {previous:p.previousElementSibling.id,text:p.innerText,width:document.documentElement.scrollWidth,nextTop:p.nextElementSibling.getBoundingClientRect().top,bottom:p.getBoundingClientRect().bottom,details:p.querySelector('.project-details').getBoundingClientRect().width}})()`);
  assert.equal(state.previous,'lookbook');assert(state.text.includes('DIPTYQUE')&&state.text.includes('향수병동'));assert(state.width<=width);assert(state.nextTop>=state.bottom-2);assert(state.details>250);
  await fs.writeFile(new URL('../.preview/project-'+name+'.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('PASS '+name+': project after ABOUT ME, supplied content, responsive width, no section overlap');
 }
}finally{ws.close();}
