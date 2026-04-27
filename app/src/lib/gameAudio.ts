type GameSound =
  | 'uiTap'
  | 'gameStart'
  | 'charge'
  | 'ready'
  | 'spin'
  | 'drop'
  | 'open'
  | 'reward'
  | 'error'

type BrowserWithAudio = Window & {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null
let lastChargeSoundAt = 0

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (audioContext) return audioContext

  const AudioCtor = window.AudioContext ?? (window as BrowserWithAudio).webkitAudioContext
  if (!AudioCtor) return null

  audioContext = new AudioCtor()
  return audioContext
}

export const unlockGameAudio = () => {
  const context = getAudioContext()
  if (!context || context.state !== 'suspended') return
  void context.resume().catch(() => undefined)
}

const tone = (
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.03)
}

const sweep = (
  context: AudioContext,
  from: number,
  to: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'triangle',
) => {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, startAt)
  oscillator.frequency.exponentialRampToValueAtTime(to, startAt + duration)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.03)
}

export const playGameSound = (sound: GameSound) => {
  const context = getAudioContext()
  if (!context) return
  if (context.state === 'suspended') {
    void context.resume().catch(() => undefined)
  }

  const now = context.currentTime
  const timestamp = Date.now()

  if (sound === 'charge') {
    if (timestamp - lastChargeSoundAt < 90) return
    lastChargeSoundAt = timestamp
  }

  switch (sound) {
    case 'uiTap':
      tone(context, 520, now, 0.07, 0.045, 'triangle')
      break
    case 'gameStart':
      tone(context, 520, now, 0.08, 0.045, 'triangle')
      tone(context, 780, now + 0.06, 0.11, 0.04, 'sine')
      break
    case 'charge':
      tone(context, 420, now, 0.045, 0.026, 'square')
      break
    case 'ready':
      tone(context, 560, now, 0.08, 0.05, 'triangle')
      tone(context, 760, now + 0.07, 0.08, 0.05, 'triangle')
      tone(context, 980, now + 0.14, 0.12, 0.045, 'sine')
      break
    case 'spin':
      sweep(context, 180, 520, now, 0.36, 0.055, 'sawtooth')
      tone(context, 92, now, 0.18, 0.03, 'square')
      break
    case 'drop':
      sweep(context, 740, 180, now, 0.18, 0.05, 'triangle')
      tone(context, 220, now + 0.14, 0.11, 0.055, 'sine')
      break
    case 'open':
      tone(context, 660, now, 0.08, 0.05, 'triangle')
      tone(context, 990, now + 0.05, 0.14, 0.045, 'sine')
      break
    case 'reward':
      tone(context, 523.25, now, 0.12, 0.05, 'triangle')
      tone(context, 659.25, now + 0.09, 0.12, 0.05, 'triangle')
      tone(context, 783.99, now + 0.18, 0.18, 0.055, 'sine')
      tone(context, 1046.5, now + 0.31, 0.24, 0.045, 'sine')
      break
    case 'error':
      sweep(context, 220, 120, now, 0.18, 0.045, 'sawtooth')
      break
  }
}
