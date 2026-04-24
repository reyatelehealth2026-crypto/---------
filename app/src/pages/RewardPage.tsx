import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { Gift, LockKeyhole, MessageCircle, Share2, Ticket } from 'lucide-react'
import { formatThaiDate } from '../lib/campaign'
import { gameAssets, getCapsuleTheme } from '../lib/gameAssets'
import { useGame } from '../context/GameContext'
import { openLineOfficialAccount } from '../lib/lineLiff'
import AppHeader from '../components/AppHeader'
import ErrorBanner from '../components/ErrorBanner'

type RewardStep = 'friend' | 'share' | 'done'

const resolveStep = (friendUnlocked: boolean, shareBonusClaimed: boolean): RewardStep => {
  if (!friendUnlocked) return 'friend'
  if (!shareBonusClaimed) return 'share'
  return 'done'
}

export default function RewardPage() {
  const navigate = useNavigate()
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
      <div className="min-h-[100dvh] bg-parchment px-5 pt-8 text-ink-dark">
        <div className="mx-auto max-w-[460px] rounded-[8px] bg-white p-5 text-center shadow-sm">
          <Gift className="mx-auto text-gold" size={44} />
          <h1 className="mt-3 font-display text-2xl font-semibold">ยังไม่มีรางวัล</h1>
          <button
            onClick={() => navigate('/game')}
            className="mt-5 w-full rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
          >
            ไปเล่นเกม
          </button>
        </div>
      </div>
    )
  }

  const confirmManualUnlock = () => {
    confirmFriendGateManually()
      .then(() => confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } }))
      .catch(() => undefined)
  }

  const share = async () => {
    if (state.shareBonusClaimed) return
    try {
      await claimShareBonus()
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.75 } })
    } catch {
      // GameContext stores the visible error.
    }
  }

  const unlocked = state.friendUnlocked
  const showingFinalButton = step === 'done' || skippedShare

  return (
    <div className="min-h-[100dvh] bg-parchment px-5 pb-24 pt-6 text-ink-dark">
      <div className="mx-auto max-w-[460px]">
        <AppHeader showBack backLabel="ไป Wallet" onBack={() => navigate('/wallet')} />

        <section
          className="relative overflow-hidden rounded-[8px] p-5 text-center shadow-elevated"
          style={{ background: `linear-gradient(180deg, ${capsuleTheme.soft} 0%, #FFFDF7 100%)` }}
        >
          <img src={gameAssets.confetti} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-50" />
          <motion.img
            src={gameAssets.items.couponGold}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-4 z-10 h-14 object-contain drop-shadow-[0_10px_16px_rgba(212,184,90,0.5)]"
            animate={{ y: [0, -10, 0], rotate: [-10, 10, -10] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.img
            src={gameAssets.items.giftBox}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-8 top-6 z-10 h-14 object-contain drop-shadow-[0_10px_16px_rgba(230,109,152,0.5)]"
            animate={{ y: [0, -8, 0], rotate: [8, -8, 8] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.img
            src={gameAssets.mascot.celebrate}
            alt="มาสคอต CNY ฉลองรางวัล"
            className="pointer-events-none absolute -left-4 bottom-2 z-10 h-32 object-contain drop-shadow-[0_12px_18px_rgba(22,74,56,0.24)]"
            animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative mx-auto grid h-48 place-items-center">
            <img src={gameAssets.openCapsule} alt="เปิดแคปซูลคูปอง CNY" className="absolute h-44 object-contain" />
            <img src={gameAssets.rewardTicket} alt="คูปองรางวัล CNY" className="relative mt-20 h-24 object-contain drop-shadow-xl" />
          </div>
          <p className="relative mt-2 text-sm font-semibold" style={{ color: capsuleTheme.text }}>
            {capsuleTheme.label} ของคุณเปิดแล้ว
          </p>
          <h1 className="relative mt-1 font-display text-4xl font-semibold leading-tight text-ink-dark">{reward.name}</h1>
          <p className="relative mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-medium">{reward.description}</p>

          {unlocked && (
            <div className="relative mt-4 rounded-[8px] bg-white/85 p-4 text-left shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-light">Redeem code</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-pharmacy-green">{reward.code}</p>
                </div>
                <Ticket className="text-gold" size={30} />
              </div>
              <p className="mt-3 rounded-[8px] bg-sky-wash p-3 text-sm leading-6 text-ink-medium">
                ใช้ได้ถึง {formatThaiDate(reward.expiryDate)} ที่ {state.campaign.name}
                <br />
                {reward.terms}
              </p>
            </div>
          )}
        </section>

        {step === 'friend' && (
          <section className="mt-4 rounded-[8px] bg-deep-green p-5 text-white shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-white/15">
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

            <div className="mt-4 grid grid-cols-[96px_1fr] gap-4 rounded-[8px] bg-white p-3 text-ink-dark">
              <img src="/line-oa-qr.png" alt="QR เพิ่มเพื่อน LINE OA" className="size-24 rounded-[8px] object-cover" />
              <div className="self-center text-left">
                <p className="text-sm font-semibold">{state.campaign.lineHandle}</p>
                <p className="mt-1 text-xs leading-5 text-ink-light">เปิด LINE แล้วกดยืนยันเพื่อปลดล็อกคูปองนี้</p>
              </div>
            </div>

            <ErrorBanner message={state.error} className="mt-4" />

            <div className="mt-4 grid gap-3">
              <button
                onClick={() => void openLineOfficialAccount()}
                disabled={state.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-gold px-4 py-4 font-semibold text-ink-dark shadow-button"
              >
                <MessageCircle size={18} />
                เปิด LINE @clinicya
              </button>
              <button
                onClick={confirmManualUnlock}
                disabled={state.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-white/35 bg-white/10 px-4 py-4 font-semibold text-white shadow-button disabled:opacity-60"
              >
                <LockKeyhole size={18} />
                {state.isSubmitting ? 'กำลังยืนยันสิทธิ์...' : 'ฉันเพิ่มเพื่อนแล้ว ไปต่อ'}
              </button>
            </div>
          </section>
        )}

        {step === 'share' && !skippedShare && (
          <section className="mt-4 rounded-[8px] bg-white p-5 shadow-sm">
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
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-4 font-semibold text-white disabled:bg-muted disabled:text-ink-light"
              >
                <Share2 size={18} />
                {state.isSubmitting ? 'กำลังแชร์...' : 'แชร์รับโบนัส'}
              </button>
              <button
                onClick={() => setSkippedShare(true)}
                className="rounded-[8px] border border-pharmacy-green px-4 py-3 text-sm font-semibold text-pharmacy-green"
              >
                ข้าม เก็บใน Wallet
              </button>
            </div>
          </section>
        )}

        {showingFinalButton && (
          <section className="mt-4 rounded-[8px] bg-white p-5 text-center shadow-sm">
            <p className="text-sm leading-6 text-ink-medium">
              คูปองถูกบันทึกใน Wallet แล้ว กำลังพาไปดูรายการรางวัล…
            </p>
            <button
              onClick={() => navigate('/wallet')}
              className="mt-4 w-full rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
            >
              เก็บใน Wallet
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
