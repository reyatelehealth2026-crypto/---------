import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)

function loadCampaignModule() {
  const sourcePath = path.resolve('src/lib/campaign.ts')
  const source = readFileSync(sourcePath, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  })

  const module = { exports: {} }
  const context = {
    module,
    exports: module.exports,
    require,
    console,
    Intl,
  }

  vm.runInNewContext(compiled.outputText, context, { filename: sourcePath })
  return module.exports
}

test('validates Thai mobile numbers for campaign registration', () => {
  const { normalizeThaiPhone, isValidThaiMobile } = loadCampaignModule()

  assert.equal(normalizeThaiPhone('081-234-5678'), '0812345678')
  assert.equal(normalizeThaiPhone('+66 81 234 5678'), '0812345678')
  assert.equal(isValidThaiMobile('0899999999'), true)
  assert.equal(isValidThaiMobile('02-123-4567'), false)
  assert.equal(isValidThaiMobile('12345'), false)
})

test('selects rewards from weighted thresholds predictably', () => {
  const { selectRewardTemplate } = loadCampaignModule()

  assert.equal(selectRewardTemplate(0).id, 'discount-600')
  assert.equal(selectRewardTemplate(0.08).id, 'discount-300')
  assert.equal(selectRewardTemplate(0.24).id, 'discount-100')
  assert.equal(selectRewardTemplate(0.52).id, 'discount-50')
  assert.equal(selectRewardTemplate(0.99).id, 'care-check')
})

test('creates redeemable rewards with CNY terms and 30 day expiry', () => {
  const { createReward, formatThaiDate, rewardTemplates } = loadCampaignModule()
  const template = rewardTemplates.find((item) => item.id === 'discount-50')
  const reward = createReward(template, 'main', new Date('2026-04-23T10:00:00+07:00'), 7)

  assert.equal(reward.name, 'ส่วนลด 50 บาท')
  assert.equal(reward.status, 'unused')
  assert.equal(reward.expiryDate, '2026-05-23')
  assert.equal(reward.code, 'RX-JYP-0007')
  assert.match(reward.terms, /CNY HEALTHCARE|ไม่สามารถแลกเปลี่ยนเป็นเงินสด/)
  assert.equal(formatThaiDate('2026-05-23'), formatThaiDate('2026-05-23T00:00:00.000Z'))
  assert.equal(formatThaiDate('not-a-date'), 'ไม่ระบุ')
})
