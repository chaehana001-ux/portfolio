import fs from 'node:fs';
import path from 'node:path';

// Reapply safely to a fresh reference export; retain photos and social brand marks.
const root = path.resolve(import.meta.dirname, '../dist');
const groups = {
  navy: ['007aff', '000', '222', '630', '114a49', '009973', '211815', '231715', '1e1815', 'e55238', 'f95743'],
  ivory: ['fff', 'fefdff', 'fcf3e9', 'f9f2e7'],
  gold: ['ffd200', 'fcd102', 'fcd206', 'ffce00', 'ffdd52', 'd2e269', 'a2e933', 'ffb46a', 'fc9', 'd6e578', 'ffd1a3', 'bfd33c', 'feb974', 'd9ae82', 'b3c059', '996c43'],
  lavender: ['ffa0d8', 'fec8e8', 'fbb8e4', 'd69dc2', 'fecdea', 'ffaede', '5eb473', '51a766', '4ca461', '5eb072', '48a55e', '4e9c61', '5cc576', '6adcd0', '92d6cf', '7cb6b0', '91eae1', '9ddad4', '64c8be'],
  'ivory-shade': ['f1e2d1', 'f1e1d0'],
};
const palette = { navy: '#40344C', ivory: '#FBEFEF', gold: '#F5CBCB', lavender: '#C5B3D3', 'ivory-shade': '#FFE2E2' };
const map = new Map(Object.entries(groups).flatMap(([name, colors]) => colors.map(color => [color, name])));
for (const file of ['assets/css/style.css', 'styles.css', 'index.html']) {
  const fullPath = path.join(root, file);
  let source = fs.readFileSync(fullPath, 'utf8');
  if (file === 'assets/css/style.css') source = source.replaceAll('/univ/mejinavi2026/assets/img/', '../img/');
  source = source.replace(/#([\da-f]{3,8})\b/gi, (match, color) => {
    const token = map.get(color.toLowerCase());
    return token ? (file.endsWith('.css') ? `var(--palette-${token})` : palette[token]) : match;
  });
  if (file === 'assets/css/style.css' && !source.includes('--palette-navy:')) {
    const tokens = `\n/* Site palette: navy / cream with gold and lavender accents. */\n:root {\n${Object.entries(palette).map(([name, value]) => `  --palette-${name}: ${value};`).join('\n')}\n}\n`;
    source = source.replace("@charset 'UTF-8';", "@charset 'UTF-8';" + tokens);
  }
  for (const [name, value] of Object.entries(palette)) {
    source = source.replace(new RegExp(`--palette-${name}:\\s*[^;]+;`, 'g'), `--palette-${name}: ${value};`);
  }
  fs.writeFileSync(fullPath, source);
}
