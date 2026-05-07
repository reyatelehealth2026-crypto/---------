export type RewardTier = 'blue' | 'green' | 'yellow' | 'pink' | 'purple' | 'white'
export type RewardKind = 'main' | 'bonus'
export type RewardStatus = 'unused' | 'used' | 'expired'

export interface TrackingParams {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  branch: string | null
  qrId: string | null
}

export interface RewardTemplate {
  id: string
  tier: RewardTier
  name: string
  description: string
  amount: number
  weight: number
  stock: number
  image: string
  terms: string
}

export interface Reward {
  id: string
  customerId?: string
  templateId: string
  type: RewardKind
  tier: RewardTier
  name: string
  description: string
  amount: number
  expiryDate: string
  status: RewardStatus
  code: string
  terms: string
  image: string
  issuedAt: string
  usedAt?: string
}

export interface CustomerProfile {
  name: string
  phone: string
  ageRange?: string
  visitReason?: string
  consentMarketing: boolean
  registeredAt: string
}

export interface CampaignEvent {
  type: 'scan' | 'register' | 'draw' | 'friend' | 'share' | 'redeem'
  timestamp: string
  branch: string | null
  qrId: string | null
}

export const pharmacyProfile = {
  name: 'CNY HEALTHCARE',
  lineHandle: '@clinicya',
  phone: '099-191-5416',
  campaignTitle: 'ลูกค้าใหม่ แอด LINE เล่นกาชารับของรางวัล',
  campaignSubtitle:
    'แอด LINE @clinicya เพื่อเก็บสิทธิ์ของรางวัลไว้ใน Wallet และรับข่าวสารจาก CNY HEALTHCARE',
}

const productGiftTerms =
  'แสดงหน้ารางวัลให้พนักงานตรวจสอบและรับสินค้าที่จุดกิจกรรม ของรางวัลมีจำนวนจำกัด ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้'

export const rewardTemplates: RewardTemplate[] = [
  {
    id: 'protinex-energy-cup',
    tier: 'yellow',
    name: 'Protinex Energy Cup',
    description: 'ของรางวัลสำหรับผู้ร่วมกิจกรรม CNY HEALTHCARE',
    amount: 0,
    weight: 86,
    stock: 86,
    image: '/item-gift-box.png',
    terms: productGiftTerms,
  },
  {
    id: 'orange-boost-cup',
    tier: 'purple',
    name: 'Orange Boost Cup',
    description: 'ของรางวัลสำหรับผู้ร่วมกิจกรรม CNY HEALTHCARE',
    amount: 0,
    weight: 56,
    stock: 56,
    image: '/item-gift-box.png',
    terms: productGiftTerms,
  },
  {
    id: 'eco-style-bag',
    tier: 'green',
    name: 'Eco Style Bag',
    description: 'ของรางวัลสำหรับผู้ร่วมกิจกรรม CNY HEALTHCARE',
    amount: 0,
    weight: 36,
    stock: 36,
    image: '/item-gift-box.png',
    terms: productGiftTerms,
  },
  {
    id: 'daily-smart-pen',
    tier: 'blue',
    name: 'Daily Smart Pen',
    description: 'ของรางวัลสำหรับผู้ร่วมกิจกรรม CNY HEALTHCARE',
    amount: 0,
    weight: 150,
    stock: 150,
    image: '/item-gift-box.png',
    terms: productGiftTerms,
  },
  {
    id: 'natural-daily-bag',
    tier: 'pink',
    name: 'Natural Daily Bag',
    description: 'ของรางวัลสำหรับผู้ร่วมกิจกรรม CNY HEALTHCARE',
    amount: 0,
    weight: 179,
    stock: 179,
    image: '/item-gift-box.png',
    terms: productGiftTerms,
  },
]

export const visitReasonOptions = ['ลูกค้าใหม่']

export function normalizeThaiPhone(input: string) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('66') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

export function isValidThaiMobile(input: string) {
  return /^0[689]\d{8}$/.test(normalizeThaiPhone(input))
}

export function selectRewardTemplate(randomValue = Math.random()) {
  const availableTemplates = rewardTemplates.filter((item) => item.stock > 0 && item.weight > 0)
  const totalWeight = availableTemplates.reduce((sum, item) => sum + item.stock, 0)
  const safeRandom = Math.min(Math.max(randomValue, 0), 0.999999)
  const threshold = safeRandom * totalWeight
  let cursor = 0

  for (const template of availableTemplates) {
    cursor += template.stock
    if (threshold < cursor) return template
  }

  return availableTemplates[availableTemplates.length - 1]
}

export function createReward(
  template: RewardTemplate,
  type: RewardKind = 'main',
  now = new Date(),
  sequence = 1,
): Reward {
  const expiry = new Date(now)
  expiry.setDate(expiry.getDate() + 30)

  return {
    id: `${type}-${template.id}-${now.getTime()}-${sequence}`,
    templateId: template.id,
    type,
    tier: template.tier,
    name: template.name,
    description: template.description,
    amount: template.amount,
    expiryDate: expiry.toISOString().slice(0, 10),
    status: 'unused',
    code: `RX-JYP-${String(sequence).padStart(4, '0')}`,
    terms: template.terms,
    image: template.image,
    issuedAt: now.toISOString(),
  }
}

export function drawReward(type: RewardKind = 'main', sequence = 1, randomValue = Math.random()) {
  return createReward(selectRewardTemplate(randomValue), type, new Date(), sequence)
}

export function formatBaht(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatThaiDate(dateISO: string) {
  const datePart = String(dateISO ?? '').match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
  const date = datePart ? new Date(`${datePart}T00:00:00+07:00`) : new Date(dateISO)

  if (Number.isNaN(date.getTime())) return 'ไม่ระบุ'

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function createEvent(
  type: CampaignEvent['type'],
  tracking: TrackingParams,
  now = new Date(),
): CampaignEvent {
  return {
    type,
    timestamp: now.toISOString(),
    branch: tracking.branch,
    qrId: tracking.qrId,
  }
}

export function getBranchLabel(tracking: TrackingParams) {
  if (tracking.branch) return `สาขา ${tracking.branch}`
  if (tracking.qrId) return `QR ${tracking.qrId}`
  return 'แคมเปญหลัก'
}

export function countEvents(events: CampaignEvent[], type: CampaignEvent['type']) {
  return events.filter((event) => event.type === type).length
}
