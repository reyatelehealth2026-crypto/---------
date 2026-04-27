import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { motion, useReducedMotion } from 'framer-motion'
import { Gift, LockKeyhole, MessageCircle, Share2, Ticket } from 'lucide-react'
import { formatThaiDate } from '../lib/campaign'
import { cutePetAssets, gameAssets, getCapsuleTheme } from '../lib/gameAssets'
import { useGame } from '../context/GameContext'
import { openLineOfficialAccount } from '../lib/lineLiff'
import AppHeader from '../components/AppHeader'
import ErrorBanner from '../components/ErrorBanner'
import GameImage from '../components/game/GameImage'
import CutePetBackground from '../components/game/CutePetBackground'
import { playGameSound } from '../lib/gameAudio'

type RewardStep = 'friend' | 'share' | 'done'

const resolveStep = (friendUnlocked: boolean, shareBonusClaimed: boolean): RewardStep => {
  if (!friendUnlocked) return 'friend'
  if (!shareBonusClaimed) return 'share'
  return 'done'
}

export default function RewardPage() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const { state, confirmFriendGateManually, claimShareBonus } = useGame()
  const reward = state.rewards.find((item) => item.id === state.lastRewardId) ?? state.rewards[0]
  const capsuleTheme = useMemo(() => getCapsuleTheme(reward?.tier), [reward?.tier])
  const step = resolveStep(state.friendUnlocked, state.shareBonusClaimed)
  const [skippedShare, setSkippedShare] = useState(false)

  useEffect(() => {
    if (step !== 'done' && !skippedShare) return
    const id = window.setTimeout(() => navigate('/wallet'), 1500)
    return () => window.clearTimeout(id)
  }, [navigate, skippedShare, step])

  if (!reward) {
    return (
      <div className="relative min-h-full overflow-hidden px-5 pt-8 text-ink-dark">
        <CutePetBackground variant="hills" className="absolute inset-0 -z-10 h-full w-full" />
        <div className="mx-auto max-w-[460px] rounded-[18px] border-2 border-[#E2C076] bg-white p-5 text-center shadow-elevated">
          <Gift className="mx-auto text-gold" size={44} />
          <h1 className="mt-3 font-display text-2xl font-semibold">ยังไม่มีรางวัล</h1>
          <button
            onClick={() => navigate('/game')}
            className="mt-5 w-full rounded-[14px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
          >
            ไปเล่นเกม
          </button>
        </div>
      </div>
    )
  }

  const confirmManualUnlock = () => {
    playGameSound('uiTap')
    confirmFriendGateManually()
      .then(() => confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } }))
      .catch(() => undefined)
  }

  const share = async () => {
    if (state.shareBonusClaimed) return
    playGameSound('uiTap')
    try {
      await claimShareBonus()
      playGameSound('reward')
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.75 } })
    } catch {
      // GameContext stores the visible error.
    }
  }

  const unlocked = state.friendUnlocked
  const showingFinalButton = step === 'done' || skippedShare

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F6EED8] px-4 pb-20 pt-4 text-ink-dark">
      <CutePetBackground
        variant="soft"
        className="absolute inset-0 -z-10 h-full w-full"
        showTrees
        overlayClassName="bg-[radial-gradient(circle_at_50%_8%,rgba(255,211,106,0.32),transparent_36%),linear-gradient(180deg,rgba(255,250,235,0.86),rgba(235,226,197,0.94))]"
      />
      <div className="mx-auto max-w-[430px]">
        <AppHeader showBack backLabel="ไป Wallet" onBack={() => navigate('/wallet')} />

        <section
          className="relative overflow-hidden rounded-[24px] border-2 border-[#E2C076] p-5 text-center shadow-[0_26px_60px_rgba(82,46,12,0.18)]"
          style={{ background: `linear-gradient(180deg, ${capsuleTheme.soft} 0%, #FFFDF7 100%)` }}
        >
          <GameImage
            src={gameAssets.confetti}
            decorative
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-45"
          />
          <motion.img
            src={cutePetAssets.currency.coinPile}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 z-10 h-14 object-contain opacity-85 drop-shadow-[0_10px_16px_rgba(212,184,90,0.5)]"
            animate={{ y: [0, -8, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 3.4, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
          <motion.img
            src={cutePetAssets.rewards.giftBox}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 z-10 h-14 object-contain opacity-85 drop-shadow-[0_10px_16px_rgba(230,109,152,0.5)]"
            animate={{ y: [0, -8, 0], rotate: [8, -8, 8] }}
            transition={{ duration: 3.8, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.3 }}
            draggable={false}
          />
          <motion.img
            src={cutePetAssets.mascots.monkey}
            alt="มาสคอตลิงฉลองรางวัล"
            className="pointer-events-none absolute -right-4 bottom-4 z-0 h-20 object-contain opacity-45 drop-shadow-[0_12px_18px_rgba(82,46,12,0.24)]"
            animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 2.6, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
          <motion.img
            src={cutePetAssets.mascots.bird}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-3 bottom-4 z-0 h-16 object-contain opacity-45 drop-shadow-[0_12px_18px_rgba(82,46,12,0.22)]"
            animate={{ y: [0, -8, 0], rotate: [4, -4, 4] }}
            transition={{ duration: 2.4, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.4 }}
            draggable={false}
          />

          <div className="relative z-10 mx-auto grid place-items-center pb-4 pt-5">
            <motion.img
              src={cutePetAssets.rewards.glow}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute h-60 object-contain mix-blend-screen opacity-80"
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.95, 0.6] }}
              transition={{ duration: 2.2, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
              draggable={false}
            />
            <div
              className="relative w-[280px] rounded-[24px] border-2 bg-white/95 px-5 py-5 text-center shadow-[0_20px_42px_rgba(82,46,12,0.20)] backdrop-blur-[2px]"
              style={{ borderColor: capsuleTheme.text }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-sm"
                style={{ backgroundColor: capsuleTheme.text }}
              >
                {capsuleTheme.rarity === 'rare' ? 'Rare Reward' : 'Reward'}
              </span>
              <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-pharmacy-green">
                คูปองพร้อมใช้
              </p>
              <p
                className="mt-2 font-display text-xl font-extrabold leading-tight"
                style={{ color: capsuleTheme.text }}
              >
                {reward.name}
              </p>
              <p className="mt-3 rounded-full bg-[#FFF6DC] px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-ink-dark">
                {reward.code}
              </p>
            </div>
          </div>
          <p className="relative z-10 mt-1 text-sm font-semibold" style={{ color: capsuleTheme.text }}>
            {capsuleTheme.label} ของคุณเปิดแล้ว
          </p>
          <h1 className="relative z-10 mt-1 font-display text-3xl font-extrabold leading-tight text-[#3A1A05]">
            เก็บคูปองนี้ไว้ใน Wallet
          </h1>
          <p className="relative z-10 mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-medium">
            {reward.description}
          </p>

          {unlocked && (
            <div className="relative z-20 mt-4 rounded-[14px] border-2 border-[#E2C076] bg-white/95 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-light">
                    Redeem code
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-pharmacy-green">{reward.code}</p>
                </div>
                <Ticket className="text-gold" size={30} />
              </div>
              <p className="mt-3 rounded-[12px] bg-sky-wash p-3 text-sm leading-6 text-ink-medium">
                ใช้ได้ถึง {formatThaiDate(reward.expiryDate)} ที่ {state.campaign.name}
                <br />
                {reward.terms}
              </p>
            </div>
          )}
        </section>

        {step === 'friend' && (
          <section className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-[linear-gradient(180deg,#1D6A50,#123E30)] p-5 text-white shadow-[0_18px_38px_rgba(22,74,56,0.22)]">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-white/15">
                <LockKeyhole size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Step 2 / 3</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">ปลดล็อกคูปองด้วย LINE OA</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  เพิ่มเพื่อน LINE @clinicya เพื่อเก็บคูปองไว้ใน Wallet และรับข่าวสารจาก CNY HEALTHCARE
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[96px_1fr] gap-4 rounded-[14px] bg-white p-3 text-ink-dark">
              <img
                src="/line-oa-qr.png"
                alt="QR เพิ่มเพื่อน LINE OA"
                className="size-24 rounded-[10px] object-cover"
              />
              <div className="self-center text-left">
                <p className="text-sm font-semibold">{state.campaign.lineHandle}</p>
                <p className="mt-1 text-xs leading-5 text-ink-light">
                  เปิด LINE แล้วกดยืนยันเพื่อปลดล็อกคูปองนี้
                </p>
              </div>
            </div>

            <ErrorBanner message={state.error} className="mt-4" />

            <div className="mt-4 grid gap-3">
              <button
                onClick={() => {
                  playGameSound('uiTap')
                  void openLineOfficialAccount()
                }}
                disabled={state.isSubmitting}
                className="game-shine flex w-full items-center justify-center gap-2 overflow-hidden rounded-[16px] border-2 border-[#FFE08A] bg-[linear-gradient(180deg,#FFE08A,#D4B85A)] px-4 py-4 font-extrabold text-ink-dark shadow-[0_14px_28px_rgba(212,184,90,0.28)]"
              >
                <MessageCircle size={18} />
                เปิด LINE @clinicya
              </button>
              <button
                onClick={confirmManualUnlock}
                disabled={state.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-white/35 bg-white/10 px-4 py-4 font-semibold text-white shadow-button disabled:opacity-60"
              >
                <LockKeyhole size={18} />
                {state.isSubmitting ? 'กำลังตรวจสอบกับ LINE...' : 'ตรวจสอบการเพิ่มเพื่อน LINE'}
              </button>
            </div>
          </section>
        )}

        {step === 'share' && !skippedShare && (
          <section className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Step 3 / 3</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">แชร์ให้เพื่อน รับโบนัสเพิ่ม</h2>
            <p className="mt-2 text-sm leading-6 text-ink-medium">
              แชร์แคมเปญไปยังเพื่อนใน LINE เพื่อรับโบนัสคูปองอีก 1 ชิ้น หรือข้ามไปเก็บใน Wallet ได้เลย
            </p>
            <ErrorBanner message={state.error} className="mt-3" />
            <div className="mt-4 grid gap-3">
              <button
                onClick={share}
                disabled={state.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-pharmacy-green px-4 py-4 font-semibold text-white shadow-button disabled:bg-muted disabled:text-ink-light"
              >
                <Share2 size={18} />
                {state.isSubmitting ? 'กำลังแชร์...' : 'แชร์รับโบนัส'}
              </button>
              <button
                onClick={() => {
                  playGameSound('uiTap')
                  setSkippedShare(true)
                }}
                className="rounded-[16px] border-2 border-pharmacy-green bg-white px-4 py-3 text-sm font-semibold text-pharmacy-green"
              >
                ข้าม เก็บใน Wallet
              </button>
            </div>
          </section>
        )}

        {showingFinalButton && (
          <section className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-white p-5 text-center shadow-sm">
            <p className="text-sm leading-6 text-ink-medium">
              คูปองถูกบันทึกใน Wallet แล้ว กำลังพาไปดูรายการรางวัล…
            </p>
            <button
              onClick={() => {
                playGameSound('uiTap')
                navigate('/wallet')
              }}
              className="mt-4 w-full rounded-[16px] bg-pharmacy-green px-4 py-3 font-semibold text-white shadow-button"
            >
              เก็บใน Wallet
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
