import { motion } from 'framer-motion'
import { gameAssets } from '../../lib/gameAssets'
import GameImage from './GameImage'

interface EggLoaderProps {
  label?: string
  className?: string
  size?: number
}

export default function EggLoader({ label = 'กำลังโหลด...', className = '', size = 96 }: EggLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <motion.div
        animate={{ rotate: [-6, 6, -6], y: [0, -6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: size, height: size }}
      >
        <GameImage
          src={gameAssets.loadingEgg}
          decorative
          className="size-full object-contain drop-shadow-[0_12px_18px_rgba(82,46,12,0.3)]"
        />
      </motion.div>
      <p className="font-display text-sm font-semibold text-pharmacy-green">{label}</p>
    </div>
  )
}
