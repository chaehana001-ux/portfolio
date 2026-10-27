import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir(new URL('../.preview/',import.meta.url),{recursive:true});
const pages=await(await fetch('http://localhost:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
try {
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setEmulatedMedia',{features:[]});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:name==='mobile'});
  await send('Page.navigate',{url:'http://localhost:4173/'});await pause(7500);
  await evaluate(`(()=>{const s=document.querySelector('#skills');scrollTo(0,scrollY+s.getBoundingClientRect().top-60)})()`);await pause(300);
  const first=await evaluate(`({count:document.querySelectorAll('.skill-logo-box').length,transform:document.querySelector('.skill-logo-box').style.transform,top:document.querySelector('.skills-logo-reel').getBoundingClientRect().top,below:document.querySelector('.skills-orbit-pin').previousElementSibling.classList.contains('skills-tool-columns'),broken:[...document.querySelectorAll('#skills img')].filter(x=>!x.complete||!x.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth})`);
  assert.equal(first.count,20);assert(first.below);assert.equal(first.broken,0);assert(!first.overflow);
  await pause(400);
  assert.notEqual(await evaluate(`document.querySelector('.skill-logo-box').style.transform`),first.transform);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.skill-logo-face img')).transform`),'none');
  await fs.writeFile(new URL(`../.preview/skill-spiral-${name}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate(`(()=>{const r=document.querySelector('.skills-orbit-pin');scrollTo(0,scrollY+r.getBoundingClientRect().top-innerHeight*.35)})()`);await pause(200);
  assert(await evaluate(`document.querySelector('.skills-orbit-pin').offsetHeight <= document.querySelector('.skills-orbit-dock').offsetHeight + 2`), 'No long empty pin spacer below the cards');
  await evaluate('scrollBy(0,50)');await pause(200);
  const point=await evaluate(`(()=>{const card=[...document.querySelectorAll('.skill-logo-box')].find(c=>{const r=c.getBoundingClientRect();return r.top>80&&r.bottom<innerHeight-60&&r.left>30&&r.right<innerWidth-30});const r=card.getBoundingClientRect();return {x:r.left+r.width*.5,y:r.top+r.height*.5,t:document.querySelector('.skill-logo-box').style.transform}})()`);
  if(name==='mobile') {
   await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:point.y}]});
   await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x-130,y:point.y}]});
   await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  } else {
   await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x-130,y:point.y,buttons:1});
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x-130,y:point.y,button:'left',clickCount:1});
  }
  assert.notEqual(await evaluate(`document.querySelector('.skill-logo-box').style.transform`),point.t);
  await fs.writeFile(new URL(`../.preview/skill-orbit-${name}.png`,import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await pause(900);
  const still=await evaluate(`document.querySelector('.skill-logo-box').style.transform`);await pause(350);
  assert.equal(await evaluate(`document.querySelector('.skill-logo-box').style.transform`),still);
  await send('Emulation.setEmulatedMedia',{features:[]});
  console.log(`PASS ${name}: orbit below tools, 20 logos, continuous movement, drag, upright artwork, pin and reduced motion`);
 }
} finally {ws.close();}
