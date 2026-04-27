import type { RewardTier } from './campaign'

const cutePetBase = '/cute-pet-gacha-assets'

export const cutePetAssets = {
  backgrounds: {
    fullEventPoster: `${cutePetBase}/full-event-poster.png`,
    stage: `${cutePetBase}/game-stage-bg.png`,
    hills: `${cutePetBase}/game-hills-landscape.png`,
  },
  buildings: {
    school: `${cutePetBase}/game-building-school.png`,
    shop: `${cutePetBase}/game-building-shop.png`,
  },
  machines: {
    main: `${cutePetBase}/game-machine-main.png`,
    empty: `${cutePetBase}/game-machine-empty.png`,
  },
  mascots: {
    bird: `${cutePetBase}/game-bird-mascot.png`,
    cat: `${cutePetBase}/game-cat-mascot.png`,
    monkey: `${cutePetBase}/game-monkey-mascot.png`,
  },
  capsules: {
    blue: `${cutePetBase}/game-capsule-blue.png`,
    pink: `${cutePetBase}/game-capsule-pink.png`,
    yellowRare: `${cutePetBase}/game-capsule-yellow-rare.png`,
    cluster: `${cutePetBase}/game-capsule-cluster.png`,
    eggPatterns: `${cutePetBase}/game-pet-egg-patterns.png`,
  },
  rewards: {
    popup: `${cutePetBase}/game-reward-popup.png`,
    cardCommon: `${cutePetBase}/game-reward-card-common.png`,
    cardRare: `${cutePetBase}/game-reward-card-rare.png`,
    glow: `${cutePetBase}/game-prize-glow.png`,
    giftBox: `${cutePetBase}/game-gift-box.png`,
    ticket: `${cutePetBase}/game-ticket-coupon.png`,
  },
  currency: {
    coin: `${cutePetBase}/game-single-coin.png`,
    coinPile: `${cutePetBase}/game-coin-pile.png`,
    diamondCluster: `${cutePetBase}/game-diamond-cluster.png`,
  },
  ui: {
    logoSign: `${cutePetBase}/game-logo-wood-sign.png`,
    subtitlePlank: `${cutePetBase}/game-subtitle-wood-plank.png`,
    bottomBanner: `${cutePetBase}/game-bottom-info-banner.png`,
    playButton: `${cutePetBase}/game-play-button.png`,
    storeButton: `${cutePetBase}/game-small-store-button.png`,
    woodFrame: `${cutePetBase}/game-wood-frame-foreground.png`,
  },
  props: {
    fence: `${cutePetBase}/game-fence.png`,
    treeBush: `${cutePetBase}/game-tree-bush-set.png`,
    paintPalette: `${cutePetBase}/game-paint-palette-prop.png`,
    confetti: `${cutePetBase}/game-confetti.png`,
  },
  loading: {
    egg: `${cutePetBase}/game-loading-egg.png`,
  },
} as const

export const gameAssets = {
  machine: cutePetAssets.machines.main,
  machineEmpty: cutePetAssets.machines.empty,
  idleCapsules: cutePetAssets.capsules.cluster,
  openCapsule: cutePetAssets.rewards.popup,
  rewardTicket: cutePetAssets.rewards.ticket,
  confetti: cutePetAssets.props.confetti,
  prizeGlow: cutePetAssets.rewards.glow,
  loadingEgg: cutePetAssets.loading.egg,
  mascot: {
    idle: cutePetAssets.mascots.cat,
    happy: cutePetAssets.mascots.bird,
    surprised: cutePetAssets.mascots.monkey,
    celebrate: cutePetAssets.mascots.monkey,
  },
  items: {
    couponGold: cutePetAssets.rewards.ticket,
    giftBox: cutePetAssets.rewards.giftBox,
    supplementBottle: cutePetAssets.currency.diamondCluster,
  },
  backgrounds: {
    pharmacyShop: cutePetAssets.backgrounds.stage,
    workspace: cutePetAssets.backgrounds.hills,
    stage: cutePetAssets.backgrounds.stage,
    hills: cutePetAssets.backgrounds.hills,
    poster: cutePetAssets.backgrounds.fullEventPoster,
  },
  ui: {
    buttonPlay: cutePetAssets.ui.playButton,
    buttonClaim: cutePetAssets.ui.storeButton,
    frameBanner: cutePetAssets.ui.bottomBanner,
    frameProfile: cutePetAssets.ui.subtitlePlank,
    woodFrame: cutePetAssets.ui.woodFrame,
    logoSign: cutePetAssets.ui.logoSign,
    subtitlePlank: cutePetAssets.ui.subtitlePlank,
    bottomBanner: cutePetAssets.ui.bottomBanner,
    storeButton: cutePetAssets.ui.storeButton,
    playButton: cutePetAssets.ui.playButton,
  },
  buildings: cutePetAssets.buildings,
  props: cutePetAssets.props,
  rewards: cutePetAssets.rewards,
  currency: cutePetAssets.currency,
  capsules: cutePetAssets.capsules,
}

export interface CapsuleTheme {
  tier: RewardTier
  label: string
  image: string
  rarity: 'common' | 'rare'
  rewardCard: string
  accent: string
  soft: string
  text: string
}

export const capsuleThemes: Record<RewardTier, CapsuleTheme> = {
  yellow: {
    tier: 'yellow',
    label: 'แคปซูลทอง',
    image: cutePetAssets.capsules.yellowRare,
    rarity: 'rare',
    rewardCard: cutePetAssets.rewards.cardRare,
    accent: '#D4B85A',
    soft: '#FFF4C8',
    text: '#5C4A12',
  },
  purple: {
    tier: 'purple',
    label: 'แคปซูลพรีเมียม',
    image: cutePetAssets.capsules.yellowRare,
    rarity: 'rare',
    rewardCard: cutePetAssets.rewards.cardRare,
    accent: '#8E6DCA',
    soft: '#EFE8FF',
    text: '#432A76',
  },
  green: {
    tier: 'green',
    label: 'แคปซูลสุขภาพ',
    image: cutePetAssets.capsules.blue,
    rarity: 'common',
    rewardCard: cutePetAssets.rewards.cardCommon,
    accent: '#2E7D5A',
    soft: '#E8F6F3',
    text: '#164A38',
  },
  blue: {
    tier: 'blue',
    label: 'แคปซูลดีล',
    image: cutePetAssets.capsules.blue,
    rarity: 'common',
    rewardCard: cutePetAssets.rewards.cardCommon,
    accent: '#56A9D6',
    soft: '#E4F6FF',
    text: '#18516D',
  },
  pink: {
    tier: 'pink',
    label: 'แคปซูลของขวัญ',
    image: cutePetAssets.capsules.pink,
    rarity: 'common',
    rewardCard: cutePetAssets.rewards.cardCommon,
    accent: '#E66D98',
    soft: '#FFE8F0',
    text: '#7D2443',
  },
  white: {
    tier: 'white',
    label: 'แคปซูลดูแล',
    image: cutePetAssets.capsules.pink,
    rarity: 'common',
    rewardCard: cutePetAssets.rewards.cardCommon,
    accent: '#C9BFAE',
    soft: '#F8F3EA',
    text: '#5F554B',
  },
}

export const getCapsuleTheme = (tier?: RewardTier | null) => capsuleThemes[tier ?? 'green']

export const getRewardCard = (tier?: RewardTier | null) => getCapsuleTheme(tier).rewardCard
