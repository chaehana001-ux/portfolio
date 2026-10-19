import fs from 'node:fs/promises';
const pages = await (await fetch('http://localhost:9223/json/list')).json();
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', event => { const m = JSON.parse(event.data); if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send = (method, params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
try {
await send('Page.navigate',{url:'http://localhost:4173/'});
await new Promise(r=>setTimeout(r,2000));
const result = await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
const v=document.createElement('video');v.muted=true;v.preload='auto';v.src='/assets/video/monster-shortform.mp4';document.body.append(v);await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=()=>j(Error('video load failed'))});
const c=document.createElement('canvas');c.width=1200;c.height=1440;const x=c.getContext('2d');x.fillStyle='#eee';x.fillRect(0,0,c.width,c.height);
await v.play();v.pause();
for(let i=0;i<12;i++){const t=Math.min(v.duration-.4,i*v.duration/12+.1);const seeked=new Promise(r=>v.onseeked=r);v.currentTime=t;await seeked;await v.play();await new Promise(r=>setTimeout(r,130));v.pause();const scale=Math.min(280/v.videoWidth,440/v.videoHeight);const xx=(i%4)*300, yy=Math.floor(i/4)*480;x.drawImage(v,xx+(300-v.videoWidth*scale)/2,yy+25,v.videoWidth*scale,v.videoHeight*scale);x.fillStyle='#000';x.font='16px Arial';x.fillText(t.toFixed(1)+'s',xx+10,yy+20);}
v.currentTime=.1;await new Promise(r=>v.onseeked=r);const p=document.createElement('canvas');p.width=v.videoWidth;p.height=v.videoHeight;p.getContext('2d').drawImage(v,0,0);
return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,sheet:c.toDataURL('image/jpeg'),poster:p.toDataURL('image/jpeg')};})()`});
if(result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
const {sheet,poster,...meta}=result.result.value;
await fs.writeFile(new URL('../.preview/monster-frames.jpg',import.meta.url),Buffer.from(sheet.split(',')[1],'base64'));
await fs.writeFile(new URL('../dist/assets/video/monster-poster.jpg',import.meta.url),Buffer.from(poster.split(',')[1],'base64'));
console.log(meta);
} finally {ws.close();}
