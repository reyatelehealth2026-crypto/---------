import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  onClick?: () => void
  label?: string
  className?: string
  tone?: 'primary' | 'muted'
}

export default function BackButton({
  onClick,
  label = 'กลับ',
  className = '',
  tone = 'primary',
}: BackButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (window.history.length > 1) window.history.back()
  }

  const toneClass = tone === 'muted' ? 'text-white/80' : 'text-pharmacy-green'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm font-semibold transition active:scale-[0.98] ${toneClass} ${className}`}
    >
      <ChevronLeft size={18} />
      {label}
    </button>
  )
}
