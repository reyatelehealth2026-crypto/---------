import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ShieldCheck, TicketX } from 'lucide-react'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import { useGame } from '../context/GameContext'

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

  return (
    <div className="min-h-[100dvh] bg-deep-green px-5 py-5 text-white">
      <div className="mx-auto max-w-[460px]">
        <button onClick={() => navigate('/wallet')} className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
          <ChevronLeft size={18} />
          กลับ Wallet
        </button>

        <section className="rounded-[8px] bg-white p-5 text-ink-dark shadow-elevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-pharmacy-green">Staff Redeem</p>
              <h1 className="mt-1 font-display text-3xl font-semibold">ตรวจคูปองหน้างาน</h1>
              <p className="mt-2 text-sm leading-6 text-ink-medium">
                พนักงานกรอกโค้ดจาก Wallet ลูกค้า แล้วกดยืนยันเพื่อเปลี่ยนสถานะเป็นใช้แล้ว
              </p>
            </div>
            <ShieldCheck className="shrink-0 text-pharmacy-green" size={36} />
          </div>

          <form onSubmit={submit} className="mt-5 flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-12 min-w-0 flex-1 rounded-[8px] border border-paper-line px-4 font-mono text-sm outline-none focus:border-pharmacy-green"
              placeholder="RX-JYP-0001"
            />
            <button className="rounded-[8px] bg-pharmacy-green px-4 text-sm font-semibold text-white">
              ตรวจ
            </button>
          </form>
        </section>

        {submittedCode && !reward && (
          <section className="mt-4 rounded-[8px] bg-white p-5 text-center text-ink-dark shadow-sm">
            <TicketX className="mx-auto text-alert-coral" size={42} />
            <h2 className="mt-3 font-display text-2xl font-semibold">ไม่พบคูปอง</h2>
            <p className="mt-2 text-sm text-ink-medium">ตรวจโค้ดอีกครั้ง หรือให้ลูกค้าเปิด Wallet จาก LINE OA</p>
          </section>
        )}

        {reward && (
          <section className="mt-4 rounded-[8px] bg-white p-5 text-ink-dark shadow-sm">
            <div className="flex items-start gap-4">
              <img src={reward.image} alt={reward.name} className="size-20 rounded-[8px] bg-sky-wash object-contain" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-pharmacy-green">{state.campaign.name || pharmacyProfile.name}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">{reward.name}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-medium">{reward.description}</p>
                <p className="mt-2 text-xs text-ink-light">หมดอายุ {formatThaiDate(reward.expiryDate)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[8px] bg-sky-wash p-4 text-sm leading-6 text-ink-medium">
              {reward.terms}
            </div>

            {state.error && (
              <div className="mt-4 rounded-[8px] bg-alert-coral/10 px-4 py-3 text-sm text-alert-coral">
                {state.error}
              </div>
            )}

            {isUsed ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-[8px] bg-success-mint/15 px-4 py-3 font-semibold text-pharmacy-green">
                <CheckCircle2 size={18} />
                คูปองนี้ถูกใช้แล้ว
              </div>
            ) : (
              <button
                onClick={redeem}
                disabled={state.isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-4 font-semibold text-white shadow-button"
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
