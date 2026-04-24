export const sendJson = (res, status, body) => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export const readJson = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return {}
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export const ensureMethod = (req, res, method) => {
  if (req.method === method) return true
  sendJson(res, 405, { error: 'method_not_allowed' })
  return false
}

export const withErrorHandling = async (res, action) => {
  try {
    return await action()
  } catch (error) {
    const status = Number(error?.status ?? 500)
    return sendJson(res, status, {
      error: status >= 500 ? 'server_error' : 'request_error',
      message: error?.message ?? 'Unexpected error',
    })
  }
}
