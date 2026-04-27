import { useCallback, useEffect, useState } from 'react'

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false
  const doc = document as FullscreenDoc
  const el = document.documentElement as FullscreenElement
  return Boolean(el.requestFullscreen ?? el.webkitRequestFullscreen) && Boolean(doc.exitFullscreen ?? doc.webkitExitFullscreen)
}

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null
  const doc = document as FullscreenDoc
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => Boolean(getFullscreenElement()))
  const [supported] = useState<boolean>(() => isFullscreenSupported())

  useEffect(() => {
    if (!supported) return
    const handler = () => setIsFullscreen(Boolean(getFullscreenElement()))
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler as EventListener)
    }
  }, [supported])

  const enter = useCallback(async () => {
    if (!supported) return false
    try {
      const el = document.documentElement as FullscreenElement
      const req = el.requestFullscreen ?? el.webkitRequestFullscreen
      if (req) {
        await req.call(el)
        return true
      }
    } catch {
      /* user might have denied; fail silently — CSS phone frame still gives full feel */
    }
    return false
  }, [supported])

  const exit = useCallback(async () => {
    if (!supported) return false
    try {
      const doc = document as FullscreenDoc
      const fn = doc.exitFullscreen ?? doc.webkitExitFullscreen
      if (fn && getFullscreenElement()) {
        await fn.call(doc)
        return true
      }
    } catch {
      /* ignore */
    }
    return false
  }, [supported])

  const toggle = useCallback(async () => {
    if (getFullscreenElement()) {
      return exit()
    }
    return enter()
  }, [enter, exit])

  return { isFullscreen, supported, enter, exit, toggle }
}
