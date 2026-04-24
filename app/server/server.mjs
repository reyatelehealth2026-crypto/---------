import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  adminSummary,
  getWallet,
  getWalletByLineAccessToken,
  issueReward,
  migrate,
  recordEvent,
  redeemReward,
  registerCustomer,
  updateRewardTemplate,
  verifyFriendship,
} from './database.mjs'
import { pharmacyProfile } from './campaign.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const port = Number(process.env.PORT ?? 8787)

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

const readBody = async (req) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const methodNotAllowed = (res) => send(res, 405, { error: 'method_not_allowed' })

const requireAdmin = (url, body = {}) => {
  const key = url.searchParams.get('key') ?? body.key
  if (process.env.ADMIN_KEY && key !== process.env.ADMIN_KEY) {
    throw Object.assign(new Error('Admin key is required'), { status: 401 })
  }
}

const routeApi = async (req, res, url) => {
  if (url.pathname === '/api/health') return send(res, 200, { ok: true })

  if (url.pathname === '/api/bootstrap' && req.method === 'POST') {
    const body = await readBody(req)
    await recordEvent({ type: 'scan', tracking: body.tracking, metadata: { userAgent: req.headers['user-agent'] } })
    return send(res, 200, {
      campaign: pharmacyProfile,
      line: {
        liffRequired: process.env.REQUIRE_LINE_AUTH === 'true',
        lineAuthConfigured: Boolean(process.env.LINE_LOGIN_CHANNEL_ID),
      },
    })
  }

  if (url.pathname === '/api/customers/register') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const body = await readBody(req)
    const customer = await registerCustomer(body)
    return send(res, 200, { customer, wallet: await getWallet(customer.id) })
  }

  if (url.pathname === '/api/customers/lookup') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const body = await readBody(req)
    return send(res, 200, { wallet: await getWalletByLineAccessToken(body.lineAccessToken) })
  }

  if (url.pathname === '/api/rewards/draw') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const body = await readBody(req)
    const reward = await issueReward({ customerId: body.customerId, type: 'main', tracking: body.tracking })
    return send(res, 200, { reward, wallet: await getWallet(body.customerId) })
  }

  if (url.pathname === '/api/rewards/share-bonus') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const body = await readBody(req)
    const reward = await issueReward({ customerId: body.customerId, type: 'bonus', tracking: body.tracking })
    return send(res, 200, { reward, wallet: await getWallet(body.customerId) })
  }

  if (url.pathname === '/api/friendships/verify') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const body = await readBody(req)
    const friendship = await verifyFriendship(body)
    return send(res, 200, { friendship, wallet: await getWallet(body.customerId) })
  }

  if (url.pathname === '/api/wallet') {
    if (req.method !== 'GET') return methodNotAllowed(res)
    return send(res, 200, await getWallet(url.searchParams.get('customerId')))
  }

  if (url.pathname === '/api/rewards/redeem') {
    if (req.method !== 'POST') return methodNotAllowed(res)
    const reward = await redeemReward(await readBody(req))
    return send(res, 200, { reward })
  }

  if (url.pathname === '/api/admin/summary') {
    if (req.method !== 'GET') return methodNotAllowed(res)
    requireAdmin(url)
    return send(res, 200, await adminSummary())
  }

  if (url.pathname.startsWith('/api/admin/reward-templates/')) {
    if (req.method !== 'PATCH') return methodNotAllowed(res)
    const body = await readBody(req)
    requireAdmin(url, body)
    const id = decodeURIComponent(url.pathname.split('/').pop() ?? '')
    const rewardTemplate = await updateRewardTemplate({ id, updates: body })
    return send(res, 200, { rewardTemplate })
  }

  return send(res, 404, { error: 'not_found' })
}

const contentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.mp4')) return 'video/mp4'
  return 'application/octet-stream'
}

const serveStatic = (res, url) => {
  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
  const filePath = path.resolve(distDir, `.${requested}`)
  if (!filePath.startsWith(distDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    const indexPath = path.join(distDir, 'index.html')
    if (!existsSync(indexPath)) return send(res, 404, { error: 'dist_not_found' })
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    createReadStream(indexPath).pipe(res)
    return
  }
  res.writeHead(200, { 'content-type': contentType(filePath) })
  createReadStream(filePath).pipe(res)
}

await migrate()

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  try {
    if (url.pathname.startsWith('/api/')) return await routeApi(req, res, url)
    return serveStatic(res, url)
  } catch (error) {
    const status = Number(error.status ?? 500)
    return send(res, status, {
      error: status >= 500 ? 'server_error' : 'request_error',
      message: error.message ?? 'Unexpected error',
    })
  }
})

server.listen(port, () => {
  console.log(`API/static server listening on http://127.0.0.1:${port}`)
})
