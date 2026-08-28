import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BRAND_DIR = path.join(ROOT, 'src/assets/brand');
const SOLID_MASTER = path.join(BRAND_DIR, 'logo-solid-bg.png');
const CARD_MASTER = path.join(BRAND_DIR, 'logo-card-badge.png');
const TRANSPARENT_MASTER = path.join(BRAND_DIR, 'logo-transparent.png');

const PUBLIC_FAVICON_DIR = path.join(ROOT, 'public/favicon');
const PUBLIC_NAVLOGO = path.join(ROOT, 'public/images/navlogo.webp');
const PUBLIC_ROOT_ICO = path.join(ROOT, 'public/favicon.ico');
const PUBLIC_FAVICON_ICO = path.join(ROOT, 'public/favicon/favicon.ico');
const PUBLIC_FAVICON_SVG = path.join(ROOT, 'public/favicon/favicon.svg');

// 1. Ensure masters exist
async function ensureMasters() {
  if (!fs.existsSync(BRAND_DIR)) {
    fs.mkdirSync(BRAND_DIR, { recursive: true });
  }

  // Generate transparent master if missing
  if (!fs.existsSync(TRANSPARENT_MASTER) && fs.existsSync(SOLID_MASTER)) {
    console.log('[brand] Generating transparent master emblem from solid background...');
    const image = sharp(SOLID_MASTER);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    const out = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      out[i * 4] = data[i * 3];
      out[i * 4 + 1] = data[i * 3 + 1];
      out[i * 4 + 2] = data[i * 3 + 2];
      out[i * 4 + 3] = 255;
    }

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0, tail = 0;

    function push(x, y) {
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      queue[tail++] = idx;
    }

    for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
    for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

    function isBackground(r, g, b) {
      return r < 65 && g < 65 && b < 70;
    }

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);

      const r = data[idx * 3];
      const g = data[idx * 3 + 1];
      const b = data[idx * 3 + 2];

      if (isBackground(r, g, b)) {
        out[idx * 4 + 3] = 0;
        if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; queue[tail++] = idx - 1; }
        if (x < width - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; queue[tail++] = idx + 1; }
        if (y > 0 && !visited[idx - width]) { visited[idx - width] = 1; queue[tail++] = idx - width; }
        if (y < height - 1 && !visited[idx + width]) { visited[idx + width] = 1; queue[tail++] = idx + width; }
      }
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (out[idx * 4 + 3] > 0) {
          const r = out[idx * 4];
          const g = out[idx * 4 + 1];
          const b = out[idx * 4 + 2];
          if (r < 85 && g < 85 && b < 90) {
            if (out[(idx - 1) * 4 + 3] === 0 || out[(idx + 1) * 4 + 3] === 0 ||
                out[(idx - width) * 4 + 3] === 0 || out[(idx + width) * 4 + 3] === 0) {
              out[idx * 4 + 3] = Math.max(0, Math.min(255, Math.round((r + g + b) / 3 * 2.5)));
            }
          }
        }
      }
    }

    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = out[(y * width + x) * 4 + 3];
        if (a > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    await sharp(out, { raw: { width, height, channels: 4 } })
      .extract({ left: minX, top: minY, width: trimmedWidth, height: trimmedHeight })
      .png()
      .toFile(TRANSPARENT_MASTER);

    console.log(`[brand] Generated ${TRANSPARENT_MASTER}`);
  }
}

// 2. Multi-Size Windows ICO file builder
function createIcoFile(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  const imageBuffers = [];

  for (const item of pngBuffersWithSizes) {
    const { size, buffer } = item;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);

    entries.push(entry);
    imageBuffers.push(buffer);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

// 3. Build Suite
async function applyVariant(variant = 'transparent') {
  await ensureMasters();

  let sourceFile;
  if (variant === 'solid') {
    sourceFile = SOLID_MASTER;
  } else if (variant === 'card') {
    sourceFile = CARD_MASTER;
  } else {
    sourceFile = TRANSPARENT_MASTER;
  }

  console.log(`\n[brand] Switching suite to variant: '${variant}'`);
  console.log(`[brand] Source asset: ${path.relative(ROOT, sourceFile)}`);

  if (!fs.existsSync(PUBLIC_FAVICON_DIR)) {
    fs.mkdirSync(PUBLIC_FAVICON_DIR, { recursive: true });
  }

  // 1. Generate NavLogo WebP (100x100)
  await sharp(sourceFile)
    .resize(100, 100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ alphaQuality: 100, quality: 95 })
    .toFile(PUBLIC_NAVLOGO);
  console.log(`✓ Updated ${path.relative(ROOT, PUBLIC_NAVLOGO)}`);

  // 2. Generate all PNG favicons
  const pngSizes = [
    { name: 'android-icon-36x36.png', size: 36 },
    { name: 'android-icon-48x48.png', size: 48 },
    { name: 'android-icon-72x72.png', size: 72 },
    { name: 'android-icon-96x96.png', size: 96 },
    { name: 'android-icon-144x144.png', size: 144 },
    { name: 'android-icon-192x192.png', size: 192 },
    { name: 'apple-icon-57x57.png', size: 57 },
    { name: 'apple-icon-60x60.png', size: 60 },
    { name: 'apple-icon-72x72.png', size: 72 },
    { name: 'apple-icon-76x76.png', size: 76 },
    { name: 'apple-icon-114x114.png', size: 114 },
    { name: 'apple-icon-120x120.png', size: 120 },
    { name: 'apple-icon-144x144.png', size: 144 },
    { name: 'apple-icon-152x152.png', size: 152 },
    { name: 'apple-icon-180x180.png', size: 180 },
    { name: 'apple-icon-precomposed.png', size: 180 },
    { name: 'apple-icon.png', size: 180 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'ms-icon-70x70.png', size: 70 },
    { name: 'ms-icon-144x144.png', size: 144 },
    { name: 'ms-icon-150x150.png', size: 150 },
    { name: 'ms-icon-310x310.png', size: 310 }
  ];

  for (const item of pngSizes) {
    const dest = path.join(PUBLIC_FAVICON_DIR, item.name);
    await sharp(sourceFile)
      .resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(dest);
  }
  console.log(`✓ Generated ${pngSizes.length} PNG icons in ${path.relative(ROOT, PUBLIC_FAVICON_DIR)}`);

  // 3. Generate multi-size ICO (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(sourceFile)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    icoPngBuffers.push({ size: s, buffer: buf });
  }

  const icoBuffer = createIcoFile(icoPngBuffers);
  fs.writeFileSync(PUBLIC_ROOT_ICO, icoBuffer);
  fs.writeFileSync(PUBLIC_FAVICON_ICO, icoBuffer);
  console.log(`✓ Generated multi-size ICO: favicon.ico & public/favicon/favicon.ico`);

  // 4. Generate clean SVG icon wrapper
  const base64Png = (await sharp(sourceFile).resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><image width="128" height="128" href="data:image/png;base64,${base64Png}"/></svg>`;
  fs.writeFileSync(PUBLIC_FAVICON_SVG, svgContent);
  console.log(`✓ Generated SVG: ${path.relative(ROOT, PUBLIC_FAVICON_SVG)}`);

  console.log(`\n🎉 Successfully applied '${variant}' brand suite!`);
}

// CLI handler
const args = process.argv.slice(2);
let variant = 'transparent';
for (const arg of args) {
  if (arg.includes('solid')) variant = 'solid';
  else if (arg.includes('card')) variant = 'card';
  else if (arg.includes('transparent')) variant = 'transparent';
}

applyVariant(variant).catch(console.error);
