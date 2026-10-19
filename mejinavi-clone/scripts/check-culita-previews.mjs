import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
try{
 await send('Page.navigate',{url:'http://127.0.0.1:4173/'});
 await new Promise(r=>setTimeout(r,2000));
 const result=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const previews=[...document.querySelectorAll('.culita-preview')];
  previews.forEach(f=>f.loading='eager');
  document.querySelector('.culita-devices').scrollIntoView({behavior:'instant',block:'center'});
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  await wait(6500);
  const before=previews.map(f=>f.contentWindow.scrollY);
  await wait(6000);
  return previews.map((f,index)=>({width:f.contentWindow.innerWidth,before:before[index],scroll:f.contentWindow.scrollY,title:f.contentDocument.title,shop:!!f.contentDocument.querySelector('#shop'),broken:[...f.contentDocument.images].filter(i=>i.complete&&!i.naturalWidth).length}));
 })()`});
 console.log(JSON.stringify(result));assert(!result.exceptionDetails);
 assert.deepEqual(result.result.value.map(r=>r.width),[1440,390]);
 assert(result.result.value.every(r=>r.shop&&r.scroll>r.before&&r.broken===0));
}finally{ws.close();}
