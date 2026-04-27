import type { ReactNode } from 'react'
import { gameAssets } from '../../lib/gameAssets'
import GameImage from './GameImage'

interface RewardFrameProps {
  rarity?: 'common' | 'rare'
  children: ReactNode
  className?: string
  contentClassName?: string
}

export default function RewardFrame({
  rarity = 'common',
  children,
  className = '',
  contentClassName = '',
}: RewardFrameProps) {
  const src = rarity === 'rare' ? gameAssets.rewards.cardRare : gameAssets.rewards.cardCommon
  return (
    <div className={`relative inline-flex w-full justify-center ${className}`}>
      <GameImage
        src={src}
        decorative
        className="pointer-events-none w-full select-none object-contain drop-shadow-[0_18px_28px_rgba(82,46,12,0.32)]"
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-[14%] py-[16%] text-center ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  )
}
