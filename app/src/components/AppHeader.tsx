import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { useGame } from '../context/GameContext'
import BackButton from './BackButton'

const cnyLogoUrl = 'https://manager.cnypharmacy.com/assets/img/cny-logo.png'

interface AppHeaderProps {
  showBack?: boolean
  onBack?: () => void
  backLabel?: string
  rightSlot?: ReactNode
  showWallet?: boolean
  className?: string
}

export default function AppHeader({
  showBack = false,
  onBack,
  backLabel,
  rightSlot,
  showWallet,
  className = '',
}: AppHeaderProps) {
  const navigate = useNavigate()
  const { hasPlayed } = useGame()
  const walletVisible = showWallet ?? hasPlayed

  return (
    <header
      className={`sticky top-0 z-30 -mx-5 mb-3 bg-parchment/85 px-5 pb-2 pt-3 backdrop-blur ${className}`}
    >
      <div className="mx-auto flex max-w-[460px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <BackButton onClick={onBack} label={backLabel} />
          ) : (
            <img
              src={cnyLogoUrl}
              alt="CNY HEALTHCARE"
              className="h-8 w-[110px] shrink-0 object-contain"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightSlot}
          {walletVisible && (
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              aria-label="เปิด Wallet"
              className="grid size-9 place-items-center rounded-full border border-pharmacy-green/20 bg-white/85 text-pharmacy-green shadow-sm transition active:scale-[0.95]"
            >
              <Ticket size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
