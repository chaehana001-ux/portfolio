import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{
 const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;
};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 for(const width of [1440,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<900});
  await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await wait(2000);
  for(const index of [0,2,5]){
   await evaluate(`(()=>{const story=document.querySelector('.diptyque-story'),v=story.querySelector('.diptyque-story-viewport'),stride=v.clientWidth+30;if(innerWidth>900)scrollTo({top:scrollY+story.getBoundingClientRect().top+stride*${index},behavior:'instant'});else v.scrollTo({left:stride*${index},behavior:'instant'});})()`);
   await wait(1200);
   const state=await evaluate(`(()=>{const story=document.querySelector('.diptyque-story'),v=story.querySelector('.diptyque-story-viewport'),p=story.querySelectorAll('.diptyque-story-panel')[${index}];return{active:story.dataset.activeStory,count:story.querySelectorAll('.diptyque-story-panel').length,left:p.getBoundingClientRect().left-v.getBoundingClientRect().left,researchAfter:!!(story.compareDocumentPosition(document.querySelector('.project-walkthrough'))&Node.DOCUMENT_POSITION_FOLLOWING),pageWidth:document.documentElement.scrollWidth}})()`);
   console.log(width,index,state);
   assert.equal(state.count,6);assert.equal(state.active,String(index));assert(Math.abs(state.left)<2);assert(state.researchAfter);assert(state.pageWidth<=width);
  }
  console.log(`PASS ${width}px: 6 panels, horizontal positions, research order, no page overflow`);
 }
}finally{ws.close();}
