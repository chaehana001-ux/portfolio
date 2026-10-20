import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages = await (await fetch('http://localhost:9223/json/list')).json();
const target = pages.find(p => p.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', event => {
  const m = JSON.parse(event.data);
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(m.error) : p.resolve(m.result); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const clone = process.argv.includes('--clone');
const about = process.argv.includes('--about');
const monster = process.argv.includes('--monster');
const skills = process.argv.includes('--skills');
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value;
try {
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: name === 'mobile' });
    await send('Page.navigate', { url: 'http://localhost:4173/' });
    await pause(8000);
    await evaluate(`document.querySelector('${skills ? '#skills' : monster ? '#monster-film' : about ? '#lookbook' : clone ? '#clone-coding' : '#movie'}').scrollIntoView()`);
    await pause(2200);
    if (skills) {
      const state = await evaluate(`(()=>{const s=document.querySelector('#skills');return {groups:s.querySelectorAll('.skill-tool-group').length,tools:s.querySelectorAll('.skill-tool-static').length,boxes:s.querySelectorAll('.skill-logo-box').length,broken:[...s.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),buttons:s.querySelectorAll('button').length,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,transform:s.querySelector('.skills-logo-track').style.transform,spin:getComputedStyle(s.querySelector('.skill-logo-face img')).transform}})()`);
      assert.equal(state.groups, 6); assert.equal(state.tools, 20); assert.equal(state.boxes, 40);
      assert.deepEqual(state.broken, []); assert.equal(state.buttons, 0);
      assert(state.scrollWidth <= state.width);
      const pinnedTop = await evaluate(`document.querySelector('#skills').getBoundingClientRect().top`);
      await pause(450);
      assert.notEqual(await evaluate(`document.querySelector('.skills-logo-track').style.transform`), state.transform, 'Logos must keep moving without scrolling');
      const dragStart = await evaluate(`(()=>{const r=document.querySelector('.skills-logo-reel').getBoundingClientRect();return {x:r.left+r.width*.6,y:r.top+r.height*.5,transform:document.querySelector('.skills-logo-track').style.transform}})()`);
      if (name === 'mobile') {
        await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:dragStart.x,y:dragStart.y}]});
        await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:dragStart.x-100,y:dragStart.y}]});
        await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      } else {
        await send('Input.dispatchMouseEvent',{type:'mousePressed',x:dragStart.x,y:dragStart.y,button:'left',clickCount:1});
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:dragStart.x-100,y:dragStart.y,button:'left',buttons:1});
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:dragStart.x-100,y:dragStart.y,button:'left',clickCount:1});
      }
      const dragEnd = await evaluate(`({transform:document.querySelector('.skills-logo-track').style.transform,dragging:document.querySelector('.skills-logo-reel').classList.contains('is-dragging')})`);
      const translation = value => Number(value.match(/translate3d\(([-\d.]+)px/)[1]);
      assert(Math.abs(translation(dragEnd.transform)-translation(dragStart.transform)) > 70, 'Dragging must move the logo track');
      assert.equal(dragEnd.dragging,false);
      await evaluate('scrollBy(0,350)'); await pause(300);
      const moved = await evaluate(`({transform:document.querySelector('.skills-logo-track').style.transform,spin:getComputedStyle(document.querySelector('.skill-logo-face img')).transform})`);
      assert.notEqual(moved.transform, state.transform); assert.equal(state.spin, 'none'); assert.equal(moved.spin, 'none');
      assert(Math.abs(await evaluate(`document.querySelector('#skills').getBoundingClientRect().top`) - pinnedTop) < 2, 'Skills screen must stay pinned while the logos pass');
      await evaluate(`(()=>{const r=document.querySelector('.skills-pin-runway');const s=document.querySelector('#skills');scrollTo(0,scrollY+r.getBoundingClientRect().top+r.offsetHeight-s.offsetHeight+160)})()`); await pause(200);
      assert(await evaluate(`document.querySelector('#skills').getBoundingClientRect().top`) < pinnedTop - 50, 'Skills screen must release after logo travel');
      await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await pause(150);
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.skill-logo-face img')).transform`),'none');
      await send('Emulation.setEmulatedMedia', {features:[]});
      await evaluate(`document.querySelector('#skills').scrollIntoView()`); await pause(200);
      await fs.writeFile(new URL(`../.preview/skills-${name}.png`, import.meta.url), Buffer.from((await send('Page.captureScreenshot', {format:'png'})).data, 'base64'));
      console.log(`PASS ${name}: 20 loaded logo boxes and static tool rows, scroll translation/rotation, reduced motion and no overflow`);
      continue;
    }
    if (monster) {
      const result = (await send('Runtime.evaluate', {awaitPromise:true,returnByValue:true,expression:`(async()=>{const v=document.querySelector('.monster-video');v.muted=true;await v.play();await new Promise(r=>setTimeout(r,500));v.pause();return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,duration:v.duration,videoWidth:v.videoWidth,currentTime:v.currentTime,rows:document.querySelectorAll('.monster-description dd').length,error:v.error?.message}})()`})).result.value;
      assert(result && !result.error);
      assert.equal(result.rows, 4);
      assert.equal(result.videoWidth, 720);
      assert(result.duration > 15 && result.currentTime > 0);
      assert(result.scrollWidth <= result.width);
      await fs.writeFile(new URL(`../.preview/monster-${name}.png`, import.meta.url), Buffer.from((await send('Page.captureScreenshot', {format:'png'})).data, 'base64'));
      console.log(`PASS ${name}: video playback, dimensions, description and page width`, result);
      continue;
    }
    if (about) {
      const state = await evaluate(`({cards:document.querySelectorAll('#lookbook .about-value').length,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.querySelector('#lookbook').textContent})`);
      assert.equal(state.cards, 3);
      assert(state.scrollWidth <= state.width);
      assert(['CLARITY', 'GROWTH', 'EMPATHY', '출발점'].every(text => state.text.includes(text)));
      await fs.writeFile(new URL(`../.preview/about-${name}.png`, import.meta.url), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      console.log(`PASS ${name}: three values and introduction, no horizontal overflow`);
      continue;
    }
    if (clone) {
      const state = await evaluate(`({cards:document.querySelectorAll('#clone-coding .clone-caption').length, oldTargets:document.querySelectorAll('#clone-coding [data-modal-target]').length,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.querySelector('#clone-coding').textContent})`);
      assert(state.cards >= 3);
      assert.equal(state.oldTargets, 0);
      assert(state.scrollWidth <= state.width);
      assert(['NORTH', 'FORM', 'MODE', 'CLONE CODING'].every(text => state.text.includes(text)));
      await fs.writeFile(new URL(`../.preview/clone-${name}.png`, import.meta.url), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      console.log(`PASS ${name}: clone projects present, no old modal links or horizontal overflow`);
      continue;
    }
    const state = await evaluate(`({cards:document.querySelectorAll('#movie .film-description').length, rows:document.querySelectorAll('#movie dd').length, oldTargets:document.querySelectorAll('#movie [data-modal-target]').length, width:innerWidth, scrollWidth:document.documentElement.scrollWidth, text:document.querySelector('#movie').textContent})`);
    assert.equal(state.cards, 2);
    assert.equal(state.rows, 8);
    assert.equal(state.oldTargets, 0);
    assert(state.scrollWidth <= state.width);
    assert(state.text.includes('SNS 영상 콘텐츠') && state.text.includes('AFTER LIGHT'));
    await fs.writeFile(new URL(`../.preview/movie-${name}.png`, import.meta.url), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    console.log(`PASS ${name}: 2 projects, 8 description rows, no old video links or horizontal overflow`);
  }
} finally { ws.close(); }
