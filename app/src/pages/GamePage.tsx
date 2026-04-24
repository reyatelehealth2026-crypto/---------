import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand, Loader2, RotateCw, Smartphone, Sparkles, TicketCheck } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { gameAssets, getCapsuleTheme } from '../lib/gameAssets'
import AppHeader from '../components/AppHeader'
import ErrorBanner from '../components/ErrorBanner'
import { useGameMachine } from '../hooks/useGameMachine'

export default function GamePage() {
  const navigate = useNavigate()
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

  const mascotImage = useMemo(() => {
    switch (phase) {
      case 'drawing':
      case 'opening':
        return gameAssets.mascot.surprised
      case 'capsuleDropped':
        return gameAssets.mascot.happy
      case 'completed':
        return gameAssets.mascot.celebrate
      default:
        return gameAssets.mascot.idle
    }
  }, [phase])

  const stageText = useMemo(() => {
    switch (phase) {
      case 'intro':
        return 'เตรียมหมุนตู้'
      case 'charging':
        return charge >= 100 ? 'พร้อมหมุนรับแคปซูล' : 'แตะเพื่อเติมพลัง'
      case 'drawing':
        return 'ตู้กำลังสุ่มคูปอง'
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
      <div className="min-h-[100dvh] bg-parchment px-5 pt-6 text-ink-dark">
        <div className="mx-auto max-w-[460px] rounded-[8px] bg-white p-5 text-center shadow-sm">
          <Smartphone className="mx-auto text-pharmacy-green" size={42} />
          <h1 className="mt-3 font-display text-2xl font-semibold">ต้องลงทะเบียนก่อนเล่น</h1>
          <p className="mt-2 text-sm leading-6 text-ink-medium">ลงทะเบียนด้วย LINE เดียวกันเพื่อออกคูปองและกันสิทธิ์ซ้ำ</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-5 w-full rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
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
    <div className="min-h-[100dvh] overflow-hidden bg-parchment px-5 pb-24 pt-4 text-ink-dark">
      <div className="mx-auto max-w-[460px]">
        <AppHeader showBack onBack={handleBack} />

        {hasPlayed && (
          <div className="mb-3 rounded-[8px] bg-gold/15 px-3 py-2 text-xs leading-5 text-ink-medium">
            เล่นซ้ำได้ไม่จำกัดเพื่อทดลองเกม แต่คูปองจะรับได้เฉพาะครั้งแรก
          </div>
        )}

        <section className="relative mt-1 overflow-hidden rounded-[8px] border border-white/80 bg-[radial-gradient(circle_at_50%_0%,#FFF8DF_0%,#FFFDF7_34%,#E8F6F3_100%)] p-4 shadow-[0_28px_70px_rgba(22,74,56,0.20)]">
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-light">CNY GASHAPON</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">{stageText}</h2>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-[8px] border border-white bg-sky-wash text-pharmacy-green shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(46,125,90,0.18)]">
              {phase === 'drawing' ? <Loader2 className="animate-spin" size={24} /> : <RotateCw size={24} />}
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-center gap-1.5">
            {['intro', 'charging', 'drawing', 'capsuleDropped', 'opening', 'completed'].map((item) => (
              <span
                key={item}
                className={`h-1.5 w-8 rounded-full ${
                  phase === item ? 'bg-gold shadow-[0_0_14px_rgba(212,184,90,0.9)]' : 'bg-paper-line/70'
                }`}
              />
            ))}
          </div>

          <div
            className="relative mx-auto mt-4 h-[360px] overflow-hidden rounded-[8px] border border-white/80 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.98)_0%,rgba(232,246,243,0.94)_42%,rgba(22,74,56,0.13)_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-18px_36px_rgba(22,74,56,0.10)]"
            style={{ perspective: 900 }}
          >
            <motion.img
              src={gameAssets.backgrounds.pharmacyShop}
              alt=""
              aria-hidden="true"
              className="hidden"
              initial={{ scale: 1.08, opacity: 0.7 }}
              animate={
                phase === 'drawing'
                  ? { scale: [1.08, 1.12, 1.08], opacity: 0.78 }
                  : { scale: 1.08, opacity: 0.7 }
              }
              transition={{ duration: 1.2, repeat: phase === 'drawing' ? Infinity : 0 }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,253,247,0.55)_0%,rgba(232,246,243,0.45)_38%,rgba(22,74,56,0.35)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/55 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-deep-green/40 to-transparent" />
            <div className="pointer-events-none absolute inset-x-8 top-5 h-36 rounded-full bg-white/45 blur-2xl" />

            <motion.img
              src={gameAssets.items.couponGold}
              alt=""
              aria-hidden="true"
              className="hidden"
              animate={{ y: [0, -10, 0], rotate: [-8, 8, -8] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src={gameAssets.items.giftBox}
              alt=""
              aria-hidden="true"
              className="hidden"
              animate={{ y: [0, -14, 0], rotate: [6, -6, 6] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <motion.img
              src={gameAssets.items.supplementBottle}
              alt=""
              aria-hidden="true"
              className="hidden"
              animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-[112%] -translate-x-1/2 rounded-t-[50%] bg-[linear-gradient(180deg,rgba(46,125,90,0.16),rgba(22,74,56,0.28))]" />
            <div className="pointer-events-none absolute bottom-8 left-1/2 h-12 w-72 -translate-x-1/2 rounded-full bg-ink-dark/16 blur-xl" />
            <motion.div
              className="absolute inset-x-0 top-3 mx-auto h-[300px] w-[310px]"
              style={{ transformStyle: 'preserve-3d' }}
              animate={
                phase === 'drawing'
                  ? {
                      rotateY: [0, -12, 12, -9, 9, 0],
                      rotateZ: [0, -2, 2, -1.5, 1.5, 0],
                      y: [0, -5, 0],
                      scale: [1, 1.04, 1],
                    }
                  : phase === 'charging' && charge > 30
                    ? { rotateX: [-4, 4, -4], rotateY: [-5, 5, -5], y: [0, -5, 0] }
                    : { rotateX: -3, rotateY: 0, rotateZ: 0, y: 0, scale: 1 }
              }
              transition={{ duration: phase === 'drawing' ? 0.62 : 1.8, repeat: phase === 'drawing' ? Infinity : 0 }}
            >
              <motion.div
                className="absolute left-1/2 top-9 h-48 w-48 -translate-x-1/2 rounded-full border border-white/60"
                animate={phase === 'charging' ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 8, repeat: phase === 'charging' ? Infinity : 0, ease: 'linear' }}
                style={{ boxShadow: `0 0 42px ${charge >= 100 ? 'rgba(212,184,90,0.45)' : 'rgba(46,125,90,0.16)'}` }}
              />
              <img
                src={gameAssets.machine}
                alt="ตู้กาชาปอง CNY HEALTHCARE"
                className="relative z-10 mx-auto h-[292px] w-auto object-contain drop-shadow-[0_22px_28px_rgba(22,74,56,0.28)]"
              />
              <div className="pointer-events-none absolute left-20 top-12 z-20 h-48 w-10 -rotate-12 rounded-full bg-white/35 blur-sm" />
            </motion.div>
            <motion.div
              className="hidden"
              animate={phase === 'drawing' ? { rotate: [0, 28, -16, 0] } : { rotate: 0 }}
              transition={{ duration: 0.65, repeat: phase === 'drawing' ? Infinity : 0 }}
            />
            <div className="absolute bottom-6 left-1/2 z-10 h-12 w-44 -translate-x-1/2 rounded-[8px] border border-white/45 bg-deep-green shadow-[0_14px_26px_rgba(22,74,56,0.24)]" />
            <div className="absolute bottom-14 left-1/2 z-20 h-4 w-28 -translate-x-1/2 rounded-full bg-gold shadow-[inset_0_2px_0_rgba(255,255,255,0.55)]" />

            <motion.img
              key={mascotImage}
              src={mascotImage}
              alt="มาสคอต CNY"
              className="hidden"
              initial={{ opacity: 0, y: 14, scale: 0.85 }}
              animate={
                phase === 'completed'
                  ? { opacity: 1, y: [0, -8, 0], scale: [1, 1.05, 1], rotate: [-4, 4, -4] }
                  : phase === 'drawing'
                    ? { opacity: 1, y: [0, -3, 0], rotate: [-3, 3, -3], scale: 1 }
                    : { opacity: 1, y: [0, -4, 0], scale: 1, rotate: 0 }
              }
              transition={{ duration: phase === 'drawing' ? 0.45 : 2.4, repeat: Infinity, repeatType: 'reverse' }}
            />

            <AnimatePresence>
              {phase === 'intro' && (
                <motion.img
                  key="idle"
                  src={gameAssets.idleCapsules}
                  alt="แคปซูลในตู้"
                  className="absolute inset-x-0 bottom-11 z-30 mx-auto h-32 object-contain drop-shadow-[0_16px_18px_rgba(22,74,56,0.22)]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: [0, -7, 0], rotate: [-1, 1, -1] }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
                />
              )}

              {phase === 'capsuleDropped' && reward && (
                <motion.button
                  key="capsule"
                  onClick={openCapsule}
                  aria-label="เปิดแคปซูล"
                  className="absolute inset-x-0 bottom-8 z-30 mx-auto flex w-44 flex-col items-center"
                  initial={{ y: -230, opacity: 0, scale: 0.45, rotate: -28 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: [0, -12, 9, 0] }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 170, damping: 11 }}
                >
                  <img src={capsuleTheme.image} alt={capsuleTheme.label} className="h-36 object-contain drop-shadow-[0_20px_22px_rgba(22,74,56,0.28)]" />
                  <span
                    className="mt-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
                    style={{ backgroundColor: capsuleTheme.soft, color: capsuleTheme.text }}
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
                  <div className="absolute top-5 h-24 w-52 rounded-full bg-gold/35 blur-2xl" />
                  <img src={gameAssets.openCapsule} alt="เปิดแคปซูลคูปอง" className="relative h-48 object-contain drop-shadow-[0_22px_26px_rgba(22,74,56,0.26)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(phase === 'charging' || phase === 'intro') && (
            <div className="mt-4 rounded-[8px] border border-white/20 bg-deep-green p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_14px_28px_rgba(22,74,56,0.18)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Energy</span>
                <span className="font-mono text-sm font-semibold text-gold">{Math.round(charge)}%</span>
              </div>
              <div
                className="relative h-5 overflow-hidden rounded-full border border-white/15 bg-black/20 shadow-[inset_0_2px_6px_rgba(0,0,0,0.24)]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(charge)}
                aria-label="พลังหมุนตู้"
              >
                <motion.div
                  className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-pharmacy-green via-success-mint to-gold"
                  animate={{ width: `${charge}%` }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    className="absolute inset-y-0 -left-10 w-12 skew-x-[-18deg] bg-white/35"
                    animate={{ x: [0, 220] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
              <div className="mt-2 grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full ${
                      charge >= (index + 1) * 10 ? 'bg-gold shadow-[0_0_10px_rgba(212,184,90,0.75)]' : 'bg-white/14'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-white/74">{meterLabel}</p>
            </div>
          )}

          {phase === 'intro' && (
            <motion.button
              onClick={startGame}
              className="relative mx-auto mt-5 flex h-14 w-full max-w-[320px] items-center justify-center gap-2 overflow-hidden rounded-[8px] border border-gold/45 bg-[linear-gradient(180deg,#3A9C6F,#15543F)] px-5 font-display text-lg font-semibold text-white shadow-[0_18px_34px_rgba(46,125,90,0.30),inset_0_1px_0_rgba(255,255,255,0.24)] transition active:scale-[0.96]"
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.16 }}
            >
              <img
                src={gameAssets.ui.buttonPlay}
                alt="เริ่มหมุนตู้"
                className="hidden"
              />
              <span className="relative flex items-center justify-center gap-2 drop-shadow-[0_2px_0_rgba(22,74,56,0.45)]">
                <Sparkles size={20} />
                เริ่มหมุนตู้
              </span>
            </motion.button>
          )}

          {phase === 'charging' && (
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onPointerDown={startPressCharge}
                onPointerUp={stopPressCharge}
                onPointerCancel={stopPressCharge}
                onPointerLeave={stopPressCharge}
                onClick={() => addCharge(8)}
                className="relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-[8px] border border-pharmacy-green/25 bg-[linear-gradient(180deg,#F7FFFC,#DFF3EE)] font-semibold text-pharmacy-green shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(46,125,90,0.13)] transition active:scale-[0.98]"
              >
                <motion.span
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,184,90,0.22),transparent_48%)]"
                  animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.04, 0.92] }}
                  transition={{ duration: 1.25, repeat: Infinity }}
                />
                <span className="relative grid size-9 place-items-center rounded-full bg-white text-pharmacy-green shadow-sm">
                  <Hand size={18} />
                </span>
                <span className="relative">แตะ / กดค้าง / เขย่า เพื่อเติมพลัง</span>
              </button>
              <button
                onClick={spinMachine}
                disabled={!canSpin}
                className="relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-[8px] border border-gold/45 bg-[linear-gradient(180deg,#3A9C6F,#1E6F4C)] px-4 font-semibold text-white shadow-[0_18px_34px_rgba(46,125,90,0.32),inset_0_1px_0_rgba(255,255,255,0.24)] transition active:scale-[0.98] disabled:border-transparent disabled:bg-none disabled:bg-muted disabled:text-ink-light disabled:shadow-none"
              >
                {canSpin && <span className="absolute inset-x-7 top-0 h-px bg-gold/70" />}
                <span className="grid size-9 place-items-center rounded-full bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                  <RotateCw size={18} />
                </span>
                <span>หมุนรับแคปซูล</span>
              </button>
            </div>
          )}

          {phase === 'drawing' && (
            <div className="mt-5 rounded-[8px] bg-gold/15 px-4 py-3 text-center text-sm font-semibold text-ink-medium">
              {isReplayRound ? 'ตู้กำลังหมุนในรอบทดลอง และจะไม่ออกคูปองใหม่...' : 'ตู้กำลังหมุนและล็อกสิทธิ์กับระบบจริง...'}
            </div>
          )}

          {phase === 'capsuleDropped' && reward && (
            <div className="mt-5 rounded-[8px] px-4 py-3 text-center text-sm font-semibold" style={{ backgroundColor: capsuleTheme.soft, color: capsuleTheme.text }}>
              ได้ {capsuleTheme.label} แล้ว แตะที่แคปซูลเพื่อเปิดคูปอง
            </div>
          )}

          {phase === 'completed' && reward && (
            <div className="mt-5 rounded-[8px] border border-gold/40 bg-cream-card p-4 text-center">
              <img src={gameAssets.rewardTicket} alt="คูปองรางวัล CNY" className="hidden" />
              <p className="mt-2 text-xs font-semibold text-pharmacy-green">
                {isReplayRound ? 'คูปองเดิมจากครั้งแรก' : 'รางวัลของคุณ'}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{reward.name}</h3>
              <p className="mt-1 font-mono text-sm font-semibold text-ink-medium">{reward.code}</p>
              {isReplayRound && (
                <p className="mt-2 text-xs leading-5 text-ink-light">
                  รอบนี้เป็นการทดลองเล่น ระบบไม่เพิ่มคูปองซ้ำและยังใช้สิทธิ์เดิมใน Wallet
                </p>
              )}
              <div className="mt-4 grid gap-2">
                <motion.button
                  onClick={() => navigate('/reward')}
                  className="relative flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-[8px] border border-gold/45 bg-[linear-gradient(180deg,#3A9C6F,#15543F)] px-4 py-3 font-display text-base font-semibold text-white shadow-[0_18px_34px_rgba(46,125,90,0.28),inset_0_1px_0_rgba(255,255,255,0.24)] transition active:scale-[0.96]"
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.16 }}
                >
                  <img
                    src={gameAssets.ui.buttonClaim}
                    alt="ดูคูปอง"
                    className="hidden"
                  />
                  <span className="relative flex items-center justify-center gap-2 text-center leading-snug drop-shadow-[0_2px_0_rgba(22,74,56,0.45)]">
                    <TicketCheck size={18} />
                    {isReplayRound ? 'ดูคูปองเดิม' : 'ดูคูปองและปลดล็อก LINE'}
                  </span>
                </motion.button>
                <button
                  onClick={playAgain}
                  className="rounded-[8px] border border-pharmacy-green px-4 py-3 text-sm font-semibold text-pharmacy-green"
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
                className="w-full rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
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
