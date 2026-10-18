import { generateSpeech } from 'ai'
import { readFile, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const storyboard = JSON.parse(await readFile(new URL('./k8s-storyboard.json', import.meta.url), 'utf8'))
const output = new URL('../../public/video/', import.meta.url)

for (const [variant, beats] of Object.entries(storyboard)) {
  for (const [index, beat] of beats.entries()) {
    const destination = new URL(`k8s-${variant}-voice-${index}.mp3`, output)
    try {
      await access(destination)
      continue
    } catch {}
    const result = await generateSpeech({
      model: 'openai/tts-1-hd',
      voice: 'onyx',
      text: beat.voice,
      speed: 1.12,
      outputFormat: 'mp3',
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(60000),
    })
    await writeFile(destination, result.audio.uint8Array)
    console.log(`Generated ${variant} beat ${index + 1}: ${fileURLToPath(destination)}`)
  }
}
