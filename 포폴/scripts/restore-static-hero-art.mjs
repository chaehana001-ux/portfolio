import fs from 'node:fs';
const file = 'dist/script.js';
let js = fs.readFileSync(file, 'utf8');
const start = js.indexOf('    // Keep the character introduction');
const end = js.indexOf('    const queueHero', start);
if (start < 0 || end < 0) throw new Error('Hero animation block not found');
js = js.slice(0, start) + `    // The original illustration stays intact; no separate browser or cursor layer.
    scene.append(copy);
    portal.remove();
    const cue = creativeHero.querySelector('.hero-scroll-cue');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    const updateHero = () => {
      queued = false;
      const distance = Math.max(1, creativeHero.offsetHeight - scene.offsetHeight);
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, -creativeHero.getBoundingClientRect().top / distance));
      const fade = Math.max(0, Math.min(1, (progress - .15) / .4));
      intro.style.opacity = String(1 - fade);
      art.style.opacity = String(1 - fade);
      if (originalWorld) originalWorld.style.opacity = String(1 - fade);
      const reveal = Math.max(0, Math.min(1, (progress - .55) / .25));
      copy.style.opacity = String(reveal);
      copy.style.visibility = reveal > 0 ? 'visible' : 'hidden';
      cue.style.opacity = String(1 - fade);
    };
` + js.slice(end);
fs.writeFileSync(file, js);
