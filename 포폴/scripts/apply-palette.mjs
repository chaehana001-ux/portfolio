import fs from 'node:fs';
import path from 'node:path';

// Reapply safely to a fresh reference export; retain photos and social brand marks.
const root = path.resolve(import.meta.dirname, '../dist');
const groups = {
  navy: ['007aff', '000', '222', '630', '114a49', '009973', '211815', '231715', '1e1815', 'e55238', 'f95743', '40344c', '382b43', '342a40', '2f477a', '183b4e', '29456b', '5d688a'],
  ivory: ['fff', 'fefdff', 'fcf3e9', 'f9f2e7', 'fbefef', 'fff8f8', 'fffaf6', 'fffaf5', 'fff8de', 'fff2c6', 'f3f3e0', 'fff1d5', 'fff2ef'],
  gold: ['ffd200', 'fcd102', 'fcd206', 'ffce00', 'ffdd52', 'd2e269', 'a2e933', 'ffb46a', 'fc9', 'd6e578', 'ffd1a3', 'bfd33c', 'feb974', 'd9ae82', 'b3c059', '996c43', 'f5cbcb', 'dda853', '9fb3df', 'ffdbb6'],
  lavender: ['ffa0d8', 'fec8e8', 'fbb8e4', 'd69dc2', 'fecdea', 'ffaede', '5eb473', '51a766', '4ca461', '5eb072', '48a55e', '4e9c61', '5cc576', '6adcd0', '92d6cf', '7cb6b0', '91eae1', '9ddad4', '64c8be', 'c5b3d3', 'e9e4f0', 'eae6f2', 'e5dbed', 'f2ecf4', '9a7aaf', 'aac4f5', 'cad3cf', 'bddde4', 'f7a5a5'],
  'ivory-shade': ['f1e2d1', 'f1e1d0', 'ffe2e2', '8ca9ff', '27548a', '9ec6f3'],
};
const palette = { navy: '#403752', ivory: '#FFF8F4', gold: '#F6D7B0', lavender: '#C9B9E8', 'ivory-shade': '#EFA9B8' };
const map = new Map(Object.entries(groups).flatMap(([name, colors]) => colors.map(color => [color, name])));
for (const file of ['assets/css/style.css', 'styles.css', 'all-projects.css', 'diptyque-story.css', 'page-flow.css', 'index.html', 'assets/capabilities-divider.svg', 'assets/clone-section-wave.svg', 'assets/img/portfolio/value-clarity.svg', 'assets/img/portfolio/value-growth.svg', 'assets/img/portfolio/value-together.svg', 'assets/img/portfolio/cursor-plum.svg', 'assets/img/portfolio/cursor-pointer.svg']) {
  const fullPath = path.join(root, file);
  let source = fs.readFileSync(fullPath, 'utf8');
  if (file === 'assets/css/style.css') source = source.replaceAll('/univ/mejinavi2026/assets/img/', '../img/');
  source = source.replace(/#([\da-f]{3,8})\b/gi, (match, color) => {
    const token = map.get(color.toLowerCase());
    return token ? (file.endsWith('.css') ? `var(--palette-${token})` : palette[token]) : match;
  });
  if (file.endsWith('.css')) {
    source = source.replace(/rgb\((?:64 52 76|56 43 67) \/ /g, 'rgb(47 71 122 / ');
    source = source.replace(/rgb\(245 203 203 \/ /g, 'rgb(255 242 198 / ');
    source = source.replace(/rgb\(197 179 211 \/ /g, 'rgb(170 196 245 / ');
    source = source.replace(/rgb\(47 71 122 \/ /g, 'rgb(24 59 78 / ');
    source = source.replace(/rgb\(255 242 198 \/ /g, 'rgb(221 168 83 / ');
    source = source.replace(/rgb\(170 196 245 \/ /g, 'rgb(202 211 207 / ');
    source = source.replace(/rgb\(24 59 78 \/ /g, 'rgb(41 69 107 / ');
    source = source.replace(/rgb\(221 168 83 \/ /g, 'rgb(159 179 223 / ');
    source = source.replace(/rgb\(202 211 207 \/ /g, 'rgb(189 221 228 / ');
    source = source.replace(/rgb\(243 243 224 \/ /g, 'rgb(255 241 213 / ');
    source = source.replace(/rgb\(41 69 107 \/ /g, 'rgb(93 104 138 / ');
    source = source.replace(/rgb\(159 179 223 \/ /g, 'rgb(255 219 182 / ');
    source = source.replace(/rgb\(189 221 228 \/ /g, 'rgb(247 165 165 / ');
    source = source.replace(/rgb\(255 241 213 \/ /g, 'rgb(255 242 239 / ');
    source = source.replace(/rgb\(93 104 138 \/ /g, 'rgb(64 55 82 / ');
    source = source.replace(/rgb\(255 219 182 \/ /g, 'rgb(246 215 176 / ');
    source = source.replace(/rgb\(247 165 165 \/ /g, 'rgb(201 185 232 / ');
    source = source.replace(/rgb\(255 242 239 \/ /g, 'rgb(255 248 244 / ');
  }
  if (file === 'assets/css/style.css' && !source.includes('--palette-navy:')) {
    const tokens = `\n/* Color Hunt palette with a derived accessible ink color. */\n:root {\n${Object.entries(palette).map(([name, value]) => `  --palette-${name}: ${value};`).join('\n')}\n}\n`;
    source = source.replace("@charset 'UTF-8';", "@charset 'UTF-8';" + tokens);
  }
  for (const [name, value] of Object.entries(palette)) {
    source = source.replace(new RegExp(`--palette-${name}:\\s*[^;]+;`, 'g'), `--palette-${name}: ${value};`);
  }
  fs.writeFileSync(fullPath, source);
}
