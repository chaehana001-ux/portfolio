import fs from 'node:fs/promises';
const root = new URL('../dist/assets/skill-logos/', import.meta.url);
const assets = {
  figma: 'figma/figma-original.svg',
  adobephotoshop: 'photoshop/photoshop-original.svg',
  adobeillustrator: 'illustrator/illustrator-plain.svg',
  javascript: 'javascript/javascript-original.svg',
  react: 'react/react-original.svg',
  html5: 'html5/html5-original.svg',
  css3: 'css3/css3-original.svg',
  sass: 'sass/sass-original.svg',
  git: 'git/git-original.svg',
  github: 'github/github-original.svg',
  vercel: 'vercel/vercel-original.svg',
  adobepremierepro: 'premierepro/premierepro-original.svg',
  adobeaftereffects: 'aftereffects/aftereffects-original.svg',
};
const results = await Promise.allSettled(Object.entries(assets).map(async ([name, path]) => {
  const url = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw Error(`${name}: ${response.status}`);
  const svg = await response.text();
  if (!svg.includes('<svg')) throw Error(`${name}: invalid asset`);
  await fs.writeFile(new URL(`${name}.svg`, root), svg);
  return name;
}));
for (const result of results) console.log(result.status === 'fulfilled' ? `Restored ${result.value}` : String(result.reason));
const gemini = await fetch('https://raw.githubusercontent.com/pheralb/svgl/main/static/library/gemini.svg', { signal: AbortSignal.timeout(12000) });
if (!gemini.ok) throw Error(`Gemini: ${gemini.status}`);
await fs.writeFile(new URL('googlegemini.svg', root), await gemini.text());
const openaiFile = new URL('openai.svg', root);
await fs.writeFile(openaiFile, (await fs.readFile(openaiFile, 'utf8')).replace('#412991', '#000000'));
await fs.appendFile(new URL('SOURCES.md', root), '\nFull-color originals: https://github.com/devicons/devicon/tree/master/icons . Gemini: https://github.com/pheralb/svgl/blob/main/static/library/gemini.svg . Original SVG fills and gradients are preserved.\n');
if (results.some(result => result.status === 'rejected')) process.exitCode = 1;
