import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { Reward } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { capsuleThemes, gameAssets, getCapsuleTheme } from '../lib/gameAssets'
import { playGameSound, unlockGameAudio } from '../lib/gameAudio'

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

const shouldReduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const celebrate = (options: confetti.Options) => {
  if (shouldReduceMotion()) return
  confetti(options)
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
  const readySoundPlayed = useRef(false)

  const reward =
    drawnReward ??
    state.rewards.find((item) => item.id === state.lastRewardId) ??
    existingMainReward

  const canSpin = phase === 'charging' && charge >= 100 && !state.isSubmitting && !isDrawLocked

  const addCharge = useCallback((amount = 9) => {
    setCharge((value) => {
      const nextValue = Math.min(100, value + amount)
      if (nextValue > value && nextValue < 100) {
        playGameSound('charge')
      }
      return nextValue
    })
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
    preloadImage(gameAssets.machineEmpty)
    preloadImage(gameAssets.idleCapsules)
    preloadImage(gameAssets.backgrounds.stage)
    preloadImage(gameAssets.backgrounds.hills)
    preloadImage(gameAssets.ui.woodFrame)
    preloadImage(gameAssets.props.fence)
    preloadImage(gameAssets.props.treeBush)
    preloadImage(gameAssets.props.paintPalette)
    preloadImage(gameAssets.loadingEgg)
    Object.values(gameAssets.mascot).forEach(preloadImage)
  }, [])

  useEffect(() => {
    if (phase === 'charging' && charge > 65) {
      Object.values(capsuleThemes).forEach((theme) => preloadImage(theme.image))
      preloadImage(gameAssets.openCapsule)
      preloadImage(gameAssets.rewardTicket)
      preloadImage(gameAssets.prizeGlow)
      preloadImage(gameAssets.rewards.cardCommon)
      preloadImage(gameAssets.rewards.cardRare)
      preloadImage(gameAssets.rewards.giftBox)
      preloadImage(gameAssets.confetti)
    }
  }, [charge, phase])

  useEffect(() => {
    if (phase !== 'charging' || charge < 100) {
      readySoundPlayed.current = false
      return
    }
    if (readySoundPlayed.current) return
    readySoundPlayed.current = true
    playGameSound('ready')
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
    unlockGameAudio()
    playGameSound('gameStart')
    const motionEvent = window.DeviceMotionEvent as MotionPermissionEvent | undefined
    void motionEvent?.requestPermission?.().catch(() => undefined)
    setDrawnReward(existingMainReward)
    setIsReplayRound(Boolean(existingMainReward))
    setCharge(12)
    readySoundPlayed.current = false
    clearError()
    setPhase('charging')
  }, [clearError, existingMainReward])

  const spinMachine = useCallback(async () => {
    if (!canSpin || drawLock.current) return
    drawLock.current = true
    setIsDrawLocked(true)
    clearError()
    playGameSound('spin')
    setPhase('drawing')
    navigator.vibrate?.([40, 30, 70])

    try {
      if (isReplayRound && existingMainReward) {
        setDrawnReward(existingMainReward)
        preloadImage(getCapsuleTheme(existingMainReward.tier).image)
        schedule(() => {
          setPhase('capsuleDropped')
          playGameSound('drop')
        }, 650)
        return
      }

      const nextReward = await drawMainReward()
      setDrawnReward(nextReward)
      preloadImage(getCapsuleTheme(nextReward.tier).image)
      schedule(() => {
        setPhase('capsuleDropped')
        playGameSound('drop')
      }, 850)
    } catch {
      drawLock.current = false
      setIsDrawLocked(false)
      setPhase('error')
      playGameSound('error')
    }
  }, [canSpin, clearError, drawMainReward, existingMainReward, isReplayRound, schedule])

  const openCapsule = useCallback(() => {
    if (!reward || phase !== 'capsuleDropped') return
    playGameSound('open')
    setPhase('opening')
    navigator.vibrate?.([30, 20, 30])
    celebrate({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    schedule(() => {
      setPhase('completed')
      playGameSound('reward')
      celebrate({ particleCount: 90, spread: 70, origin: { y: 0.68 } })
    }, 900)
  }, [phase, reward, schedule])

  const retrySpin = useCallback(() => {
    drawLock.current = false
    setIsDrawLocked(false)
    clearError()
    readySoundPlayed.current = true
    playGameSound('ready')
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
    readySoundPlayed.current = false
    playGameSound('uiTap')
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
