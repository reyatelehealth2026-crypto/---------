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
const context = await browser.newContext({ viewport: { width: 414, height: 900 }, deviceScaleFactor: 2 })
const page = await context.newPage()
page.on('pageerror', (err) => console.error('pageerror:', err.message))
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('console.error:', msg.text())
})

const cap = async (name) => {
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(outDir, `flow-${name}.png`), fullPage: true })
  console.log(`captured ${name}`)
}

await page.goto('http://127.0.0.1:3000/?member=mock', { waitUntil: 'networkidle' })
await cap('01-landing')

await page
  .getByRole('button', { name: /เริ่มเล่นกาชาปอง|เล่นเกมส์|เริ่มรับสิทธิ์/ })
  .click({ force: true })
await page.waitForLoadState('networkidle')
await cap('02-register')

await page.getByLabel(/ชื่อ/).first().fill('ทดสอบ จริง')
await page.getByLabel(/เบอร์/).first().fill('0812345678')
await page.getByRole('button', { name: /ยืนยัน|สมัคร|เริ่มเล่น/ }).click({ force: true })
await page.waitForLoadState('networkidle')
await cap('03-game-pre')

const playBtn = page.getByRole('button', { name: /เริ่มหมุนตู้|เล่น|กดเล่น|กาชาปอง/ }).first()
if (await playBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
  await playBtn.click({ force: true })
}
await page.waitForTimeout(900)
await cap('04-game-charging')

const chargeBtn = page.getByRole('button', { name: /แตะ .*เติมพลัง/ })
for (let i = 0; i < 15; i += 1) {
  if ((await chargeBtn.count()) === 0) break
  await chargeBtn.click({ force: true })
  await page.waitForTimeout(60)
}
await page.waitForTimeout(400)
await cap('04b-game-charged')

const spinBtn = page.getByRole('button', { name: /หมุนรับแคปซูล/ })
if (await spinBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await spinBtn.click({ force: true })
}
await page.waitForTimeout(1800)
await cap('04c-game-spinning')

const openBtn = page.getByRole('button', { name: /เปิดแคปซูล/ })
if (await openBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
  await openBtn.click({ force: true })
}
await page.waitForTimeout(1800)
await cap('05-game-result')

const seeRewardBtn = page.getByRole('button', { name: /ดูคูปอง|ดูคูปองเดิม|ดูคูปองและปลดล็อก/ }).first()
if (await seeRewardBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
  await seeRewardBtn.click({ force: true })
  await page.waitForTimeout(1200)
  await cap('05b-reward-page')
}

await page.goto('http://127.0.0.1:3000/#/wallet', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await cap('06-wallet')

await page.goto('http://127.0.0.1:3000/#/redeem', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await cap('07-redeem')

await browser.close()
