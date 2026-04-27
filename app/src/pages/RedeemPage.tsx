import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, TicketX } from 'lucide-react'
import BackButton from '../components/BackButton'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import { useGame } from '../context/GameContext'
import { cutePetAssets, getCapsuleTheme } from '../lib/gameAssets'
import GameImage from '../components/game/GameImage'
import RewardFrame from '../components/game/RewardFrame'

export default function RedeemPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, redeemReward } = useGame()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [submittedCode, setSubmittedCode] = useState(searchParams.get('code') ?? '')
  const [redeemedRewardId, setRedeemedRewardId] = useState<string | null>(null)

  const reward = useMemo(
    () => state.rewards.find((item) => item.code.toLowerCase() === submittedCode.trim().toLowerCase()),
    [state.rewards, submittedCode],
  )

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedCode(code)
  }

  const redeem = () => {
    if (!reward || reward.status !== 'unused') return
    redeemReward(reward.code)
      .then((redeemed) => setRedeemedRewardId(redeemed.id))
      .catch(() => undefined)
  }

  const isUsed = reward?.status === 'used' || reward?.id === redeemedRewardId
  const rewardTheme = reward ? getCapsuleTheme(reward.tier) : null

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#3F2A12] px-5 py-5 text-white">
      <GameImage
        src={cutePetAssets.backgrounds.hills}
        decorative
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
      />
      <div className="relative mx-auto max-w-[460px]">
        <BackButton
          onClick={() => navigate('/wallet')}
          label="กลับ Wallet"
          tone="muted"
          className="mb-4"
        />

        <section className="relative overflow-hidden rounded-[20px] border-2 border-[#E2C076] bg-white p-5 text-ink-dark shadow-elevated">
          <motion.img
            src={cutePetAssets.buildings.shop}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-4 z-10 h-32 object-contain opacity-95 drop-shadow-[0_12px_18px_rgba(82,46,12,0.2)]"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
          <div className="relative z-20 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-pharmacy-green">Staff Redeem · Pet Shop Counter</p>
              <h1 className="mt-1 font-display text-2xl font-semibold">ตรวจคูปองหน้างาน</h1>
              <p className="mt-2 text-sm leading-6 text-ink-medium">
                พนักงานกรอกโค้ดจาก Wallet ลูกค้า แล้วกดยืนยันเพื่อเปลี่ยนสถานะเป็นใช้แล้ว
              </p>
            </div>
            <ShieldCheck className="shrink-0 text-pharmacy-green" size={32} />
          </div>

          <form onSubmit={submit} className="relative z-20 mt-5 flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-12 min-w-0 flex-1 rounded-[12px] border-2 border-[#E2C076] bg-[#FFF7E2] px-4 font-mono text-sm outline-none focus:border-pharmacy-green"
              placeholder="RX-JYP-0001"
            />
            <button className="rounded-[12px] bg-pharmacy-green px-4 text-sm font-semibold text-white shadow-button">
              ตรวจ
            </button>
          </form>
        </section>

        {submittedCode && !reward && (
          <section className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-white p-5 text-center text-ink-dark shadow-sm">
            <motion.img
              src={cutePetAssets.mascots.cat}
              alt="แมวน้อยส่ายหัว"
              className="mx-auto h-32 object-contain"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              draggable={false}
            />
            <TicketX className="mx-auto mt-2 text-alert-coral" size={36} />
            <h2 className="mt-2 font-display text-2xl font-semibold">ไม่พบคูปอง</h2>
            <p className="mt-2 text-sm text-ink-medium">
              ตรวจโค้ดอีกครั้ง หรือให้ลูกค้าเปิด Wallet จาก LINE OA
            </p>
          </section>
        )}

        {reward && rewardTheme && (
          <section className="mt-4 rounded-[20px] border-2 border-[#E2C076] bg-white p-5 text-ink-dark shadow-sm">
            <div className="flex items-start gap-4">
              <RewardFrame
                rarity={rewardTheme.rarity}
                className="w-[120px] shrink-0"
                contentClassName="px-[14%] py-[18%]"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5A2E0F]">
                  {rewardTheme.rarity === 'rare' ? 'RARE' : 'CARD'}
                </p>
                <p
                  className="mt-1 font-display text-[11px] font-extrabold leading-tight"
                  style={{ color: rewardTheme.text }}
                >
                  {rewardTheme.label}
                </p>
              </RewardFrame>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-pharmacy-green">
                  {state.campaign.name || pharmacyProfile.name}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">{reward.name}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-medium">{reward.description}</p>
                <p className="mt-2 text-xs text-ink-light">
                  หมดอายุ {formatThaiDate(reward.expiryDate)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#E2C076]/60 bg-[#FFF7E2] p-4 text-sm leading-6 text-ink-medium">
              {reward.terms}
            </div>

            {state.error && (
              <div className="mt-4 rounded-[12px] bg-alert-coral/10 px-4 py-3 text-sm text-alert-coral">
                {state.error}
              </div>
            )}

            {isUsed ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-[12px] bg-success-mint/15 px-4 py-3 font-semibold text-pharmacy-green">
                <CheckCircle2 size={18} />
                คูปองนี้ถูกใช้แล้ว
              </div>
            ) : (
              <button
                onClick={redeem}
                disabled={state.isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-pharmacy-green px-4 py-4 font-semibold text-white shadow-button disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {state.isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันการใช้คูปอง'}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
