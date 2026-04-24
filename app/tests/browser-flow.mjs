import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
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

const baseUrl = 'http://127.0.0.1:3000'
const outputDir = path.resolve('test-results')
await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({
  locale: 'th-TH',
  viewport: { width: 390, height: 844 },
})
const phone = `08${String(Date.now()).slice(-8)}`

const consoleErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('popup', async (popup) => {
  await popup.close().catch(() => undefined)
})

async function expectVisibleText(text) {
  await page.getByText(text).first().waitFor({ state: 'visible', timeout: 8000 })
}

try {
  await page.goto(`${baseUrl}/#/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
  await page.goto(`${baseUrl}/?branch=สีลม&qr_id=front01#/`, { waitUntil: 'networkidle' })

  await expectVisibleText('CNY HEALTHCARE')
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(outputDir, 'landing-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: /เล่นเกมส์|เริ่มรับสิทธิ์/ }).click()

  await expectVisibleText('ชื่อเล่น')
  await page.getByPlaceholder('เช่น คุณนิด').fill('คุณนิด')
  await page.getByPlaceholder('0812345678').fill(phone)
  await page.getByRole('button', { name: /ยืนยันและเล่นเกมส์|ยืนยันและรับสิทธิ์/ }).click()

  await expectVisibleText('เตรียมหมุนตู้')
  await page.getByRole('button', { name: /เริ่มหมุนตู้/ }).click()

  const chargeButton = page.getByRole('button', { name: /แตะ .*เติมพลัง/ })
  for (let i = 0; i < 12; i += 1) {
    await chargeButton.click()
  }

  await page.getByRole('button', { name: /หมุนรับแคปซูล/ }).click()
  await expectVisibleText('แคปซูลของคุณออกมาแล้ว')
  await page.getByRole('button', { name: /เปิดแคปซูล/ }).click()
  await expectVisibleText('ดูคูปองและปลดล็อก LINE')
  await page.screenshot({ path: path.join(outputDir, 'game-reveal-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: /ดูคูปองและปลดล็อก LINE/ }).click()

  await expectVisibleText('ปลดล็อกคูปองด้วย LINE OA')
  await page.getByRole('button', { name: /เปิด LINE @clinicya/ }).click()
  await page.getByRole('button', { name: /ฉันเพิ่มเพื่อนแล้ว ไปต่อ/ }).click()
  await expectVisibleText('Redeem code')
  await page.screenshot({ path: path.join(outputDir, 'reward-unlocked-mobile.png'), fullPage: true })

  await page.getByRole('button', { name: /เก็บใน Wallet/ }).click()
  await expectVisibleText('คูปองของฉัน')
  await expectVisibleText('โปรไฟล์ LINE')

  const rewardsBeforeReplay = await page.evaluate(async () => {
    const customerId = window.sessionStorage.getItem('pharmacy-campaign-customer-id')
    const response = await fetch(`/api/wallet?customerId=${encodeURIComponent(customerId ?? '')}`)
    const wallet = await response.json()
    return wallet.rewards.length
  })

  await page.goto(`${baseUrl}/#/game`, { waitUntil: 'networkidle' })
  await expectVisibleText('เล่นซ้ำได้ไม่จำกัดเพื่อทดลองเกม')
  await page.getByRole('button', { name: /เริ่มหมุนตู้/ }).click()
  const replayChargeButton = page.getByRole('button', { name: /แตะ .*เติมพลัง/ })
  for (let i = 0; i < 12; i += 1) {
    await replayChargeButton.click()
  }
  await page.getByRole('button', { name: /หมุนรับแคปซูล/ }).click()
  await expectVisibleText('แคปซูลของคุณออกมาแล้ว')
  await page.getByRole('button', { name: /เปิดแคปซูล/ }).click()
  await expectVisibleText('คูปองเดิมจากครั้งแรก')

  const rewardsAfterReplay = await page.evaluate(async () => {
    const customerId = window.sessionStorage.getItem('pharmacy-campaign-customer-id')
    const response = await fetch(`/api/wallet?customerId=${encodeURIComponent(customerId ?? '')}`)
    const wallet = await response.json()
    return wallet.rewards.length
  })
  assert.equal(rewardsAfterReplay, rewardsBeforeReplay)

  await page.goto(`${baseUrl}/#/wallet`, { waitUntil: 'networkidle' })
  await expectVisibleText('คูปองของฉัน')

  await page.getByRole('button', { name: /ใช้คูปองที่ร้าน/ }).first().click()

  await expectVisibleText('Staff Redeem')
  await page.getByRole('button', { name: /ยืนยันการใช้คูปอง/ }).click()
  await expectVisibleText('คูปองนี้ถูกใช้แล้ว')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(outputDir, 'redeemed-mobile.png'), fullPage: true })

  assert.deepEqual(consoleErrors, [])
} finally {
  await browser.close()
}
