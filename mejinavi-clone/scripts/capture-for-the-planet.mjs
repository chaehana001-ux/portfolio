import fs from 'node:fs/promises';
const pages=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}});
const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);ws.send(JSON.stringify({id:key,method,params}));});
try{
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'https://mbc-teamproject-alpha.vercel.app/about/for-the-planet'});
 await new Promise(r=>setTimeout(r,8500));
 await fs.writeFile(new URL('../dist/assets/img/portfolio/diptyque-planet-main.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await send('Runtime.evaluate',{expression:`scrollTo({top:innerHeight*3,behavior:'instant'})`});
 await new Promise(r=>setTimeout(r,2000));
 await fs.writeFile(new URL('../dist/assets/img/portfolio/diptyque-planet-detail.png',import.meta.url),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 console.log('Captured For The Planet main and scroll content');
}finally{ws.close();}
