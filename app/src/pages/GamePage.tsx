import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Hand, Loader2, RotateCw, Smartphone, Sparkles, TicketCheck } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { cutePetAssets, getCapsuleTheme } from '../lib/gameAssets'
import AppHeader from '../components/AppHeader'
import ErrorBanner from '../components/ErrorBanner'
import GameImage from '../components/game/GameImage'
import GachaButton from '../components/game/GachaButton'
import CutePetBackground from '../components/game/CutePetBackground'
import { useGameMachine } from '../hooks/useGameMachine'

export default function GamePage() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const { state, hasPlayed } = useGame()
  const {
    phase,
    charge,
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
  } = useGameMachine()

  const capsuleTheme = getCapsuleTheme(reward?.tier)
  const progressLabel = charge >= 100 ? 'พลังพร้อมหมุน' : `เติมพลัง ${Math.round(charge)}%`
  const meterLabel = phase === 'intro' ? 'กดเริ่มแล้วเติมพลังเครื่อง' : progressLabel

  const machineImage = useMemo(() => {
    if (phase === 'capsuleDropped' || phase === 'opening' || phase === 'completed') {
      return cutePetAssets.machines.empty
    }
    return cutePetAssets.machines.main
  }, [phase])

  const mascotImage = useMemo(() => {
    switch (phase) {
      case 'drawing':
      case 'opening':
        return cutePetAssets.mascots.monkey
      case 'capsuleDropped':
        return cutePetAssets.mascots.bird
      case 'completed':
        return cutePetAssets.mascots.monkey
      default:
        return cutePetAssets.mascots.cat
    }
  }, [phase])

  const stageText = useMemo(() => {
    switch (phase) {
      case 'intro':
        return 'เตรียมหมุนตู้'
      case 'charging':
        return charge >= 100 ? 'พร้อมหมุนรับแคปซูล' : 'แตะเพื่อเติมพลัง'
      case 'drawing':
        return 'ตู้กำลังสุ่มของรางวัล'
      case 'capsuleDropped':
        return 'แคปซูลของคุณออกมาแล้ว'
      case 'opening':
        return 'กำลังเปิดแคปซูล'
      case 'completed':
        return 'เปิดคูปองสำเร็จ'
      case 'error':
        return 'ยังหมุนไม่สำเร็จ'
    }
  }, [charge, phase])

  if (!state.customer) {
    return (
      <div className="min-h-full bg-[#FFE9C4] px-5 pt-6 text-ink-dark">
        <div className="mx-auto max-w-[460px] rounded-[18px] border-2 border-[#E2C076] bg-white p-5 text-center shadow-elevated">
          <Smartphone className="mx-auto text-pharmacy-green" size={42} />
          <h1 className="mt-3 font-display text-2xl font-semibold">ต้องลงทะเบียนก่อนเล่น</h1>
          <p className="mt-2 text-sm leading-6 text-ink-medium">
            ลงทะเบียนด้วย LINE เดียวกันเพื่อออกคูปองและกันสิทธิ์ซ้ำ
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-5 w-full rounded-[14px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
          >
            ลงทะเบียน
          </button>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    if (phase !== 'intro' && phase !== 'completed' && phase !== 'error') {
      const confirmed = window.confirm('ออกจากเกมตอนนี้จะยกเลิกการหมุน ยืนยันออก?')
      if (!confirmed) return
    }
    navigate('/')
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F6EED8] px-4 pb-16 pt-3 text-ink-dark">
      <CutePetBackground
        variant="soft"
        className="absolute inset-0 -z-10 h-full w-full"
        overlayClassName="bg-[radial-gradient(circle_at_50%_10%,rgba(255,211,106,0.28),transparent_34%),linear-gradient(180deg,rgba(255,250,235,0.82),rgba(235,226,197,0.92))]"
      />
      <div className="mx-auto max-w-[430px]">
        <AppHeader showBack onBack={handleBack} />

        {hasPlayed && (
          <div className="mb-3 rounded-[12px] border border-[#E2C076] bg-[#FFF6DC] px-3 py-2 text-xs leading-5 text-[#5A2E0F] shadow-sm">
            เล่นซ้ำได้ไม่จำกัดเพื่อทดลองเกม แต่คูปองจะรับได้เฉพาะครั้งแรก
          </div>
        )}

        <section className="relative mt-1 overflow-hidden rounded-[24px] border-2 border-[#E8BE57] bg-[linear-gradient(180deg,#FFF8DC_0%,#FFF0BD_52%,#FFE7A8_100%)] p-3 shadow-[0_26px_60px_rgba(82,46,12,0.20)]">
          <div className="pointer-events-none absolute inset-x-5 top-0 h-20 rounded-full bg-white/35 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A4014]">
                CUTE PET GACHA
              </p>
              <h2 className="mt-0.5 font-display text-[26px] font-extrabold leading-tight text-[#3A1A05]">
                {stageText}
              </h2>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-[15px] border-2 border-[#E2C076] bg-white text-pharmacy-green shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(82,46,12,0.16)]">
              {phase === 'drawing' ? <Loader2 className="animate-spin" size={24} /> : <RotateCw size={24} />}
            </div>
          </div>
          <div className="relative mt-2 flex items-center justify-center gap-1.5">
            {['intro', 'charging', 'drawing', 'capsuleDropped', 'opening', 'completed'].map((item) => (
              <span
                key={item}
                className={`h-1.5 w-8 rounded-full ${
                  phase === item ? 'bg-gold shadow-[0_0_14px_rgba(212,184,90,0.9)]' : 'bg-[#E2C076]/70'
                }`}
              />
            ))}
          </div>

          <div
            className="game-stage-depth relative mx-auto mt-3 h-[330px] overflow-hidden rounded-[18px] border-2 border-[#DDAE3E] bg-[#AEE6FF]"
            style={{ perspective: 900 }}
          >
            <GameImage
              src={cutePetAssets.backgrounds.stage}
              decorative
              className="absolute inset-0 size-full object-cover"
            />
            <GameImage
              src={cutePetAssets.props.treeBush}
              decorative
              className="absolute -left-4 bottom-8 z-10 h-16 object-contain opacity-90"
            />
            <GameImage
              src={cutePetAssets.props.paintPalette}
              decorative
              className="absolute -right-3 top-7 z-10 h-12 -rotate-12 object-contain opacity-80"
            />
            <GameImage
              src={cutePetAssets.props.fence}
              decorative
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full object-cover opacity-90"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-white/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-8 top-5 z-10 h-36 rounded-full bg-white/35 blur-2xl" />
            <div className="pointer-events-none absolute inset-x-16 bottom-8 z-10 h-8 rounded-full bg-[#3A1A05]/18 blur-xl" />

            {phase === 'drawing' && !shouldReduceMotion && (
              <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
                {[0, 1, 2].map((item) => (
                  <motion.span
                    key={item}
                    className="absolute h-1.5 w-24 rounded-full bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.85)]"
                    style={{ top: `${28 + item * 18}%`, left: '-30%' }}
                    animate={{ x: ['0%', '170vw'], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.72,
                      repeat: shouldReduceMotion ? 0 : Infinity,
                      delay: item * 0.16,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}

            {phase === 'completed' && (
              <GameImage
                src={cutePetAssets.props.confetti}
                decorative
                className="pointer-events-none absolute inset-0 z-40 size-full object-cover opacity-70"
              />
            )}

            <AnimatePresence>
              {(phase === 'opening' || phase === 'completed' || phase === 'capsuleDropped') && (
                <motion.div
                  key="prize-glow"
                  className="pointer-events-none absolute inset-x-0 top-10 z-20 mx-auto flex justify-center"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.95, scale: [1, 1.08, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                >
                  <GameImage
                    src={cutePetAssets.rewards.glow}
                    decorative
                    className="h-72 object-contain mix-blend-screen"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="absolute inset-x-0 top-0 z-20 mx-auto h-[300px] w-[270px]"
              style={{ transformStyle: 'preserve-3d' }}
              animate={
                phase === 'drawing'
                  ? {
                      rotateY: [0, -10, 10, -8, 8, 0],
                      rotateZ: [0, -2, 2, -1.5, 1.5, 0],
                      y: [0, -5, 0],
                      scale: [1, 1.04, 1],
                    }
                  : phase === 'charging' && charge > 30
                    ? { rotateX: [-3, 3, -3], rotateY: [-4, 4, -4], y: [0, -4, 0] }
                    : phase === 'intro'
                      ? { y: [0, -6, 0] }
                      : { rotateX: -2, rotateY: 0, rotateZ: 0, y: 0, scale: 1 }
              }
              transition={{
                duration: phase === 'drawing' ? 0.62 : 2.4,
                repeat:
                  !shouldReduceMotion && (phase === 'drawing' || phase === 'charging' || phase === 'intro')
                    ? Infinity
                    : 0,
                ease: 'easeInOut',
              }}
            >
              <motion.img
                key={machineImage}
                src={machineImage}
                alt="ตู้กาชาปองสัตว์เลี้ยง"
                className="relative z-10 mx-auto h-[300px] w-auto object-contain drop-shadow-[0_22px_28px_rgba(82,46,12,0.32)]"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                draggable={false}
              />
              <div className="pointer-events-none absolute left-16 top-12 z-20 h-44 w-8 -rotate-12 rounded-full bg-white/40 blur-sm" />
            </motion.div>

            <motion.img
              key={mascotImage}
              src={mascotImage}
              alt="มาสคอตสัตว์เลี้ยง"
              className="absolute bottom-12 right-2 z-30 h-16 object-contain drop-shadow-[0_10px_14px_rgba(82,46,12,0.3)]"
              initial={{ opacity: 0, y: 14, scale: 0.85 }}
              animate={
                phase === 'completed'
                  ? { opacity: 1, y: [0, -8, 0], scale: [1, 1.05, 1], rotate: [-5, 5, -5] }
                  : phase === 'drawing'
                    ? { opacity: 1, y: [0, -3, 0], rotate: [-3, 3, -3], scale: 1 }
                    : { opacity: 1, y: [0, -4, 0], scale: 1, rotate: [-2, 2, -2] }
              }
              transition={{
                duration: phase === 'drawing' ? 0.45 : 2.4,
                repeat: shouldReduceMotion ? 0 : Infinity,
                repeatType: 'reverse',
              }}
              draggable={false}
            />

            <AnimatePresence>
              {phase === 'intro' && (
                <motion.img
                  key="idle-cluster"
                  src={cutePetAssets.capsules.cluster}
                  alt="แคปซูลสัตว์เลี้ยงในตู้"
                  className="absolute inset-x-0 bottom-12 z-20 mx-auto h-24 object-contain drop-shadow-[0_16px_18px_rgba(82,46,12,0.25)]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: [0, -7, 0], rotate: [-1, 1, -1] }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 1.8, repeat: shouldReduceMotion ? 0 : Infinity, repeatType: 'reverse' }}
                  draggable={false}
                />
              )}

              {phase === 'capsuleDropped' && reward && (
                <motion.button
                  key="capsule"
                  onClick={openCapsule}
                  aria-label="เปิดแคปซูล"
                  className="absolute inset-x-0 bottom-8 z-30 mx-auto flex w-44 flex-col items-center"
                  initial={{ y: -240, opacity: 0, scale: 0.45, rotate: -28 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: [0, -12, 9, 0] }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 170, damping: 11 }}
                >
                  <motion.img
                    src={capsuleTheme.image}
                    alt={capsuleTheme.label}
                    className="h-36 object-contain drop-shadow-[0_20px_22px_rgba(82,46,12,0.3)]"
                    animate={{ y: [0, -7, 0], rotate: [-5, 5, -5], scale: [1, 1.04, 1] }}
                    transition={{ duration: 1.25, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                    draggable={false}
                  />
                  <span
                    className="mt-1 rounded-full border-2 border-white bg-white px-4 py-1.5 text-xs font-extrabold shadow-[0_8px_18px_rgba(82,46,12,0.18)]"
                    style={{ color: capsuleTheme.text }}
                  >
                    แตะเพื่อเปิด
                  </span>
                </motion.button>
              )}

              {(phase === 'opening' || phase === 'completed') && (
                <motion.div
                  key="open"
                  className="absolute inset-x-0 bottom-2 z-30 mx-auto flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: [0.92, 1.05, 1] }}
                  exit={{ opacity: 0 }}
                >
                  <GameImage
                    src={cutePetAssets.rewards.popup}
                    alt="คูปองรางวัล"
                    className="relative h-48 object-contain drop-shadow-[0_24px_28px_rgba(82,46,12,0.32)]"
                  />
                  {phase === 'completed' && reward && (
                    <div className="absolute inset-x-10 top-14 rounded-[18px] bg-white/92 px-3 py-2 text-center shadow-[0_12px_24px_rgba(82,46,12,0.18)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pharmacy-green">
                        คุณได้คูปอง
                      </p>
                      <p className="mt-0.5 line-clamp-2 font-display text-lg font-extrabold leading-tight text-[#3A1A05]">
                        {reward.name}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {phase === 'charging' && (
            <div
              className="mt-3 flex items-center justify-between gap-2 rounded-full border-2 border-[#E2C076] bg-white/85 px-4 py-2 text-xs font-semibold text-[#5A2E0F] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_rgba(82,46,12,0.12)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(charge)}
              aria-label="พลังหมุนตู้"
            >
              <span className="uppercase tracking-[0.18em] text-[#7A4014]/80">Energy</span>
              <span className="font-mono text-sm text-pharmacy-green">{meterLabel}</span>
            </div>
          )}

          {phase === 'intro' && (
            <div className="mt-4 flex justify-center">
              <GachaButton
                onClick={startGame}
                label="เริ่มหมุนตู้"
                iconLeading={<Sparkles size={20} />}
                size="lg"
                className="max-w-[300px] animate-pulse-glow"
              />
            </div>
          )}

          {phase === 'charging' && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <div className="relative grid size-36 place-items-center">
                <svg
                  className="absolute inset-0 size-full -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="chargeRing" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3A9C6F" />
                      <stop offset="55%" stopColor="#7FCB9A" />
                      <stop offset="100%" stopColor="#D4B85A" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#E2C076"
                    strokeWidth="6"
                    opacity="0.35"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#chargeRing)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="276.46"
                    animate={{ strokeDashoffset: 276.46 - (charge / 100) * 276.46 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </svg>

                {!canSpin && (
                  <motion.span
                    className="pointer-events-none absolute inset-2 rounded-full"
                    style={{
                      boxShadow:
                        '0 0 0 0 rgba(212,184,90,0.55), 0 0 28px 6px rgba(212,184,90,0.35)',
                    }}
                    animate={{ opacity: [0.35, 0.85, 0.35] }}
                    transition={{ duration: 1.4, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                )}
                <motion.span
                  className="pointer-events-none absolute -inset-3 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(212,184,90,0.45), transparent 65%)',
                  }}
                  animate={
                    canSpin
                      ? { scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }
                      : { scale: 1, opacity: 0 }
                  }
                  transition={{ duration: 1.0, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onPointerDown={canSpin ? undefined : startPressCharge}
                  onPointerUp={stopPressCharge}
                  onPointerCancel={stopPressCharge}
                  onPointerLeave={stopPressCharge}
                  onClick={() => {
                    if (canSpin) {
                      void spinMachine()
                    } else {
                      addCharge(9)
                    }
                  }}
                  aria-label={canSpin ? 'หมุนรับแคปซูล' : 'แตะ กดค้าง เพื่อเติมพลัง'}
                  className={`relative grid size-28 select-none place-items-center rounded-full border-[3px] text-center transition-all duration-200 active:scale-95 ${
                    canSpin
                      ? 'border-[#D4B85A] bg-[linear-gradient(180deg,#FFE08A_0%,#E8B445_55%,#C28A1F_100%)] text-[#3A1A05] shadow-[0_18px_38px_rgba(196,140,30,0.55),inset_0_2px_0_rgba(255,255,255,0.55)]'
                      : 'border-[#E2C076] bg-[linear-gradient(180deg,#FFFDF2,#FFEFC8)] text-[#5A2E0F] shadow-[0_16px_32px_rgba(82,46,12,0.22),inset_0_2px_0_rgba(255,255,255,0.9)]'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span
                    className="pointer-events-none absolute inset-1 rounded-full bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.65),transparent_55%)]"
                    aria-hidden="true"
                  />
                  {canSpin ? (
                    <RotateCw size={38} strokeWidth={2.4} className="relative" />
                  ) : (
                    <Hand size={42} strokeWidth={2.2} className="relative" />
                  )}
                  <span className="relative mt-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                    {canSpin ? 'หมุน!' : 'กดค้าง'}
                  </span>
                </button>
              </div>

              <p className="text-center text-sm font-semibold leading-5 text-[#5A2E0F]">
                {canSpin
                  ? 'พลังเต็มแล้ว แตะปุ่มเพื่อหมุนตู้!'
                  : 'นิ้วจิ้มค้างที่ปุ่มเพื่อเติมพลัง หรือเขย่ามือถือ'}
              </p>
            </div>
          )}

          {phase === 'drawing' && (
            <div className="mt-4 rounded-[16px] border-2 border-[#E2C076] bg-white/85 px-4 py-3 text-center text-sm font-semibold text-[#5A2E0F] shadow-sm">
              {isReplayRound
                ? 'ตู้กำลังหมุนในรอบทดลอง และจะไม่ออกคูปองใหม่...'
                : 'ตู้กำลังหมุนและล็อกสิทธิ์กับระบบจริง...'}
            </div>
          )}

          {phase === 'capsuleDropped' && reward && (
            <div
              className="mt-4 rounded-[16px] border-2 border-[#E2C076] bg-white px-4 py-3 text-center text-sm font-extrabold shadow-sm"
              style={{ color: capsuleTheme.text }}
            >
              ได้ {capsuleTheme.label} แล้ว แตะที่แคปซูลเพื่อเปิดคูปอง
            </div>
          )}

          {phase === 'completed' && reward && (
            <div className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-white/92 p-4 text-center shadow-[0_16px_32px_rgba(82,46,12,0.14)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-pharmacy-green">
                {isReplayRound ? 'คูปองเดิมของคุณ' : 'รางวัลของคุณ'}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#3A1A05]">
                {reward.name}
              </h3>
              <p className="mt-1 font-mono text-sm font-semibold text-ink-medium">{reward.code}</p>
              {isReplayRound && (
                <p className="mt-2 text-xs leading-5 text-ink-light">
                  เล่นซ้ำเพื่อความสนุกได้ ส่วนคูปองยังเป็นสิทธิ์เดิมใน Wallet
                </p>
              )}
              <div className="mt-4 grid gap-2">
                <GachaButton
                  onClick={() => navigate('/reward')}
                  label={isReplayRound ? 'ดูคูปองของฉัน' : 'ดูคูปองและปลดล็อก LINE'}
                  iconLeading={<TicketCheck size={18} />}
                  size="lg"
                />
                <button
                  onClick={playAgain}
                  className="rounded-[14px] border-2 border-pharmacy-green bg-white px-4 py-3 text-sm font-semibold text-pharmacy-green shadow-sm"
                >
                  เล่นทดลองอีกครั้ง
                </button>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="mt-5 space-y-3">
              <ErrorBanner message={state.error ?? 'ไม่สามารถหมุนตู้ได้'} />
              <button
                onClick={retrySpin}
                className="w-full rounded-[14px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
              >
                ลองหมุนอีกครั้ง
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
