import type { RewardTier } from './campaign'

export const gameAssets = {
  machine: '/game-machine-cny.png',
  idleCapsules: '/game-capsule-idle.png',
  openCapsule: '/game-capsule-open.png',
  rewardTicket: '/game-reward-ticket.png',
  confetti: '/game-confetti.png',
  mascot: {
    idle: '/mascot-idle.png',
    happy: '/mascot-happy.png',
    surprised: '/mascot-surprised.png',
    celebrate: '/mascot-celebrate.png',
  },
  items: {
    couponGold: '/item-coupon-gold.png',
    giftBox: '/item-gift-box.png',
    supplementBottle: '/item-supplement-bottle.png',
  },
  backgrounds: {
    pharmacyShop: '/bg-pharmacy-shop.png',
    workspace: '/bg-workspace.png',
  },
  ui: {
    buttonPlay: '/ui-button-play.png',
    buttonClaim: '/ui-button-claim.png',
    frameBanner: '/ui-frame-banner.png',
    frameProfile: '/ui-frame-profile.png',
  },
}

export interface CapsuleTheme {
  tier: RewardTier
  label: string
  image: string
  accent: string
  soft: string
  text: string
}

export const capsuleThemes: Record<RewardTier, CapsuleTheme> = {
  yellow: {
    tier: 'yellow',
    label: 'แคปซูลทอง',
    image: '/game-capsule-yellow.png',
    accent: '#D4B85A',
    soft: '#FFF4C8',
    text: '#5C4A12',
  },
  purple: {
    tier: 'purple',
    label: 'แคปซูลพรีเมียม',
    image: '/game-capsule-purple.png',
    accent: '#8E6DCA',
    soft: '#EFE8FF',
    text: '#432A76',
  },
  green: {
    tier: 'green',
    label: 'แคปซูลสุขภาพ',
    image: '/game-capsule-green.png',
    accent: '#2E7D5A',
    soft: '#E8F6F3',
    text: '#164A38',
  },
  blue: {
    tier: 'blue',
    label: 'แคปซูลดีล',
    image: '/game-capsule-blue.png',
    accent: '#56A9D6',
    soft: '#E4F6FF',
    text: '#18516D',
  },
  pink: {
    tier: 'pink',
    label: 'แคปซูลของขวัญ',
    image: '/game-capsule-pink.png',
    accent: '#E66D98',
    soft: '#FFE8F0',
    text: '#7D2443',
  },
  white: {
    tier: 'white',
    label: 'แคปซูลดูแล',
    image: '/game-capsule-white.png',
    accent: '#C9BFAE',
    soft: '#F8F3EA',
    text: '#5F554B',
  },
}

export const getCapsuleTheme = (tier?: RewardTier | null) => capsuleThemes[tier ?? 'green']

