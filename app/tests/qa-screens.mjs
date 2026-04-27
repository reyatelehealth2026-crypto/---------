import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const playwrightPath = path.join(
  process.env.APPDATA ?? '',
  'npm',
  'node_modules',
  'playwright',
  'index.mjs',
)
const { chromium } = await import(pathToFileURL(playwrightPath).href)

const outDir = path.join(process.cwd(), 'qa-screenshots')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()

const pages = [
  { name: 'landing', path: '/' },
  { name: 'register', path: '/register' },
  { name: 'game', path: '/game' },
  { name: 'wallet', path: '/wallet' },
  { name: 'redeem', path: '/redeem' },
]

for (const target of pages) {
  const context = await browser.newContext({ viewport: { width: 414, height: 900 }, deviceScaleFactor: 2 })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:3000${target.path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(outDir, `${target.name}-fullpage.png`), fullPage: true })
  await page.screenshot({ path: path.join(outDir, `${target.name}-viewport.png`), fullPage: false })
  console.log(`captured ${target.name}`)
  await context.close()
}

await browser.close()
