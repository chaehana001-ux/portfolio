import fs from 'node:fs/promises';
const root = new URL('../dist/assets/skill-logos/', import.meta.url);
await fs.mkdir(root, { recursive: true });
const logos = {figma:'F24E1E',adobephotoshop:'31A8FF',adobeillustrator:'FF9A00',git:'F05032',github:'181717',vercel:'000000',html5:'E34F26',css3:'1572B6',sass:'CC6699',javascript:'B38C00',react:'149ECA',greensock:'268B25',openai:'412991',googlegemini:'4285F4',claude:'D97757',adobepremierepro:'7770D6',adobeaftereffects:'7770D6',capcut:'000000'};
await Promise.all(Object.entries(logos).map(async ([slug,color])=>{
  if(slug!=='capcut') { try { await fs.access(new URL(`${slug}.svg`,root)); return; } catch {} }
  let response=await fetch(slug==='capcut' ? 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Capcut-icon.svg' : `https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/${slug}.svg`,{signal:AbortSignal.timeout(12000)});
  if(!response.ok) response=await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@14.15.0/icons/${slug}.svg`,{signal:AbortSignal.timeout(12000)});
  if(!response.ok) throw Error(`${slug}: ${response.status}`);
  let svg=await response.text();
  if(!svg.includes('<svg')) throw Error(`${slug}: invalid SVG`);
  svg=svg.replace('<svg ',`<svg fill="#${color}" `);
  await fs.writeFile(new URL(`${slug}.svg`,root),svg);
  console.log(`Saved ${slug}`);
}));
await fs.writeFile(new URL('SOURCES.md',root),'Logo artwork: Simple Icons 11.15.0, https://github.com/simple-icons/simple-icons/tree/11.15.0/icons . Brand marks belong to their respective owners. ScrollTrigger uses the GSAP/GreenSock family mark; Scrolla.js uses the JavaScript language mark.\n');
