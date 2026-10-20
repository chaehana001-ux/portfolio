const targets=await(await fetch('http://localhost:9223/json/list')).json();
const target=targets.find(page=>page.type==='page' && page.url.startsWith('http://localhost:4173/'));
if(target) {
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  ws.send(JSON.stringify({id:1,method:'Browser.close'}));
  await new Promise(resolve=>ws.addEventListener('close',resolve,{once:true}));
}
