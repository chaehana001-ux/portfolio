import fs from 'node:fs/promises';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
try {
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'https://mbc-teamproject-alpha.vercel.app/'});
 await new Promise(r=>setTimeout(r,7000));
 const data=(await send('Runtime.evaluate',{expression:`JSON.stringify({title:document.title,text:document.body.innerText.slice(0,10000),links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText,href:a.getAttribute('href')})).slice(0,50),images:[...document.images].filter(i=>i.naturalWidth>300).map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight})).slice(0,12)})`,returnByValue:true})).result.value;
 console.log(data);
 await send('Runtime.evaluate',{expression:`scrollTo({top:innerHeight*1.4,behavior:'instant'})`});
 await new Promise(r=>setTimeout(r,2000));
 await fs.writeFile('dist/assets/img/portfolio/diptyque-live-home.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
}finally{ws.close();}
