import type { ReactNode } from 'react'
import { gameAssets } from '../../lib/gameAssets'
import GameImage from './GameImage'

type Variant = 'stage' | 'hills' | 'shop' | 'school' | 'soft'

interface CutePetBackgroundProps {
  variant?: Variant
  children?: ReactNode
  className?: string
  imageClassName?: string
  overlayClassName?: string
  showFence?: boolean
  showTrees?: boolean
}

const variantSrc: Record<Variant, string | null> = {
  stage: gameAssets.backgrounds.stage,
  hills: gameAssets.backgrounds.hills,
  shop: gameAssets.buildings.shop,
  school: gameAssets.buildings.school,
  soft: null,
}

export default function CutePetBackground({
  variant = 'stage',
  children,
  className = '',
  imageClassName = '',
  overlayClassName = '',
  showFence = false,
  showTrees = false,
}: CutePetBackgroundProps) {
  const src = variantSrc[variant]
  // Only apply default `relative` when consumer hasn't provided a position class.
  // Tailwind defines `relative` after `fixed`/`absolute`/`sticky` in CSS source,
  // so a default `relative` would override consumer-provided positioning.
  const hasPositionClass = /\b(fixed|absolute|sticky|relative)\b/.test(className)
  const positionClass = hasPositionClass ? '' : 'relative'

  return (
    <div className={`${positionClass} isolate overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#FBF6E6_0%,#F1EAD0_45%,#D9E4BD_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-white/30" />
      {src && (
        <GameImage
          src={src}
          decorative
          className={`pointer-events-none absolute inset-0 size-full object-cover ${imageClassName}`}
        />
      )}
      {showTrees && (
        <GameImage
          src={gameAssets.props.treeBush}
          decorative
          className="pointer-events-none absolute -bottom-2 -left-3 z-10 h-24 object-contain opacity-95"
        />
      )}
      {showFence && (
        <GameImage
          src={gameAssets.props.fence}
          decorative
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 w-full object-cover"
        />
      )}
      {overlayClassName && <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
