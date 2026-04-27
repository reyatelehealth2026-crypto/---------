import { Maximize2, Minimize2 } from 'lucide-react'
import { useFullscreen } from '../hooks/useFullscreen'

export default function FullscreenToggle() {
  const { isFullscreen, supported, toggle } = useFullscreen()

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={() => {
        void toggle()
      }}
      aria-label={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เข้าโหมดเต็มจอ'}
      className="fixed right-3 top-3 z-50 grid size-9 place-items-center rounded-full border border-white/40 bg-white/70 text-pharmacy-green shadow-md backdrop-blur transition active:scale-90 hover:bg-white/85"
      style={{
        top: 'max(env(safe-area-inset-top, 0px), 12px)',
        right: 'max(env(safe-area-inset-right, 0px), 12px)',
      }}
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  )
}
