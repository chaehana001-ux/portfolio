import fs from 'node:fs';
const directory='dist/assets/img/portfolio';
const colors={ivory:'#FCF3E9',gold:'#D9B77E',lavender:'#A9A2C8'};
for(const [name,color] of Object.entries(colors)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" fill="none"><path d="M49 127C23 132 7 119 10 104 12 91 26 85 44 86 41 65 61 48 84 53 91 27 124 22 145 39 163 9 206 13 220 42 246 28 275 42 278 64 306 58 326 73 324 92 343 92 354 103 350 116 346 131 321 134 299 130 280 144 246 141 230 135 208 151 172 147 157 138 134 149 102 143 89 134 72 140 54 136 49 127Z" fill="${color}" stroke="#253563" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 fs.writeFileSync(directory+'/deco-cloud-'+name+'.svg',svg);
}
const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const paths=new Set();
html=html.replace(/\.\/assets\/img\/[^\s"',<>]*grass[^\s"',<>]*\.(?:webp|png|svg)/g,path=>{
 paths.add(path);
 const number=Number(path.match(/-(\d)(?:@2x)?\./)?.[1]||1);
 const color=['gold','ivory','lavender'][number%3];
 return './assets/img/portfolio/deco-cloud-'+color+'.svg';
});
fs.writeFileSync(file,html);
console.log('Replaced '+paths.size+' desktop/mobile grass asset paths with clouds.');
