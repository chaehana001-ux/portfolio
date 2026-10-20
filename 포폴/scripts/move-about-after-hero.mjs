import fs from 'node:fs';
const file = new URL('../dist/index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<section class="section-lookbook about-hana"');
if (start < 0) throw new Error('ABOUT ME section not found');
const end = html.indexOf('</section>', start) + '</section>'.length;
const about = html.slice(start, end);
html = html.slice(0, start) + html.slice(end);
const wrapper = '<div class="scrollbar-trigger-wrap" data-global="scroll-trigger">';
if (!html.includes(wrapper)) throw new Error('Section wrapper not found');
html = html.replace(wrapper, `${wrapper}\n${about}`);
fs.writeFileSync(file, html);

// Keep the existing progress bar aligned with the new reading order.
const bundleFile = new URL('../dist/assets/js/bundle.js', import.meta.url);
let bundle = fs.readFileSync(bundleFile, 'utf8');
bundle = bundle.replace(
  '{section:e.messages,point:e.point1,label:"MESSAGES"},{section:e.mejiroData,point:e.point2,label:"MEJIRO DATA"},{section:e.lookbook,point:e.point3,label:"LOOKBOOK"}',
  '{section:e.lookbook,point:e.point1,label:"ABOUT ME"},{section:e.messages,point:e.point2,label:"MESSAGES"},{section:e.mejiroData,point:e.point3,label:"MEJIRO DATA"}',
);
fs.writeFileSync(bundleFile, bundle);
