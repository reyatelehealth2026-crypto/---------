import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { Reward } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { capsuleThemes, gameAssets, getCapsuleTheme } from '../lib/gameAssets'

export type GamePhase =
  | 'intro'
  | 'charging'
  | 'drawing'
  | 'capsuleDropped'
  | 'opening'
  | 'completed'
  | 'error'

type MotionPermissionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const preloadImage = (src: string) => {
  const image = new Image()
  image.src = src
}

export interface GameMachine {
  phase: GamePhase
  charge: number
  drawnReward: Reward | null
  reward: Reward | null
  isReplayRound: boolean
  canSpin: boolean
  startGame: () => void
  startPressCharge: () => void
  stopPressCharge: () => void
  addCharge: (amount?: number) => void
  spinMachine: () => Promise<void>
  openCapsule: () => void
  retrySpin: () => void
  playAgain: () => void
}

export function useGameMachine(): GameMachine {
  const { state, existingMainReward, drawMainReward, clearError } = useGame()
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [charge, setCharge] = useState(0)
  const [drawnReward, setDrawnReward] = useState<Reward | null>(null)
  const [isDrawLocked, setIsDrawLocked] = useState(false)
  const [isReplayRound, setIsReplayRound] = useState(false)
  const drawLock = useRef(false)
  const pressInterval = useRef<number | null>(null)
  const timers = useRef<number[]>([])

  const reward =
    drawnReward ??
    state.rewards.find((item) => item.id === state.lastRewardId) ??
    existingMainReward

  const canSpin = phase === 'charging' && charge >= 100 && !state.isSubmitting && !isDrawLocked

  const addCharge = useCallback((amount = 9) => {
    setCharge((value) => Math.min(100, value + amount))
    navigator.vibrate?.(24)
  }, [])

  const stopPressCharge = useCallback(() => {
    if (pressInterval.current) {
      window.clearInterval(pressInterval.current)
      pressInterval.current = null
    }
  }, [])

  const startPressCharge = useCallback(() => {
    if (phase !== 'charging') return
    addCharge(11)
    stopPressCharge()
    pressInterval.current = window.setInterval(() => addCharge(4), 120)
  }, [addCharge, phase, stopPressCharge])

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay)
    timers.current.push(id)
  }, [])

  useEffect(() => {
    preloadImage(gameAssets.machine)
    preloadImage(gameAssets.idleCapsules)
    preloadImage(gameAssets.backgrounds.pharmacyShop)
    Object.values(gameAssets.mascot).forEach(preloadImage)
  }, [])

  useEffect(() => {
    if (phase === 'charging' && charge > 65) {
      Object.values(capsuleThemes).forEach((theme) => preloadImage(theme.image))
      preloadImage(gameAssets.openCapsule)
      preloadImage(gameAssets.rewardTicket)
    }
  }, [charge, phase])

  useEffect(() => {
    if (phase !== 'charging') return undefined

    let lastShakeAt = 0
    const onDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return
      const force =
        Math.abs(acceleration.x ?? 0) +
        Math.abs(acceleration.y ?? 0) +
        Math.abs(acceleration.z ?? 0)
      const now = Date.now()
      if (force > 24 && now - lastShakeAt > 280) {
        lastShakeAt = now
        addCharge(10)
      }
    }

    window.addEventListener('devicemotion', onDeviceMotion)
    return () => window.removeEventListener('devicemotion', onDeviceMotion)
  }, [addCharge, phase])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      stopPressCharge()
      activeTimers.forEach((id) => window.clearTimeout(id))
    }
  }, [stopPressCharge])

  const startGame = useCallback(() => {
    const motionEvent = window.DeviceMotionEvent as MotionPermissionEvent | undefined
    void motionEvent?.requestPermission?.().catch(() => undefined)
    setDrawnReward(existingMainReward)
    setIsReplayRound(Boolean(existingMainReward))
    setCharge(12)
    clearError()
    setPhase('charging')
  }, [clearError, existingMainReward])

  const spinMachine = useCallback(async () => {
    if (!canSpin || drawLock.current) return
    drawLock.current = true
    setIsDrawLocked(true)
    clearError()
    setPhase('drawing')
    navigator.vibrate?.([40, 30, 70])

    try {
      if (isReplayRound && existingMainReward) {
        setDrawnReward(existingMainReward)
        preloadImage(getCapsuleTheme(existingMainReward.tier).image)
        schedule(() => setPhase('capsuleDropped'), 650)
        return
      }

      const nextReward = await drawMainReward()
      setDrawnReward(nextReward)
      preloadImage(getCapsuleTheme(nextReward.tier).image)
      schedule(() => setPhase('capsuleDropped'), 850)
    } catch {
      drawLock.current = false
      setIsDrawLocked(false)
      setPhase('error')
    }
  }, [canSpin, clearError, drawMainReward, existingMainReward, isReplayRound, schedule])

  const openCapsule = useCallback(() => {
    if (!reward || phase !== 'capsuleDropped') return
    setPhase('opening')
    navigator.vibrate?.([30, 20, 30])
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    schedule(() => {
      setPhase('completed')
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.68 } })
    }, 900)
  }, [phase, reward, schedule])

  const retrySpin = useCallback(() => {
    drawLock.current = false
    setIsDrawLocked(false)
    clearError()
    setPhase('charging')
    setCharge(100)
  }, [clearError])

  const playAgain = useCallback(() => {
    const replayReward = existingMainReward ?? drawnReward
    drawLock.current = false
    setIsDrawLocked(false)
    setIsReplayRound(Boolean(replayReward))
    setDrawnReward(replayReward)
    clearError()
    setCharge(0)
    setPhase('intro')
  }, [clearError, drawnReward, existingMainReward])

  return {
    phase,
    charge,
    drawnReward,
    reward,
    isReplayRound,
    canSpin,
    startGame,
    startPressCharge,
    stopPressCharge,
    addCharge,
    spinMachine,
    openCapsule,
    retrySpin,
    playAgain,
  }
}
