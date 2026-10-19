import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
try {
 await send('Page.navigate',{url:'http://127.0.0.1:4173/'});
 await new Promise(r=>setTimeout(r,1500));
 const result=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const iframe=document.querySelector('.case-live-preview');
  iframe.loading='eager';
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  for(let i=0;i<30&&!iframe.contentDocument?.querySelector('#root')?.children.length;i++)await wait(500);
  iframe.contentWindow.postMessage({type:'team-preview-visibility',visible:true},location.origin);
  await wait(9000);
  const w=iframe.contentWindow,d=iframe.contentDocument;
  const first=w.scrollY;
  await wait(1500);
  return {root:d.querySelector('#root')?.children.length,text:d.body.innerText.slice(0,250),first,second:w.scrollY,height:d.documentElement.scrollHeight,images:[...d.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src)};
 })()`});
 console.log(JSON.stringify(result));
 assert(!result.exceptionDetails);
 assert(result.result.value.root>0,'Team site failed to render');
 assert(!result.result.value.text.includes('Page not found'),'Team site is showing its 404 page');
 assert(result.result.value.second>result.result.value.first,'Preview is not scrolling');
 assert.equal(result.result.value.images.length,0,'Broken team images');
} finally {ws.close();}
