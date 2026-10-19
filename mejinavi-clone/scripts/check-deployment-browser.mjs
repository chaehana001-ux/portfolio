import assert from 'node:assert/strict';
const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const page = pages.find(page => page.type === 'page');
assert(page, 'No debugging browser found');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open',resolve,{once:true}));
let id=0;
const pending=new Map(), errors=[], failures=[];
ws.addEventListener('message',event=>{
  const message=JSON.parse(event.data);
  if(message.id){const request=pending.get(message.id);pending.delete(message.id);message.error?request.reject(message.error):request.resolve(message.result);}
  if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text+' '+(message.params.exceptionDetails.exception?.description||''));
  if(message.method==='Network.responseReceived'&&message.params.response.status>=400) failures.push(message.params.response.url);
});
const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{
  const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  errors.length=0;
  for(const [width,height] of [[1440,900],[390,844]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
    await send('Page.navigate',{url:'http://127.0.0.1:4173/'});
    await pause(4000);
    assert.equal(await evaluate('document.querySelectorAll(".case-process-step").length'),6);
    const result=await evaluate(`(async()=>{
      const planning=document.querySelector('.has-planning-gallery');
      const groups=[];
      for(const button of planning.querySelectorAll('.case-tabs button')){
        button.click();
        const images=[...planning.querySelectorAll('.case-planning-image-card img')];
        await Promise.all(images.map(image=>image.decode()));
        groups.push({label:button.textContent,count:images.length});
      }
      planning.querySelector('.case-planning-image-card').click();
      const dialog=document.querySelector('.case-document-dialog');
      await Promise.all([...dialog.querySelectorAll('img')].map(image=>image.decode()));
      const image=dialog.querySelector('img'),r=image.getBoundingClientRect();
      const fit=r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;
      const noHorizontalOverflow=dialog.scrollWidth<=dialog.clientWidth+1;
      dialog.close();
      const market=[...document.querySelectorAll('.case-process-step')].find(s=>s.querySelector('.case-step-copy h4').textContent==='시장과 브랜드 이해');
      for(const button of market.querySelectorAll('.case-tabs button')) button.click();
      const implementation=[...document.querySelectorAll('.case-process-step')].find(s=>s.querySelector('.case-step-copy h4').textContent==='화면 설계와 구현');
      const qa=[...document.querySelectorAll('.portfolio-qa-item')];
      qa[0].open=true;await new Promise(r=>setTimeout(r,50));qa[1].open=true;await new Promise(r=>setTimeout(r,50));
      return {groups,fit,noHorizontalOverflow,laptop:!!implementation.querySelector('.case-macbook'),market:market.querySelector('.case-analysis-card.is-active img').getAttribute('src'),qa:qa.filter(x=>x.open).length,width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
    })()`);
    console.log(JSON.stringify(result));
    assert(result.groups.every(group=>group.count===3));
    assert(result.fit,'Enlarged image exceeds viewport');assert(result.noHorizontalOverflow,'Dialog overflows horizontally');
    assert(result.laptop);assert(result.market.endsWith('analysis-3c-original.jpg'));assert.equal(result.qa,1);
    assert(result.scrollWidth<=width,'Page overflows horizontally');
  }
  console.log(JSON.stringify({errors,failures}));
  assert.equal(errors.length,0,'Browser runtime errors');assert.equal(failures.length,0,'HTTP errors');
} finally {ws.close();}
