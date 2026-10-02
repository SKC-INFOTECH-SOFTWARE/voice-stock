// Rasterizes public/app-icon.svg into the PNG icons the PWA manifest needs.
// Run once: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'app-icon.svg'))
const out = (name) => join(root, 'public', name)

const targets = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(out(file))
  console.log('wrote', file)
}

// Maskable icon: same art but padded so the "safe zone" isn't clipped by round masks.
const padded = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
     <rect width="512" height="512" fill="#4f46e5"/>
     <g transform="translate(51.2 51.2) scale(0.8)">${readFileSync(join(root, 'public', 'app-icon.svg'))
       .toString()
       .replace(/<\?xml.*?\?>/, '')
       .replace(/<svg[^>]*>/, '')
       .replace(/<\/svg>/, '')}</g>
   </svg>`,
)
await sharp(padded).resize(512, 512).png().toFile(out('pwa-maskable-512.png'))
console.log('wrote pwa-maskable-512.png')
