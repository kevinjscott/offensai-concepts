import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const times = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n))
const outDir = '/tmp/vout/stills'
await mkdir(outDir, { recursive: true })

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.tsx'), publicDir: path.resolve('public') })
const composition = await selectComposition({ serveUrl, id: 'ExplainerSilent' })

for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps))
  const output = `${outDir}/${process.env.TAG ?? 'r'}_t${String(t).replace('.', '_')}.jpg`
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 80, scale: Number(process.env.SCALE ?? 0.5), timeoutInMilliseconds: 90000 })
  console.log('still', t, '->', output)
}
