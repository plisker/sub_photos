#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://photos.lisker.me';
const OUTPUT = path.resolve(process.argv[2] || 'sitemap.xml');
const LASTMOD = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

function xmlEscape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[c]));
}

async function listAlbumSlugs() {
  const entries = await readdir(path.join(ROOT, 'albums'), { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name).sort();
}

function albumThumbnails(slugs) {
  return slugs.map(slug => `${SITE}/assets/images/albums/${slug}.jpg`);
}

function renderUrl({ loc, priority, images = [] }) {
  const lines = [
    '    <url>',
    `        <loc>${xmlEscape(loc)}</loc>`,
    `        <lastmod>${LASTMOD}</lastmod>`,
    `        <priority>${priority}</priority>`,
  ];
  for (const img of images) {
    lines.push('        <image:image>');
    lines.push(`            <image:loc>${xmlEscape(img)}</image:loc>`);
    lines.push('        </image:image>');
  }
  lines.push('    </url>');
  return lines.join('\n');
}

async function main() {
  const slugs = await listAlbumSlugs();
  const thumbs = albumThumbnails(slugs);

  const blocks = [
    renderUrl({ loc: `${SITE}/`, priority: '1.0', images: thumbs }),
    renderUrl({
      loc: `${SITE}/about/`,
      priority: '0.8',
      images: [`${SITE}/assets/images/about/paul.jpg`],
    }),
    ...slugs.map(slug => renderUrl({
      loc: `${SITE}/albums/${slug}/`,
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>
`;

  await writeFile(OUTPUT, xml);
  console.log(`Wrote ${OUTPUT} (${blocks.length} URL entries)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
