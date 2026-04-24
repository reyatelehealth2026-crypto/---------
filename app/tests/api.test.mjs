import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

const waitForHealth = async (baseUrl) => {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
  }
  throw new Error('API server did not become healthy')
}

const post = async (baseUrl, pathName, body) => {
  const response = await fetch(`${baseUrl}${pathName}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json()
  assert.equal(response.ok, true, payload.message)
  return payload
}

test('API persists registration, reward issue, friendship, redeem, and admin stats', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'pharmacy-campaign-'))
  const port = 19001 + Math.floor(Math.random() * 1000)
  const baseUrl = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, ['--no-warnings=ExperimentalWarning', 'server/server.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_PATH: path.join(tempDir, 'campaign.sqlite'),
      REQUIRE_LINE_AUTH: 'false',
    },
    stdio: 'ignore',
  })

  try {
    await waitForHealth(baseUrl)
    await post(baseUrl, '/api/bootstrap', {
      tracking: { branch: 'สีลม', qrId: 'front01' },
    })

    const registered = await post(baseUrl, '/api/customers/register', {
      profile: {
        name: 'คุณนิด',
        phone: '0812345678',
        visitReason: 'ซื้อวิตามิน/อาหารเสริม',
        consentMarketing: true,
      },
      tracking: { branch: 'สีลม', qrId: 'front01' },
    })

    assert.equal(registered.customer.phone, '0812345678')
    assert.equal(registered.wallet.rewards.length, 0)

    const firstDraw = await post(baseUrl, '/api/rewards/draw', {
      customerId: registered.customer.id,
      tracking: { branch: 'สีลม', qrId: 'front01' },
    })
    const duplicateDraw = await post(baseUrl, '/api/rewards/draw', {
      customerId: registered.customer.id,
      tracking: { branch: 'สีลม', qrId: 'front01' },
    })

    assert.equal(firstDraw.reward.id, duplicateDraw.reward.id)
    assert.match(firstDraw.reward.code, /^RX-JYP-\d{4}$/)

    const friendship = await post(baseUrl, '/api/friendships/verify', {
      customerId: registered.customer.id,
      lineUserId: 'UrealLineUser',
      tracking: { branch: 'สีลม', qrId: 'front01' },
    })
    assert.equal(friendship.wallet.friendUnlocked, true)

    const redeemed = await post(baseUrl, '/api/rewards/redeem', {
      code: firstDraw.reward.code,
    })
    assert.equal(redeemed.reward.status, 'used')

    const summaryResponse = await fetch(`${baseUrl}/api/admin/summary`)
    const summary = await summaryResponse.json()
    assert.equal(summaryResponse.ok, true)
    assert.equal(summary.events.register, 1)
    assert.equal(summary.events.draw, 1)
    assert.equal(summary.events.friend, 1)
    assert.equal(summary.events.redeem, 1)
    assert.equal(summary.participants.length, 1)
    assert.equal(summary.participants[0].phone, '0812345678')

    const rewardUpdateResponse = await fetch(`${baseUrl}/api/admin/reward-templates/discount-600`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ weight: 7, stock_remaining: 88, active: false }),
    })
    const rewardUpdate = await rewardUpdateResponse.json()
    assert.equal(rewardUpdateResponse.ok, true, rewardUpdate.message)
    assert.equal(rewardUpdate.rewardTemplate.weight, 7)
    assert.equal(rewardUpdate.rewardTemplate.stock_remaining, 88)
    assert.equal(rewardUpdate.rewardTemplate.active, false)
  } finally {
    server.kill('SIGINT')
    await Promise.race([
      once(server, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ])
    await rm(tempDir, { recursive: true, force: true })
  }
})
