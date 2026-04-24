import { randomInt, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { neon } from '@neondatabase/serverless'
import { rewardTemplates } from './campaign.mjs'

const usePostgres = Boolean(process.env.DATABASE_URL)
const dbPath = process.env.DATABASE_PATH ?? path.resolve('data/campaign.sqlite')

if (!usePostgres && !existsSync(path.dirname(dbPath))) {
  mkdirSync(path.dirname(dbPath), { recursive: true })
}

const sqliteDb = usePostgres ? null : new DatabaseSync(dbPath)
if (sqliteDb) {
  sqliteDb.exec('PRAGMA journal_mode = WAL')
  sqliteDb.exec('PRAGMA foreign_keys = ON')
}

const sql = usePostgres ? neon(process.env.DATABASE_URL) : null

const json = (value) => JSON.stringify(value ?? null)
const parseJson = (value, fallback = null) => {
  if (value === null || value === undefined) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const weightedPick = (templates) => {
  const availableTemplates = templates.filter((item) => Number(item.weight) > 0)
  const total = availableTemplates.reduce((sum, item) => sum + Number(item.weight), 0)
  if (total <= 0) return null
  let threshold = randomInt(0, total)
  for (const template of availableTemplates) {
    threshold -= template.weight
    if (threshold < 0) return template
  }
  return availableTemplates[availableTemplates.length - 1]
}

export const normalizeThaiPhone = (input = '') => {
  const digits = String(input).replace(/\D/g, '')
  if (digits.startsWith('66') && digits.length === 11) return `0${digits.slice(2)}`
  return digits
}

export const isValidThaiMobile = (input = '') => /^0[689]\d{8}$/.test(normalizeThaiPhone(input))

export const toCustomer = (row) =>
  row && {
    id: row.id,
    lineUserId: row.line_user_id,
    displayName: row.display_name,
    name: row.name,
    phone: row.phone,
    ageRange: row.age_range ?? undefined,
    visitReason: row.visit_reason,
    consentMarketing: Boolean(row.consent_marketing),
    registeredAt: row.created_at,
  }

export const toReward = (row) =>
  row && {
    id: row.id,
    customerId: row.customer_id,
    templateId: row.template_id,
    type: row.type,
    tier: row.tier,
    name: row.name,
    description: row.description,
    amount: row.amount,
    expiryDate: row.expiry_date,
    status: row.status,
    code: row.code,
    terms: row.terms,
    image: row.image,
    issuedAt: row.issued_at,
      usedAt: row.used_at ?? undefined,
    }

const toAdminRewardTemplate = (row) => ({
  id: row.id,
  tier: row.tier,
  name: row.name,
  description: row.description,
  amount: Number(row.amount),
  weight: Number(row.weight),
  stock_remaining: Number(row.stock_remaining),
  image: row.image,
  terms: row.terms,
  active: Boolean(row.active),
})

const toAdminParticipant = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  displayName: row.display_name,
  lineUserId: row.line_user_id,
  registeredAt: row.created_at,
  rewardCount: Number(row.reward_count ?? 0),
  mainRewardName: row.main_reward_name,
  mainRewardCode: row.main_reward_code,
  mainRewardStatus: row.main_reward_status,
  lastRewardAt: row.last_reward_at,
  friendUnlocked: Boolean(row.friendship_verified_at),
})

const migrateSqlite = () => {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      line_user_id TEXT UNIQUE,
      display_name TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      age_range TEXT NOT NULL,
      visit_reason TEXT NOT NULL,
      consent_marketing INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reward_templates (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      stock_remaining INTEGER NOT NULL,
      image TEXT NOT NULL,
      terms TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      template_id TEXT NOT NULL REFERENCES reward_templates(id),
      type TEXT NOT NULL,
      tier TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      expiry_date TEXT NOT NULL,
      status TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      terms TEXT NOT NULL,
      image TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      used_at TEXT,
      UNIQUE(customer_id, type)
    );

    CREATE TABLE IF NOT EXISTS friendships (
      customer_id TEXT PRIMARY KEY REFERENCES customers(id),
      line_user_id TEXT,
      verified_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaign_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      customer_id TEXT,
      reward_id TEXT,
      line_user_id TEXT,
      branch TEXT,
      qr_id TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
  `)

  const insertTemplate = sqliteDb.prepare(`
    INSERT INTO reward_templates (
      id, tier, name, description, amount, weight, stock_remaining, image, terms, active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO NOTHING
  `)

  for (const template of rewardTemplates) {
    insertTemplate.run(
      template.id,
      template.tier,
      template.name,
      template.description,
      template.amount,
      template.weight,
      template.stock,
      template.image,
      template.terms,
    )
  }
}

const migratePostgres = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      line_user_id TEXT UNIQUE,
      display_name TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      age_range TEXT NOT NULL,
      visit_reason TEXT NOT NULL,
      consent_marketing BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS reward_templates (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      stock_remaining INTEGER NOT NULL,
      image TEXT NOT NULL,
      terms TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      template_id TEXT NOT NULL REFERENCES reward_templates(id),
      type TEXT NOT NULL,
      tier TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      terms TEXT NOT NULL,
      image TEXT NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      UNIQUE(customer_id, type)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS friendships (
      customer_id TEXT PRIMARY KEY REFERENCES customers(id),
      line_user_id TEXT,
      verified_at TIMESTAMPTZ NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      customer_id TEXT,
      reward_id TEXT,
      line_user_id TEXT,
      branch TEXT,
      qr_id TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    )
  `

  for (const template of rewardTemplates) {
    await sql`
      INSERT INTO reward_templates (
        id, tier, name, description, amount, weight, stock_remaining, image, terms, active
      )
      VALUES (
        ${template.id},
        ${template.tier},
        ${template.name},
        ${template.description},
        ${template.amount},
        ${template.weight},
        ${template.stock},
        ${template.image},
        ${template.terms},
          TRUE
      )
      ON CONFLICT (id) DO NOTHING
    `
  }
}

export const migrate = async () => {
  if (usePostgres) {
    await migratePostgres()
    return
  }
  migrateSqlite()
}

export const recordEvent = async ({ type, customerId, rewardId, lineUserId, tracking, metadata }) => {
  const branch = tracking?.branch ?? null
  const qrId = tracking?.qrId ?? tracking?.qr_id ?? null
  const utmSource = tracking?.utmSource ?? tracking?.utm_source ?? null
  const utmMedium = tracking?.utmMedium ?? tracking?.utm_medium ?? null
  const utmCampaign = tracking?.utmCampaign ?? tracking?.utm_campaign ?? null
  const createdAt = new Date().toISOString()

  if (usePostgres) {
    await sql`
      INSERT INTO campaign_events (
        id, type, customer_id, reward_id, line_user_id, branch, qr_id,
        utm_source, utm_medium, utm_campaign, metadata, created_at
      )
      VALUES (
        ${randomUUID()},
        ${type},
        ${customerId ?? null},
        ${rewardId ?? null},
        ${lineUserId ?? null},
        ${branch},
        ${qrId},
        ${utmSource},
        ${utmMedium},
        ${utmCampaign},
        ${metadata ?? null},
        ${createdAt}
      )
    `
    return
  }

  sqliteDb.prepare(`
    INSERT INTO campaign_events (
      id, type, customer_id, reward_id, line_user_id, branch, qr_id,
      utm_source, utm_medium, utm_campaign, metadata, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    type,
    customerId ?? null,
    rewardId ?? null,
    lineUserId ?? null,
    branch,
    qrId,
    utmSource,
    utmMedium,
    utmCampaign,
    json(metadata),
    createdAt,
  )
}

export const verifyLineAccessToken = async (accessToken) => {
  if (!accessToken) return null
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw Object.assign(new Error('LINE access token verification failed'), { status: 401 })
  return response.json()
}

export const getWalletByLineAccessToken = async (lineAccessToken) => {
  const lineProfile = await verifyLineAccessToken(lineAccessToken)
  const lineUserId = lineProfile?.userId
  if (!lineUserId) throw Object.assign(new Error('ไม่พบ LINE userId'), { status: 401 })

  if (usePostgres) {
    const customer = (await sql`SELECT * FROM customers WHERE line_user_id = ${lineUserId}`)[0]
    if (!customer) return null
    if (lineProfile.displayName) {
      await sql`
        UPDATE customers
        SET display_name = COALESCE(${lineProfile.displayName}, display_name)
        WHERE id = ${customer.id}
      `
    }
    return getWallet(customer.id)
  }

  const customer = sqliteDb.prepare('SELECT * FROM customers WHERE line_user_id = ?').get(lineUserId)
  if (!customer) return null
  if (lineProfile.displayName) {
    sqliteDb.prepare('UPDATE customers SET display_name = COALESCE(?, display_name) WHERE id = ?').run(
      lineProfile.displayName,
      customer.id,
    )
  }
  return getWallet(customer.id)
}

export const registerCustomer = async ({ profile, tracking, lineAccessToken }) => {
  if (!profile?.name?.trim()) throw Object.assign(new Error('กรุณากรอกชื่อ'), { status: 400 })
  if (!isValidThaiMobile(profile.phone)) throw Object.assign(new Error('เบอร์มือถือไม่ถูกต้อง'), { status: 400 })
  if (!profile.consentMarketing) throw Object.assign(new Error('ต้องยอมรับเงื่อนไขแคมเปญ'), { status: 400 })

  const lineProfile = lineAccessToken ? await verifyLineAccessToken(lineAccessToken) : null
  if (process.env.REQUIRE_LINE_AUTH === 'true' && !lineProfile) {
    throw Object.assign(new Error('ต้องเปิดผ่าน LINE LIFF และยืนยันตัวตนก่อนลงทะเบียน'), { status: 401 })
  }

  const now = new Date().toISOString()
  const phone = normalizeThaiPhone(profile.phone)
  const name = profile.name.trim()
  const ageRange = profile.ageRange ?? 'ไม่ระบุ'
  const visitReason = profile.visitReason?.trim() || 'ลูกค้าใหม่'
  const lineUserId = lineProfile?.userId ?? null
  const displayName = lineProfile?.displayName ?? null

  if (usePostgres) {
    if (lineUserId) {
      const existingByLine = (await sql`SELECT * FROM customers WHERE line_user_id = ${lineUserId}`)[0]
      if (existingByLine) {
        await sql`
          UPDATE customers
          SET display_name = COALESCE(${displayName}, display_name),
              name = ${name},
              age_range = ${ageRange},
              visit_reason = ${visitReason},
              consent_marketing = ${profile.consentMarketing}
          WHERE id = ${existingByLine.id}
        `
        const customer = toCustomer((await sql`SELECT * FROM customers WHERE id = ${existingByLine.id}`)[0])
        await recordEvent({ type: 'register', customerId: customer.id, lineUserId: customer.lineUserId, tracking })
        return customer
      }
    }

    const existingByPhone = (await sql`SELECT * FROM customers WHERE phone = ${phone}`)[0]
    if (existingByPhone) {
      await sql`
        UPDATE customers
        SET line_user_id = CASE WHEN line_user_id IS NULL THEN ${lineUserId} ELSE line_user_id END,
            display_name = COALESCE(${displayName}, display_name),
            name = ${name},
            age_range = ${ageRange},
            visit_reason = ${visitReason},
            consent_marketing = ${profile.consentMarketing}
        WHERE id = ${existingByPhone.id}
      `
      const customer = toCustomer((await sql`SELECT * FROM customers WHERE id = ${existingByPhone.id}`)[0])
      await recordEvent({ type: 'register', customerId: customer.id, lineUserId: customer.lineUserId, tracking })
      return customer
    }

    const id = randomUUID()
    try {
      await sql`
        INSERT INTO customers (
          id, line_user_id, display_name, name, phone, age_range, visit_reason,
          consent_marketing, created_at
        )
        VALUES (
          ${id},
          ${lineUserId},
          ${displayName},
          ${name},
          ${phone},
          ${ageRange},
          ${visitReason},
          ${profile.consentMarketing},
          ${now}
        )
      `
    } catch (error) {
      if (error.code === '23505') {
        const duplicate =
          (lineUserId ? (await sql`SELECT * FROM customers WHERE line_user_id = ${lineUserId}`)[0] : null) ??
          (await sql`SELECT * FROM customers WHERE phone = ${phone}`)[0]
        if (duplicate) return toCustomer(duplicate)
      }
      throw error
    }
    await recordEvent({ type: 'register', customerId: id, lineUserId, tracking })
    return toCustomer((await sql`SELECT * FROM customers WHERE id = ${id}`)[0])
  }

  if (lineUserId) {
    const existingByLine = sqliteDb.prepare('SELECT * FROM customers WHERE line_user_id = ?').get(lineUserId)
    if (existingByLine) {
      sqliteDb.prepare(`
        UPDATE customers
        SET display_name = COALESCE(?, display_name),
            name = ?,
            age_range = ?,
            visit_reason = ?,
            consent_marketing = ?
        WHERE id = ?
      `).run(displayName, name, ageRange, visitReason, profile.consentMarketing ? 1 : 0, existingByLine.id)
      const customer = toCustomer(sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(existingByLine.id))
      await recordEvent({ type: 'register', customerId: customer.id, lineUserId: customer.lineUserId, tracking })
      return customer
    }
  }

  const existingByPhone = sqliteDb.prepare('SELECT * FROM customers WHERE phone = ?').get(phone)
  if (existingByPhone) {
    sqliteDb.prepare(`
      UPDATE customers
      SET line_user_id = CASE WHEN line_user_id IS NULL THEN ? ELSE line_user_id END,
          display_name = COALESCE(?, display_name),
          name = ?,
          age_range = ?,
          visit_reason = ?,
          consent_marketing = ?
      WHERE id = ?
    `).run(
      lineUserId,
      displayName,
      name,
      ageRange,
      visitReason,
      profile.consentMarketing ? 1 : 0,
      existingByPhone.id,
    )
    const customer = toCustomer(sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(existingByPhone.id))
    await recordEvent({ type: 'register', customerId: customer.id, lineUserId: customer.lineUserId, tracking })
    return customer
  }

  const id = randomUUID()
  sqliteDb.prepare(`
    INSERT INTO customers (
      id, line_user_id, display_name, name, phone, age_range, visit_reason,
      consent_marketing, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    lineUserId,
    displayName,
    name,
    phone,
    ageRange,
    visitReason,
    profile.consentMarketing ? 1 : 0,
    now,
  )

  await recordEvent({ type: 'register', customerId: id, lineUserId, tracking })
  return toCustomer(sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(id))
}

const randomRewardCode = () => `RX-JYP-${String(randomInt(0, 10000)).padStart(4, '0')}`

const insertRewardPostgres = async ({ customerId, type, template }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const now = new Date()
    const expiry = new Date(now)
    expiry.setDate(expiry.getDate() + 30)
    const code = randomRewardCode()
    try {
      const inserted = await sql`
        INSERT INTO rewards (
          id, customer_id, template_id, type, tier, name, description, amount,
          expiry_date, status, code, terms, image, issued_at
        )
        VALUES (
          ${randomUUID()},
          ${customerId},
          ${template.id},
          ${type},
          ${template.tier},
          ${template.name},
          ${template.description},
          ${template.amount},
          ${expiry.toISOString().slice(0, 10)},
          'unused',
          ${code},
          ${template.terms},
          ${template.image},
          ${now.toISOString()}
        )
        RETURNING *
      `
      return inserted[0]
    } catch (error) {
      if (error.code === '23505') {
        const existing = (
          await sql`SELECT * FROM rewards WHERE customer_id = ${customerId} AND type = ${type}`
        )[0]
        if (existing) return existing
        continue
      }
      throw error
    }
  }

  throw new Error('ไม่สามารถสร้างคูปองใหม่ได้')
}

export const issueReward = async ({ customerId, type, tracking }) => {
  if (usePostgres) {
    const customer = (await sql`SELECT * FROM customers WHERE id = ${customerId}`)[0]
    if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })

    const existing = (
      await sql`SELECT * FROM rewards WHERE customer_id = ${customerId} AND type = ${type}`
    )[0]
    if (existing) return toReward(existing)

    let templates = await sql`
      SELECT * FROM reward_templates WHERE active = TRUE AND stock_remaining > 0 AND weight > 0
    `
    if (templates.length === 0) throw Object.assign(new Error('รางวัลหมดแล้ว'), { status: 409 })

    while (templates.length > 0) {
      const template = weightedPick(templates)
      if (!template) throw Object.assign(new Error('รางวัลหมดแล้ว'), { status: 409 })
      const decremented = (
        await sql`
          UPDATE reward_templates
          SET stock_remaining = stock_remaining - 1
          WHERE id = ${template.id} AND stock_remaining > 0
          RETURNING *
        `
      )[0]

      if (!decremented) {
        templates = templates.filter((item) => item.id !== template.id)
        continue
      }

      try {
        const inserted = await insertRewardPostgres({ customerId, type, template })
        await recordEvent({
          type: type === 'bonus' ? 'share' : 'draw',
          customerId,
          rewardId: inserted.id,
          lineUserId: customer.line_user_id,
          tracking,
        })
        return toReward(inserted)
      } catch (error) {
        await sql`UPDATE reward_templates SET stock_remaining = stock_remaining + 1 WHERE id = ${template.id}`
        if (error.code === '23505') {
          const duplicate = (
            await sql`SELECT * FROM rewards WHERE customer_id = ${customerId} AND type = ${type}`
          )[0]
          if (duplicate) return toReward(duplicate)
        }
        throw error
      }
    }

    throw Object.assign(new Error('รางวัลหมดแล้ว'), { status: 409 })
  }

  sqliteDb.exec('BEGIN IMMEDIATE')
  try {
    const customer = sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(customerId)
    if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })

    const existing = sqliteDb
      .prepare('SELECT * FROM rewards WHERE customer_id = ? AND type = ?')
      .get(customerId, type)
    if (existing) {
      sqliteDb.exec('COMMIT')
      return toReward(existing)
    }

    const templates = sqliteDb
      .prepare('SELECT * FROM reward_templates WHERE active = 1 AND stock_remaining > 0 AND weight > 0')
      .all()
    if (templates.length === 0) throw Object.assign(new Error('รางวัลหมดแล้ว'), { status: 409 })

    const template = weightedPick(templates)
    if (!template) throw Object.assign(new Error('รางวัลหมดแล้ว'), { status: 409 })
    sqliteDb.prepare('UPDATE reward_templates SET stock_remaining = stock_remaining - 1 WHERE id = ?').run(template.id)

    const now = new Date()
    const expiry = new Date(now)
    expiry.setDate(expiry.getDate() + 30)
    const rewardId = randomUUID()
    let code = randomRewardCode()
    while (sqliteDb.prepare('SELECT id FROM rewards WHERE code = ?').get(code)) code = randomRewardCode()

    sqliteDb.prepare(`
      INSERT INTO rewards (
        id, customer_id, template_id, type, tier, name, description, amount,
        expiry_date, status, code, terms, image, issued_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unused', ?, ?, ?, ?)
    `).run(
      rewardId,
      customerId,
      template.id,
      type,
      template.tier,
      template.name,
      template.description,
      template.amount,
      expiry.toISOString().slice(0, 10),
      code,
      template.terms,
      template.image,
      now.toISOString(),
    )

    sqliteDb.exec('COMMIT')
    const reward = toReward(sqliteDb.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId))
    await recordEvent({
      type: type === 'bonus' ? 'share' : 'draw',
      customerId,
      rewardId: reward.id,
      lineUserId: customer.line_user_id,
      tracking,
    })
    return reward
  } catch (error) {
    sqliteDb.exec('ROLLBACK')
    throw error
  }
}

export const verifyFriendship = async ({ customerId, tracking, lineUserId }) => {
  if (usePostgres) {
    const customer = (await sql`SELECT * FROM customers WHERE id = ${customerId}`)[0]
    if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })
    if (process.env.REQUIRE_LINE_AUTH === 'true' && !lineUserId && !customer.line_user_id) {
      throw Object.assign(new Error('ต้องยืนยัน LINE user ก่อนปลดล็อกคูปอง'), { status: 401 })
    }

    const verifiedAt = new Date().toISOString()
    await sql`
      INSERT INTO friendships (customer_id, line_user_id, verified_at)
      VALUES (${customerId}, ${lineUserId ?? customer.line_user_id ?? null}, ${verifiedAt})
      ON CONFLICT (customer_id) DO UPDATE SET
        line_user_id = EXCLUDED.line_user_id,
        verified_at = EXCLUDED.verified_at
    `
    await recordEvent({ type: 'friend', customerId, lineUserId: lineUserId ?? customer.line_user_id, tracking })
    return { customerId, verifiedAt }
  }

  const customer = sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(customerId)
  if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })
  if (process.env.REQUIRE_LINE_AUTH === 'true' && !lineUserId && !customer.line_user_id) {
    throw Object.assign(new Error('ต้องยืนยัน LINE user ก่อนปลดล็อกคูปอง'), { status: 401 })
  }
  const verifiedAt = new Date().toISOString()
  sqliteDb.prepare(`
    INSERT INTO friendships (customer_id, line_user_id, verified_at)
    VALUES (?, ?, ?)
    ON CONFLICT(customer_id) DO UPDATE SET
      line_user_id = excluded.line_user_id,
      verified_at = excluded.verified_at
  `).run(customerId, lineUserId ?? customer.line_user_id ?? null, verifiedAt)
  await recordEvent({ type: 'friend', customerId, lineUserId: lineUserId ?? customer.line_user_id, tracking })
  return { customerId, verifiedAt }
}

export const getWallet = async (customerId) => {
  if (usePostgres) {
    const customer = toCustomer((await sql`SELECT * FROM customers WHERE id = ${customerId}`)[0])
    if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })
    const rewards = (await sql`
      SELECT * FROM rewards WHERE customer_id = ${customerId} ORDER BY issued_at DESC
    `).map(toReward)
    const friendship = (await sql`SELECT * FROM friendships WHERE customer_id = ${customerId}`)[0]
    return {
      customer,
      rewards,
      friendUnlocked: Boolean(friendship),
      friendshipVerifiedAt: friendship?.verified_at ?? null,
    }
  }

  const customer = toCustomer(sqliteDb.prepare('SELECT * FROM customers WHERE id = ?').get(customerId))
  if (!customer) throw Object.assign(new Error('ไม่พบลูกค้า'), { status: 404 })
  const rewards = sqliteDb
    .prepare('SELECT * FROM rewards WHERE customer_id = ? ORDER BY issued_at DESC')
    .all(customerId)
    .map(toReward)
  const friendship = sqliteDb.prepare('SELECT * FROM friendships WHERE customer_id = ?').get(customerId)
  return {
    customer,
    rewards,
    friendUnlocked: Boolean(friendship),
    friendshipVerifiedAt: friendship?.verified_at ?? null,
  }
}

export const redeemReward = async ({ code, staffPin }) => {
  if (process.env.STAFF_REDEEM_PIN && staffPin !== process.env.STAFF_REDEEM_PIN) {
    throw Object.assign(new Error('รหัสพนักงานไม่ถูกต้อง'), { status: 401 })
  }

  if (usePostgres) {
    const reward = (
      await sql`SELECT * FROM rewards WHERE lower(code) = lower(${String(code ?? '').trim()})`
    )[0]
    if (!reward) throw Object.assign(new Error('ไม่พบคูปอง'), { status: 404 })
    if (reward.status !== 'unused') return toReward(reward)

    const updated = (
      await sql`
        UPDATE rewards
        SET status = 'used', used_at = ${new Date().toISOString()}
        WHERE id = ${reward.id} AND status = 'unused'
        RETURNING *
      `
    )[0]
    const finalReward = updated ?? (await sql`SELECT * FROM rewards WHERE id = ${reward.id}`)[0]
    if (updated) {
      await recordEvent({ type: 'redeem', customerId: reward.customer_id, rewardId: reward.id })
    }
    return toReward(finalReward)
  }

  const reward = sqliteDb.prepare('SELECT * FROM rewards WHERE lower(code) = lower(?)').get(String(code ?? '').trim())
  if (!reward) throw Object.assign(new Error('ไม่พบคูปอง'), { status: 404 })
  if (reward.status !== 'unused') return toReward(reward)

  const now = new Date().toISOString()
  sqliteDb.prepare("UPDATE rewards SET status = 'used', used_at = ? WHERE id = ?").run(now, reward.id)
  await recordEvent({ type: 'redeem', customerId: reward.customer_id, rewardId: reward.id })
  return toReward(sqliteDb.prepare('SELECT * FROM rewards WHERE id = ?').get(reward.id))
}

const cleanRewardTemplatePatch = (input = {}) => {
  const patch = {}

  for (const key of ['name', 'description', 'terms']) {
    if (Object.hasOwn(input, key)) {
      const value = String(input[key] ?? '').trim()
      if (!value) throw Object.assign(new Error(`กรุณากรอก ${key}`), { status: 400 })
      patch[key] = value
    }
  }

  for (const key of ['amount', 'weight']) {
    if (Object.hasOwn(input, key)) {
      const value = Number(input[key])
      if (!Number.isFinite(value) || value < 0) {
        throw Object.assign(new Error(`${key} ต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0`), { status: 400 })
      }
      patch[key] = Math.round(value)
    }
  }

  const stockValue = input.stock_remaining ?? input.stockRemaining
  if (Object.hasOwn(input, 'stock_remaining') || Object.hasOwn(input, 'stockRemaining')) {
    const value = Number(stockValue)
    if (!Number.isFinite(value) || value < 0) {
      throw Object.assign(new Error('stock_remaining ต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0'), { status: 400 })
    }
    patch.stock_remaining = Math.round(value)
  }

  if (Object.hasOwn(input, 'active')) {
    patch.active = Boolean(input.active)
  }

  return patch
}

export const updateRewardTemplate = async ({ id, updates }) => {
  const rewardId = String(id ?? '').trim()
  if (!rewardId) throw Object.assign(new Error('ไม่พบรหัสรางวัล'), { status: 400 })

  const patch = cleanRewardTemplatePatch(updates)
  const values = {
    name: patch.name ?? null,
    description: patch.description ?? null,
    amount: patch.amount ?? null,
    weight: patch.weight ?? null,
    stock_remaining: patch.stock_remaining ?? null,
    terms: patch.terms ?? null,
    active: Object.hasOwn(patch, 'active') ? patch.active : null,
  }

  if (usePostgres) {
    const updated = (
      await sql`
        UPDATE reward_templates
        SET name = COALESCE(${values.name}, name),
            description = COALESCE(${values.description}, description),
            amount = COALESCE(${values.amount}, amount),
            weight = COALESCE(${values.weight}, weight),
            stock_remaining = COALESCE(${values.stock_remaining}, stock_remaining),
            terms = COALESCE(${values.terms}, terms),
            active = COALESCE(${values.active}, active)
        WHERE id = ${rewardId}
        RETURNING *
      `
    )[0]
    if (!updated) throw Object.assign(new Error('ไม่พบรางวัลนี้'), { status: 404 })
    return toAdminRewardTemplate(updated)
  }

  const updated = sqliteDb
    .prepare(`
      UPDATE reward_templates
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          amount = COALESCE(?, amount),
          weight = COALESCE(?, weight),
          stock_remaining = COALESCE(?, stock_remaining),
          terms = COALESCE(?, terms),
          active = COALESCE(?, active)
      WHERE id = ?
      RETURNING *
    `)
    .get(
      values.name,
      values.description,
      values.amount,
      values.weight,
      values.stock_remaining,
      values.terms,
      Object.hasOwn(patch, 'active') ? (patch.active ? 1 : 0) : null,
      rewardId,
    )
  if (!updated) throw Object.assign(new Error('ไม่พบรางวัลนี้'), { status: 404 })
  return toAdminRewardTemplate(updated)
}

export const adminSummary = async () => {
  if (usePostgres) {
    const eventRows = await sql`SELECT type, count(*)::int as total FROM campaign_events GROUP BY type`
    const events = Object.fromEntries(eventRows.map((row) => [row.type, row.total]))
    const sourceRows = await sql`
      SELECT COALESCE(branch, qr_id, 'แคมเปญหลัก') as source, count(*)::int as total
      FROM campaign_events
      GROUP BY source
      ORDER BY total DESC
    `
    const templates = await sql`SELECT * FROM reward_templates ORDER BY weight DESC`
    const participants = await sql`
      SELECT
        c.id,
        c.name,
        c.phone,
        c.display_name,
        c.line_user_id,
        c.created_at,
        COALESCE(reward_counts.reward_count, 0)::int AS reward_count,
        main_reward.name AS main_reward_name,
        main_reward.code AS main_reward_code,
        main_reward.status AS main_reward_status,
        main_reward.issued_at AS last_reward_at,
        f.verified_at AS friendship_verified_at
      FROM customers c
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS reward_count
        FROM rewards r
        WHERE r.customer_id = c.id
      ) reward_counts ON TRUE
      LEFT JOIN LATERAL (
        SELECT name, code, status, issued_at
        FROM rewards
        WHERE customer_id = c.id AND type = 'main'
        ORDER BY issued_at DESC
        LIMIT 1
      ) main_reward ON TRUE
      LEFT JOIN friendships f ON f.customer_id = c.id
      ORDER BY c.created_at DESC
      LIMIT 200
    `
    return {
      events,
      sources: sourceRows,
      rewardTemplates: templates.map(toAdminRewardTemplate),
      participants: participants.map(toAdminParticipant),
    }
  }

  const eventRows = sqliteDb.prepare('SELECT type, count(*) as total FROM campaign_events GROUP BY type').all()
  const events = Object.fromEntries(eventRows.map((row) => [row.type, row.total]))
  const sourceRows = sqliteDb
    .prepare(`
      SELECT COALESCE(branch, qr_id, 'แคมเปญหลัก') as source, count(*) as total
      FROM campaign_events
      GROUP BY source
      ORDER BY total DESC
    `)
    .all()
  const templates = sqliteDb.prepare('SELECT * FROM reward_templates ORDER BY weight DESC').all()
  const participants = sqliteDb
    .prepare(`
      SELECT
        c.id,
        c.name,
        c.phone,
        c.display_name,
        c.line_user_id,
        c.created_at,
        (SELECT count(*) FROM rewards r WHERE r.customer_id = c.id) AS reward_count,
        (SELECT r.name FROM rewards r WHERE r.customer_id = c.id AND r.type = 'main' ORDER BY r.issued_at DESC LIMIT 1) AS main_reward_name,
        (SELECT r.code FROM rewards r WHERE r.customer_id = c.id AND r.type = 'main' ORDER BY r.issued_at DESC LIMIT 1) AS main_reward_code,
        (SELECT r.status FROM rewards r WHERE r.customer_id = c.id AND r.type = 'main' ORDER BY r.issued_at DESC LIMIT 1) AS main_reward_status,
        (SELECT r.issued_at FROM rewards r WHERE r.customer_id = c.id AND r.type = 'main' ORDER BY r.issued_at DESC LIMIT 1) AS last_reward_at,
        f.verified_at AS friendship_verified_at
      FROM customers c
      LEFT JOIN friendships f ON f.customer_id = c.id
      ORDER BY c.created_at DESC
      LIMIT 200
    `)
    .all()
  return {
    events,
    sources: sourceRows,
    rewardTemplates: templates.map(toAdminRewardTemplate),
    participants: participants.map(toAdminParticipant),
  }
}

export { parseJson, usePostgres }
