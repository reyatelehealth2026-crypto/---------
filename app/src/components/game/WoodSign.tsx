import type { ReactNode } from 'react'
import { gameAssets } from '../../lib/gameAssets'
import GameImage from './GameImage'

interface WoodSignProps {
  variant?: 'logo' | 'plank'
  children: ReactNode
  className?: string
  contentClassName?: string
  align?: 'center' | 'start' | 'end'
}

export default function WoodSign({
  variant = 'logo',
  children,
  className = '',
  contentClassName = '',
  align = 'center',
}: WoodSignProps) {
  const src = variant === 'logo' ? gameAssets.ui.logoSign : gameAssets.ui.subtitlePlank
  const alignClass =
    align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'

  return (
    <div className={`relative inline-flex w-full justify-center ${className}`}>
      <GameImage src={src} decorative className="pointer-events-none w-full select-none object-contain" />
      <div
        className={`absolute inset-0 flex justify-center px-[14%] py-[8%] text-center ${alignClass} ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  )
}
