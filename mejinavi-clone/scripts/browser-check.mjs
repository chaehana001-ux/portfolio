import fs from 'node:fs/promises';
const pages = await (await fetch('http://localhost:9223/json/list')).json();
const target = pages.find(p=>p.type==='page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=0; const pending=new Map(); const errors=[]; const failed=[];
ws.addEventListener('message',event=>{
  const m=JSON.parse(event.data);
  if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
  if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if(m.method==='Network.responseReceived' && m.params.response.status>=400) failed.push({url:m.params.response.url,status:m.params.response.status});
});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
await send('Page.enable'); await send('Runtime.enable');await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
// Runtime.enable also replays exceptions from the previously open document.
errors.length = 0;
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://localhost:4173/'});await pause(9000);
await fs.writeFile(new URL('../.preview/desktop.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
console.log('desktop',await evaluate(`({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,sections:[...document.querySelectorAll('main section')].map(x=>({class:x.className,top:Math.round(x.getBoundingClientRect().top),height:Math.round(x.getBoundingClientRect().height)})),brokenImages:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.currentSrc)})`));
await evaluate(`document.querySelector('.btn-menu').click()`);await pause(1500);
console.log('menu',await evaluate(`({class:document.querySelector('[data-menu="menu"]').className,style:document.querySelector('[data-menu="menu"]').getAttribute('style')})`));
await fs.writeFile(new URL('../.preview/menu.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
await evaluate(`document.querySelector('.btn-menu-close').click()`);await pause(1000);
await evaluate(`document.querySelector('#messages').scrollIntoView()`);await pause(2000);
await fs.writeFile(new URL('../.preview/messages.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://localhost:4173/'});await pause(7000);
await fs.writeFile(new URL('../.preview/mobile.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
console.log('mobile',await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.currentSrc)})`));
console.log(JSON.stringify({errors,failed},null,2));
ws.close();
