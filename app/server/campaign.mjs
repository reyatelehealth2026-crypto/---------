export const pharmacyProfile = {
  name: process.env.PHARMACY_NAME ?? 'CNY HEALTHCARE',
  lineHandle: process.env.LINE_OA_ID ?? '@clinicya',
  phone: process.env.PHARMACY_PHONE ?? '099-191-5416',
  campaignTitle: 'ลูกค้าใหม่ แอด LINE รับส่วนลดสูงสุด 600 บาท',
  campaignSubtitle:
    'แอด LINE @clinicya เพื่อรับคูปองส่วนลด เก็บสิทธิ์ไว้ใน Wallet และติดตามข่าวสารจาก CNY HEALTHCARE',
}

const safePharmacyTerms =
  'ใช้ได้กับสินค้าและบริการสุขภาพที่ร่วมรายการของ CNY HEALTHCARE ตามเงื่อนไขที่กำหนด ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้'

export const rewardTemplates = [
  {
    id: 'discount-600',
    tier: 'yellow',
    name: 'ส่วนลด 600 บาท',
    description: 'คูปองพิเศษสำหรับลูกค้าใหม่ที่แอด LINE @clinicya ใช้กับยอดซื้อสินค้าสุขภาพที่ร่วมรายการครบ 3,000 บาท',
    amount: 600,
    weight: 5,
    stock: 100,
    image: '/reward-ticket-100.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-300',
    tier: 'purple',
    name: 'ส่วนลด 300 บาท',
    description: 'ใช้เป็นส่วนลดสำหรับสินค้าสุขภาพและบริการที่ร่วมรายการ เมื่อมียอดใช้จ่ายครบ 1,500 บาท',
    amount: 300,
    weight: 10,
    stock: 180,
    image: '/capsule-purple.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-100',
    tier: 'green',
    name: 'ส่วนลด 100 บาท',
    description: 'สำหรับยอดซื้อสินค้าสุขภาพที่ร่วมรายการครบ 799 บาท',
    amount: 100,
    weight: 25,
    stock: 350,
    image: '/reward-ticket-100.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'discount-50',
    tier: 'blue',
    name: 'ส่วนลด 50 บาท',
    description: 'ใช้เป็นส่วนลดทันทีสำหรับสินค้าและบริการสุขภาพที่ร่วมรายการ',
    amount: 50,
    weight: 35,
    stock: 700,
    image: '/reward-ticket-20.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'welcome-gift',
    tier: 'pink',
    name: 'ของสมนาคุณลูกค้าใหม่',
    description: 'รับของสมนาคุณที่ CNY HEALTHCARE จัดไว้ในช่วงแคมเปญ',
    amount: 25,
    weight: 15,
    stock: 300,
    image: '/capsule-pink.png',
    terms: safePharmacyTerms,
  },
  {
    id: 'care-check',
    tier: 'white',
    name: 'ประเมินสุขภาพเบื้องต้นฟรี',
    description: 'รับบริการประเมินสุขภาพเบื้องต้นหรือคำแนะนำจากทีมดูแลสุขภาพ',
    amount: 0,
    weight: 10,
    stock: 500,
    image: '/capsule-white.png',
    terms:
      'ใช้บริการได้ตามเวลาทำการของ CNY HEALTHCARE เป็นบริการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยโรค และไม่สามารถแลกเป็นเงินสด',
  },
]
