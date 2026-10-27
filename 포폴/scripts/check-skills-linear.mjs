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
  await evaluate(`document.querySelector('.skills-logo-reel').scrollIntoView({block:'center',behavior:'instant'})`);await pause(300);
  const state=await evaluate(`(()=>{const reel=document.querySelector('.skills-logo-reel');const columns=document.querySelector('.skills-tool-columns').getBoundingClientRect();const cards=[...reel.querySelectorAll('.skill-logo-box')].map(c=>c.getBoundingClientRect());return {pin:document.querySelectorAll('.skills-sequence-pin').length,spiral:document.querySelectorAll('.skills-spiral').length,top:Math.min(...cards.map(c=>c.top)),bottom:columns.bottom,ys:cards.map(c=>c.top),x:cards[0].x,transform:document.querySelector('#skills').style.transform}})()`);
  assert.equal(state.pin,0);assert.equal(state.spiral,0);assert.equal(state.transform,'');
  assert(state.top>state.bottom);assert(Math.max(...state.ys)-Math.min(...state.ys)<1);
  await pause(500);
  assert.notEqual(await evaluate(`document.querySelector('.skill-logo-box').getBoundingClientRect().x`),state.x);
  await fs.writeFile(new URL('../.preview/skills-linear-'+name+'.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('PASS '+name+': logos only below cards, horizontal loop, no descent or pin');
 }
}finally{ws.close();}
