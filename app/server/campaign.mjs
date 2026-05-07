export const pharmacyProfile = {
  name: process.env.PHARMACY_NAME ?? 'CNY HEALTHCARE',
  lineHandle: process.env.LINE_OA_ID ?? '@clinicya',
  phone: process.env.PHARMACY_PHONE ?? '099-191-5416',
  campaignTitle: 'ลูกค้าใหม่ แอด LINE เล่นกาชารับของรางวัล',
  campaignSubtitle:
    'แอด LINE @clinicya เพื่อเก็บสิทธิ์ของรางวัลไว้ใน Wallet และรับข่าวสารจาก CNY HEALTHCARE',
}

const productGiftTerms =
  'แสดงหน้ารางวัลให้พนักงานตรวจสอบและรับสินค้าที่จุดกิจกรรม ของรางวัลมีจำนวนจำกัด ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้'

export const rewardTemplates = [
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
