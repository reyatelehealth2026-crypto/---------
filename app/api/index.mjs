import './_lib/bootstrap.mjs'
import { pharmacyProfile } from '../server/campaign.mjs'
import {
  adminSummary,
  getWallet,
  getWalletByLineAccessToken,
  issueReward,
  pingDatabase,
  recordEvent,
  redeemReward,
  registerCustomer,
  updateRewardTemplate,
  verifyFriendship,
} from '../server/database.mjs'
import { ensureMethod, readJson, sendJson, withErrorHandling } from './_lib/http.mjs'

const getRoute = (req) => {
  const url = new URL(req.url, 'https://placeholder.local')
  return {
    url,
    route: `/${url.searchParams.get('path') ?? ''}`.replace(/\/+$/, '') || '/',
  }
}

export default async function handler(req, res) {
  await withErrorHandling(res, async () => {
    const { url, route } = getRoute(req)
    const requireAdmin = (body = {}) => {
      const key = url.searchParams.get('key') ?? body.key
      if (process.env.ADMIN_KEY && key !== process.env.ADMIN_KEY) {
        throw Object.assign(new Error('Admin key is required'), { status: 401 })
      }
    }

    if (route === '/health') {
      let database = 'ok'
      try {
        await pingDatabase()
      } catch {
        database = 'error'
      }
      return sendJson(res, 200, { ok: true, database })
    }

    if (route === '/bootstrap') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      await recordEvent({ type: 'scan', tracking: body.tracking, metadata: { userAgent: req.headers['user-agent'] } })
      return sendJson(res, 200, {
        campaign: pharmacyProfile,
        line: {
          liffRequired: process.env.REQUIRE_LINE_AUTH === 'true',
          lineAuthConfigured: Boolean(process.env.LINE_LOGIN_CHANNEL_ID),
        },
      })
    }

    if (route === '/customers/register') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      const customer = await registerCustomer(body)
      return sendJson(res, 200, { customer, wallet: await getWallet(customer.id) })
    }

    if (route === '/customers/lookup') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      return sendJson(res, 200, { wallet: await getWalletByLineAccessToken(body.lineAccessToken) })
    }

    if (route === '/rewards/draw') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      const reward = await issueReward({ customerId: body.customerId, type: 'main', tracking: body.tracking })
      return sendJson(res, 200, { reward, wallet: await getWallet(body.customerId) })
    }

    if (route === '/rewards/share-bonus') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      const reward = await issueReward({ customerId: body.customerId, type: 'bonus', tracking: body.tracking })
      return sendJson(res, 200, { reward, wallet: await getWallet(body.customerId) })
    }

    if (route === '/friendships/verify') {
      if (!ensureMethod(req, res, 'POST')) return
      const body = await readJson(req)
      const friendship = await verifyFriendship(body)
      return sendJson(res, 200, { friendship, wallet: await getWallet(body.customerId) })
    }

    if (route === '/wallet') {
      if (!ensureMethod(req, res, 'GET')) return
      return sendJson(res, 200, await getWallet(url.searchParams.get('customerId')))
    }

    if (route === '/rewards/redeem') {
      if (!ensureMethod(req, res, 'POST')) return
      const reward = await redeemReward(await readJson(req))
      return sendJson(res, 200, { reward })
    }

    if (route === '/admin/summary') {
      if (!ensureMethod(req, res, 'GET')) return
      requireAdmin()
      return sendJson(res, 200, await adminSummary())
    }

    if (route.startsWith('/admin/reward-templates/')) {
      if (!ensureMethod(req, res, 'PATCH')) return
      const body = await readJson(req)
      requireAdmin(body)
      const id = decodeURIComponent(route.split('/').pop() ?? '')
      const rewardTemplate = await updateRewardTemplate({ id, updates: body })
      return sendJson(res, 200, { rewardTemplate })
    }

    return sendJson(res, 404, { error: 'not_found' })
  })
}
