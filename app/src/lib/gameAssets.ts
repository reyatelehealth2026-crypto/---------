import type { RewardTier } from './campaign'

export const gameAssets = {
  machine: '/game-machine-cny.webp',
  idleCapsules: '/game-capsule-idle.webp',
  openCapsule: '/game-capsule-open.webp',
  rewardTicket: '/game-reward-ticket.webp',
  confetti: '/game-confetti.webp',
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
    image: '/game-capsule-yellow.webp',
    accent: '#D4B85A',
    soft: '#FFF4C8',
    text: '#5C4A12',
  },
  purple: {
    tier: 'purple',
    label: 'แคปซูลพรีเมียม',
    image: '/game-capsule-purple.webp',
    accent: '#8E6DCA',
    soft: '#EFE8FF',
    text: '#432A76',
  },
  green: {
    tier: 'green',
    label: 'แคปซูลสุขภาพ',
    image: '/game-capsule-green.webp',
    accent: '#2E7D5A',
    soft: '#E8F6F3',
    text: '#164A38',
  },
  blue: {
    tier: 'blue',
    label: 'แคปซูลดีล',
    image: '/game-capsule-blue.webp',
    accent: '#56A9D6',
    soft: '#E4F6FF',
    text: '#18516D',
  },
  pink: {
    tier: 'pink',
    label: 'แคปซูลของขวัญ',
    image: '/game-capsule-pink.webp',
    accent: '#E66D98',
    soft: '#FFE8F0',
    text: '#7D2443',
  },
  white: {
    tier: 'white',
    label: 'แคปซูลดูแล',
    image: '/game-capsule-white.webp',
    accent: '#C9BFAE',
    soft: '#F8F3EA',
    text: '#5F554B',
  },
}

export const getCapsuleTheme = (tier?: RewardTier | null) => capsuleThemes[tier ?? 'green']

