import fs from 'fs';
import path from 'path';

const fileReplacements = [
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/novel/NovelList.tsx',
    replacements: [
      { from: /import type \{ Novel \} from '\.\.\/lib\/parseNovels';/, to: "import type { Novel } from '../../lib/parseNovels';" },
      { from: /import BackToTop from '\.\/BackToTop';/, to: "import BackToTop from '../common/BackToTop';" }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/novel/NovelCard.tsx',
    replacements: [
      { from: /import type \{ Novel \} from '\.\.\/lib\/parseNovels';/, to: "import type { Novel } from '../../lib/parseNovels';" }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/novel/TrackerCard.astro',
    replacements: [
      { from: /import \{ Badge \} from "\.\/ui\/badge";/, to: 'import { Badge } from "../ui/badge";' },
      { from: /import type \{ Novel \} from "\.\.\/lib\/parseNovels";/, to: 'import type { Novel } from "../../lib/parseNovels";' }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/blog/PostCard.astro',
    replacements: [
      { from: /import FormattedDate from "\.\/FormattedDate\.astro";/, to: 'import FormattedDate from "../common/FormattedDate.astro";' },
      { from: /import \{ Badge \} from "\.\/ui\/badge";/, to: 'import { Badge } from "../ui/badge";' }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/custom-ui/NovelGridView.tsx',
    replacements: [
      { from: /import NovelCard from '\.\.\/NovelCard';/, to: "import NovelCard from '../novel/NovelCard';" }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/custom-ui/SmallPostCard.astro',
    replacements: [
      { from: /import FormattedDate from '\.\.\/FormattedDate\.astro';/, to: "import FormattedDate from '../common/FormattedDate.astro';" }
    ]
  }
];

fileReplacements.forEach(task => {
  if (fs.existsSync(task.file)) {
    let content = fs.readFileSync(task.file, 'utf8');
    let changed = false;
    task.replacements.forEach(rep => {
      if (rep.from.test(content)) {
        content = content.replace(rep.from, rep.to);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(task.file, content, 'utf8');
      console.log('Fixed internal imports in ' + task.file);
    }
  } else {
    console.log('File not found: ' + task.file);
  }
});
