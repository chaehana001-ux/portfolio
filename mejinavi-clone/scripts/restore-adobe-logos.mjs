import fs from 'node:fs/promises';
const response = await fetch('https://api.github.com/repos/pheralb/svgl/contents/static/library', {signal:AbortSignal.timeout(15000)});
if (!response.ok) throw Error(`Asset catalog: ${response.status}`);
const files = await response.json();
const targets = {adobeillustrator:/^(adobe-)?illustrator\.svg$/,adobepremierepro:/^(adobe-)?premiere(-pro)?\.svg$/,adobeaftereffects:/^(adobe-)?after-?effects\.svg$/};
for (const [target, pattern] of Object.entries(targets)) {
  const asset = files.find(file=>pattern.test(file.name));
  if(!asset) throw Error(`Missing ${target}: ${files.filter(f=>/adobe|premiere|illustrator|after/i.test(f.name)).map(f=>f.name).join(', ')}`);
  const result=await fetch(asset.download_url,{signal:AbortSignal.timeout(15000)});
  if(!result.ok) throw Error(`${target}: ${result.status}`);
  const svg=await result.text();
  if(!svg.includes('<svg')) throw Error('Invalid SVG');
  await fs.writeFile(new URL(`../dist/assets/skill-logos/${target}.svg`,import.meta.url),svg);
  console.log(`Saved ${target} from ${asset.name}`);
}
await fs.appendFile(new URL('../dist/assets/skill-logos/SOURCES.md',import.meta.url),'\nAdobe full-color application icons: https://github.com/pheralb/svgl/tree/main/static/library .\n');
