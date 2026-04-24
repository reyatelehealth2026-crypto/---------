import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'

test('returns the existing wallet when the same LINE user registers again', async () => {
  const previousDatabasePath = process.env.DATABASE_PATH
  const previousRequireLineAuth = process.env.REQUIRE_LINE_AUTH
  const previousFetch = globalThis.fetch
  const tempDir = await mkdtemp(path.join(tmpdir(), 'cny-duplicate-line-'))

  process.env.DATABASE_PATH = path.join(tempDir, 'campaign.sqlite')
  process.env.REQUIRE_LINE_AUTH = 'true'
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        userId: 'UduplicateLineUser',
        displayName: 'CNY Member',
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      },
    )

  try {
    const databaseUrl = pathToFileURL(path.resolve('server/database.mjs'))
    databaseUrl.search = `?case=${Date.now()}`
    const database = await import(databaseUrl.href)
    await database.migrate()

    const firstCustomer = await database.registerCustomer({
      profile: {
        name: 'คุณซี',
        phone: '0812345678',
        visitReason: 'ลูกค้าใหม่',
        consentMarketing: true,
      },
      tracking: { branch: 'main', qrId: 'front' },
      lineAccessToken: 'first-token',
    })
    const reward = await database.issueReward({
      customerId: firstCustomer.id,
      type: 'main',
      tracking: { branch: 'main', qrId: 'front' },
    })

    const duplicateCustomer = await database.registerCustomer({
      profile: {
        name: 'คุณซี',
        phone: '0899999999',
        visitReason: 'ลูกค้าใหม่',
        consentMarketing: true,
      },
      tracking: { branch: 'main', qrId: 'front' },
      lineAccessToken: 'second-token',
    })
    const wallet = await database.getWallet(duplicateCustomer.id)

    assert.equal(duplicateCustomer.id, firstCustomer.id)
    assert.equal(wallet.rewards.length, 1)
    assert.equal(wallet.rewards[0].id, reward.id)

    const lookedUpWallet = await database.getWalletByLineAccessToken('lookup-token')
    assert.equal(lookedUpWallet.customer.id, firstCustomer.id)
    assert.equal(lookedUpWallet.customer.phone, '0812345678')

    await database.updateRewardTemplate({
      id: 'discount-600',
      updates: { weight: 77, stock_remaining: 9, active: false },
    })
    await database.migrate()
    const summary = await database.adminSummary()
    const configuredReward = summary.rewardTemplates.find((item) => item.id === 'discount-600')
    assert.equal(configuredReward.weight, 77)
    assert.equal(configuredReward.stock_remaining, 9)
    assert.equal(configuredReward.active, false)
  } finally {
    process.env.DATABASE_PATH = previousDatabasePath
    process.env.REQUIRE_LINE_AUTH = previousRequireLineAuth
    globalThis.fetch = previousFetch
  }
})
