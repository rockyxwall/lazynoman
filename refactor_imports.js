const fs = require('fs');
const path = require('path');

const srcDir = 'e:/lazyman/rockyxwall/02_Codeing/01_Github/lazynoman/src';

const mappings = [
    { from: /components\/Header\.astro/g, to: 'components/layout/Header.astro' },
    { from: /components\/Footer\.astro/g, to: 'components/layout/Footer.astro' },
    { from: /components\/BaseHead\.astro/g, to: 'components/layout/BaseHead.astro' },
    { from: /components\/HeaderLink\.astro/g, to: 'components/layout/HeaderLink.astro' },
    
    { from: /components\/ModeToggle/g, to: 'components/common/ModeToggle' },
    { from: /components\/BackToTop/g, to: 'components/common/BackToTop' },
    { from: /components\/Comments\.astro/g, to: 'components/common/Comments.astro' },
    { from: /components\/FormattedDate\.astro/g, to: 'components/common/FormattedDate.astro' },
    
    { from: /components\/NovelList/g, to: 'components/novel/NovelList' },
    { from: /components\/NovelCard/g, to: 'components/novel/NovelCard' },
    { from: /components\/TrackerCard\.astro/g, to: 'components/novel/TrackerCard.astro' },
    
    { from: /components\/PostCard\.astro/g, to: 'components/blog/PostCard.astro' },
    { from: /components\/ReviewCard/g, to: 'components/blog/ReviewCard' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const allFiles = walk(srcDir).filter(f => f.match(/\.(astro|tsx|ts|mdx|md)$/));

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    mappings.forEach(map => {
        if (map.from.test(content)) {
            content = content.replace(map.from, map.to);
            changed = true;
        }
    });
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated imports in: ' + file);
    }
});
