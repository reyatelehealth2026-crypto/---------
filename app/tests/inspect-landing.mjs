import path from 'node:path'
import { pathToFileURL } from 'node:url'

const playwrightPath = path.join(
  process.env.APPDATA ?? '',
  'npm',
  'node_modules',
  'playwright',
  'index.mjs',
)
const { chromium } = await import(pathToFileURL(playwrightPath).href)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 414, height: 900 } })
const page = await context.newPage()

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const stats = await page.evaluate(() => {
  const docHeight = document.documentElement.scrollHeight
  const viewport = window.innerHeight
  const root = document.querySelector('main, body > div, #root')

  const main = document.querySelector('div.relative.min-h-\\[100dvh\\].overflow-hidden')
  const inner = document.querySelector('.mx-auto.flex.min-h-\\[100dvh\\].w-full.max-w-\\[460px\\]')
  const section = inner?.querySelector('section')

  const woodSigns = inner ? Array.from(inner.querySelectorAll('section > div')) : []

  return {
    docHeight,
    viewport,
    mainRect: main ? main.getBoundingClientRect().toJSON() : null,
    innerRect: inner ? inner.getBoundingClientRect().toJSON() : null,
    sectionRect: section ? section.getBoundingClientRect().toJSON() : null,
    sectionInnerHTML: section ? section.children.length : 0,
    motionDivs: section
      ? Array.from(section.children).map((c, i) => {
          const r = c.getBoundingClientRect()
          return {
            i,
            tag: c.tagName,
            classList: c.className.slice(0, 100),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            height: Math.round(r.height),
            width: Math.round(r.width),
          }
        })
      : [],
  }
})

console.log(JSON.stringify(stats, null, 2))

await browser.close()
