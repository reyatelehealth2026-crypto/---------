import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Gift, LockKeyhole, MessageCircle, Share2, Ticket } from 'lucide-react'
import { formatThaiDate } from '../lib/campaign'
import { gameAssets, getCapsuleTheme } from '../lib/gameAssets'
import { useGame } from '../context/GameContext'
import { openLineOfficialAccount } from '../lib/lineLiff'

export default function RewardPage() {
  const navigate = useNavigate()
  const { state, confirmFriendGateManually, claimShareBonus } = useGame()
  const [shareState, setShareState] = useState<'idle' | 'done'>(state.shareBonusClaimed ? 'done' : 'idle')
  const reward = state.rewards.find((item) => item.id === state.lastRewardId) ?? state.rewards[0]
  const capsuleTheme = useMemo(() => getCapsuleTheme(reward?.tier), [reward?.tier])

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
      setShareState('done')
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.75 } })
    } catch {
      // GameContext stores the visible error.
    }
  }

  return (
    <div className="min-h-[100dvh] bg-parchment px-5 pb-24 pt-6 text-ink-dark">
      <div className="mx-auto max-w-[460px]">
        <section
          className="relative overflow-hidden rounded-[8px] p-5 text-center shadow-elevated"
          style={{ background: `linear-gradient(180deg, ${capsuleTheme.soft} 0%, #FFFDF7 100%)` }}
        >
          <img src={gameAssets.confetti} alt="" className="pointer-events-none absolute inset-0 size-full object-cover opacity-50" />
          <img
            src={gameAssets.mascot.celebrate}
            alt="มาสคอต CNY ฉลองรางวัล"
            className="pointer-events-none absolute -left-4 bottom-2 z-10 h-32 object-contain drop-shadow-[0_12px_18px_rgba(22,74,56,0.24)]"
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
        </section>

        {!state.friendUnlocked ? (
          <section className="mt-4 rounded-[8px] bg-deep-green p-5 text-white shadow-elevated">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-white/15">
                <LockKeyhole size={24} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">ปลดล็อกคูปองด้วย LINE OA</h2>
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

            {state.error && (
              <div className="mt-4 rounded-[8px] bg-alert-coral/15 px-4 py-3 text-sm leading-6 text-white">
                {state.error}
              </div>
            )}

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

            <p className="mt-3 text-xs leading-5 text-white/75">
              หาก LINE ยังตรวจสถานะไม่ได้ ให้เปิด @clinicya แล้วกลับมากดยืนยันเองเพื่อปลดล็อกคูปองชั่วคราว
            </p>
          </section>
        ) : (
          <section className="relative mt-4 overflow-hidden rounded-[8px] bg-white p-5 shadow-sm">
            <img
              src={gameAssets.backgrounds.workspace}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full object-cover opacity-10"
            />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-light">Redeem code</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-pharmacy-green">{reward.code}</p>
              </div>
              <Ticket className="text-gold" size={34} />
            </div>
            <div className="mt-4 rounded-[8px] bg-sky-wash p-4 text-sm leading-6 text-ink-medium">
              ใช้ได้ถึง {formatThaiDate(reward.expiryDate)} ที่ {state.campaign.name}
              <br />
              {reward.terms}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/wallet')}
                className="rounded-[8px] border border-pharmacy-green px-4 py-3 font-semibold text-pharmacy-green"
              >
                เก็บใน Wallet
              </button>
              <button
                onClick={share}
                disabled={state.isSubmitting || state.shareBonusClaimed}
                className="flex items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white disabled:bg-muted disabled:text-ink-light"
              >
                <Share2 size={16} />
                {shareState === 'done' ? 'รับโบนัสแล้ว' : 'แชร์รับโบนัส'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
