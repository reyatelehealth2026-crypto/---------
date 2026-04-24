import { AlertCircle, X } from 'lucide-react'

interface ErrorBannerProps {
  message: string | null | undefined
  onDismiss?: () => void
  tone?: 'alert' | 'soft'
  className?: string
}

export default function ErrorBanner({
  message,
  onDismiss,
  tone = 'alert',
  className = '',
}: ErrorBannerProps) {
  if (!message) return null

  const toneClass =
    tone === 'alert'
      ? 'border-alert-coral/30 bg-alert-coral/10 text-alert-coral'
      : 'border-pharmacy-green/20 bg-sky-wash text-ink-medium'

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm leading-6 ${toneClass} ${className}`}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดข้อความ"
          className="grid size-6 shrink-0 place-items-center rounded-full bg-black/5 transition active:scale-90"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
