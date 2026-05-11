import fs from 'fs';
import path from 'path';

const basePath = 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components';
const moves = [
  { from: 'custom-ui/NovelGridView.tsx', to: 'novel/NovelGridView.tsx' },
  { from: 'custom-ui/NovelListView.tsx', to: 'novel/NovelListView.tsx' },
  { from: 'custom-ui/SmallPostCard.astro', to: 'blog/SmallPostCard.astro' },
  { from: 'custom-ui/FeatureCard.astro', to: 'common/FeatureCard.astro' },
  { from: 'custom-ui/StatsCard.astro', to: 'common/StatsCard.astro' },
  { from: 'custom-ui/TasteTag.astro', to: 'common/TasteTag.astro' }
];

moves.forEach(m => {
  const src = path.join(basePath, m.from);
  const dest = path.join(basePath, m.to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log('Moved ' + src + ' to ' + dest);
  }
});

const dir = path.join(basePath, 'custom-ui');
if (fs.existsSync(dir)) {
  fs.rmdirSync(dir);
  console.log('Removed ' + dir);
}
