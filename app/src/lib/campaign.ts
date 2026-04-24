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
  image: string
  terms: string
}

export interface Reward {
  id: string
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
  campaignTitle: 'ลูกค้าใหม่ แอด LINE รับส่วนลดสูงสุด 600 บาท',
  campaignSubtitle:
    'แอด LINE @clinicya เพื่อรับคูปองส่วนลด เก็บสิทธิ์ไว้ใน Wallet และติดตามข่าวสารจาก CNY HEALTHCARE',
}

const safePharmacyTerms =
  'ใช้ได้กับสินค้าและบริการสุขภาพที่ร่วมรายการของ CNY HEALTHCARE ตามเงื่อนไขที่กำหนด ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้'

export const rewardTemplates: RewardTemplate[] = [
  {
    id: 'discount-600',
    tier: 'yellow',
    name: 'ส่วนลด 600 บาท',
    description: 'คูปองพิเศษสำหรับลูกค้าใหม่ที่แอด LINE @clinicya ใช้กับยอดซื้อสินค้าสุขภาพที่ร่วมรายการครบ 3,000 บาท',
    amount: 600,
    weight: 5,
    image: '/item-coupon-gold.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-300',
    tier: 'purple',
    name: 'ส่วนลด 300 บาท',
    description: 'ใช้เป็นส่วนลดสำหรับสินค้าสุขภาพและบริการที่ร่วมรายการ เมื่อมียอดใช้จ่ายครบ 1,500 บาท',
    amount: 300,
    weight: 10,
    image: '/item-coupon-gold.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-100',
    tier: 'green',
    name: 'ส่วนลด 100 บาท',
    description: 'สำหรับยอดซื้อสินค้าสุขภาพที่ร่วมรายการครบ 799 บาท',
    amount: 100,
    weight: 25,
    image: '/item-supplement-bottle.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-50',
    tier: 'blue',
    name: 'ส่วนลด 50 บาท',
    description: 'ใช้เป็นส่วนลดทันทีสำหรับสินค้าและบริการสุขภาพที่ร่วมรายการ',
    amount: 50,
    weight: 35,
    image: '/item-coupon-gold.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'welcome-gift',
    tier: 'pink',
    name: 'ของสมนาคุณลูกค้าใหม่',
    description: 'รับของสมนาคุณที่ CNY HEALTHCARE จัดไว้ในช่วงแคมเปญ',
    amount: 25,
    weight: 15,
    image: '/item-gift-box.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'care-check',
    tier: 'white',
    name: 'ประเมินสุขภาพเบื้องต้นฟรี',
    description: 'รับบริการประเมินสุขภาพเบื้องต้นหรือคำแนะนำจากทีมดูแลสุขภาพ',
    amount: 0,
    weight: 10,
    image: '/item-supplement-bottle.png',
    terms:
      'ใช้บริการได้ตามเวลาทำการของ CNY HEALTHCARE เป็นบริการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยโรค และไม่สามารถแลกเป็นเงินสด',
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
  const totalWeight = rewardTemplates.reduce((sum, item) => sum + item.weight, 0)
  const safeRandom = Math.min(Math.max(randomValue, 0), 0.999999)
  const threshold = safeRandom * totalWeight
  let cursor = 0

  for (const template of rewardTemplates) {
    cursor += template.weight
    if (threshold < cursor) return template
  }

  return rewardTemplates[rewardTemplates.length - 1]
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
