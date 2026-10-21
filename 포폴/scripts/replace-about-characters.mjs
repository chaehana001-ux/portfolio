import fs from 'node:fs';
const file=new URL('../dist/index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const start=html.indexOf('<section class="section-lookbook about-hana"');
const end=html.indexOf('</section>',start);
let section=html.slice(start,end);
const replace=(className,name,alt)=>{
 const pattern=new RegExp(`(<span class="${className}"[^>]*>)[\\s\\S]*?<\\/span>`);
 if(!pattern.test(section))throw Error(`Missing ${className}`);
 section=section.replace(pattern,`$1<img class="about-custom-character" src="./assets/img/portfolio/${name}.png" alt="${alt}" width="1280" height="1280" loading="lazy"></span>`);
};
replace('bear','rabbit-moon','구름 위에서 초승달을 안고 있는 토끼');
replace('human-telescope','telescope-girl','구름 위에서 망원경을 들여다보는 소녀');
html=html.slice(0,start)+section+html.slice(end);
fs.writeFileSync(file,html);
