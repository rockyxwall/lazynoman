import fs from 'fs';

const replacements = [
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/components/novel/NovelList.tsx',
    reps: [
      { from: /import \{ NovelListView \} from '\.\.\/custom-ui\/NovelListView';/, to: "import { NovelListView } from './NovelListView';" },
      { from: /import \{ NovelGridView \} from '\.\.\/custom-ui\/NovelGridView';/, to: "import { NovelGridView } from './NovelGridView';" }
    ]
  },
  {
    file: 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src/layouts/WriterLayout.astro',
    reps: [
      { from: /import StatsCard from '\.\.\/components\/custom-ui\/StatsCard\.astro';/, to: "import StatsCard from '../components/common/StatsCard.astro';" },
      { from: /import TasteTag from '\.\.\/components\/custom-ui\/TasteTag\.astro';/, to: "import TasteTag from '../components/common/TasteTag.astro';" },
      { from: /import SmallPostCard from '\.\.\/components\/custom-ui\/SmallPostCard\.astro';/, to: "import SmallPostCard from '../components/blog/SmallPostCard.astro';" }
    ]
  }
];

replacements.forEach(task => {
  if (fs.existsSync(task.file)) {
    let content = fs.readFileSync(task.file, 'utf8');
    let changed = false;
    task.reps.forEach(rep => {
      if (rep.from.test(content)) {
        content = content.replace(rep.from, rep.to);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(task.file, content, 'utf8');
      console.log('Fixed imports in ' + task.file);
    }
  }
});
