import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TicketCheck, Timer, Wallet } from 'lucide-react'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import { useGame } from '../context/GameContext'

export default function WalletPage() {
  const navigate = useNavigate()
  const { state } = useGame()

  const usableRewards = useMemo(
    () => state.rewards.filter((reward) => reward.status === 'unused'),
    [state.rewards],
  )
  const lineProfile = state.line?.profile
  const lineDisplayName = lineProfile?.displayName ?? state.customer?.displayName ?? 'โปรไฟล์ LINE'
  const registeredName = state.customer?.name ?? '-'
  const registeredPhone = state.customer?.phone ?? '-'
  const profileInitial = (lineDisplayName || registeredName || 'C').trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-[100dvh] bg-parchment px-5 pb-24 pt-5 text-ink-dark">
      <div className="mx-auto max-w-[460px]">
        <section className="rounded-[8px] bg-deep-green p-5 text-white shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/75">{state.campaign.name || pharmacyProfile.name}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold">คูปองของฉัน</h1>
            </div>
            <Wallet size={38} className="text-gold" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-[8px] bg-white/12 p-3">
              <p className="text-2xl font-semibold">{state.rewards.length}</p>
              <p className="text-xs text-white/70">ทั้งหมด</p>
            </div>
            <div className="rounded-[8px] bg-white/12 p-3">
              <p className="text-2xl font-semibold">{usableRewards.length}</p>
              <p className="text-xs text-white/70">ใช้ได้</p>
            </div>
            <div className="rounded-[8px] bg-white/12 p-3">
              <p className="text-2xl font-semibold">{state.friendUnlocked ? 'เปิด' : 'ล็อก'}</p>
              <p className="text-xs text-white/70">LINE OA</p>
            </div>
          </div>
        </section>

        {state.rewards.length === 0 ? (
          <section className="mt-5 rounded-[8px] bg-white p-5 text-center shadow-sm">
            <img src="/wallet-empty.png" alt="ยังไม่มีคูปอง" className="mx-auto h-40 object-contain" />
            <h2 className="mt-3 font-display text-2xl font-semibold">ยังไม่มีคูปอง</h2>
            <p className="mt-2 text-sm leading-6 text-ink-medium">เริ่มรับสิทธิ์จากแคมเปญ CNY HEALTHCARE เพื่อเก็บคูปองแรกของคุณ</p>
            <button
              onClick={() => navigate('/')}
              className="mt-5 w-full rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white"
            >
              ไปหน้าแคมเปญ
            </button>
          </section>
        ) : (
          <div className="mt-5 space-y-3">
            {state.rewards.map((reward) => (
              <article key={reward.id} className="rounded-[8px] bg-white p-4 shadow-sm">
                <div className="flex gap-4">
                  <img src={reward.image} alt={reward.name} className="size-20 rounded-[8px] object-contain bg-sky-wash" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-pharmacy-green">
                          {reward.type === 'bonus' ? 'โบนัสแชร์' : 'รางวัลหลัก'}
                        </p>
                        <h2 className="mt-1 font-display text-xl font-semibold leading-tight">{reward.name}</h2>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reward.status === 'unused'
                            ? 'bg-success-mint/15 text-pharmacy-green'
                            : 'bg-muted text-ink-light'
                        }`}
                      >
                        {reward.status === 'unused' ? 'ใช้ได้' : 'ใช้แล้ว'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
                      <Timer size={14} />
                      หมดอายุ {formatThaiDate(reward.expiryDate)}
                    </div>
                    <p className="mt-2 font-mono text-sm font-semibold text-ink-medium">{reward.code}</p>
                  </div>
                </div>
                <button
                  disabled={reward.status !== 'unused'}
                  onClick={() => navigate(`/redeem?code=${encodeURIComponent(reward.code)}`)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-3 font-semibold text-white disabled:bg-muted disabled:text-ink-light"
                >
                  <TicketCheck size={16} />
                  ใช้คูปองที่ร้าน
                </button>
              </article>
            ))}
          </div>
        )}

        <section className="mt-5 rounded-[8px] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {lineProfile?.pictureUrl ? (
              <img
                src={lineProfile.pictureUrl}
                alt={lineDisplayName}
                className="size-14 rounded-full border border-paper-line object-cover"
              />
            ) : (
              <div className="grid size-14 place-items-center rounded-full bg-sky-wash text-xl font-semibold text-pharmacy-green">
                {profileInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-pharmacy-green">โปรไฟล์ LINE</p>
              <h2 className="truncate font-display text-2xl font-semibold leading-tight">{lineDisplayName}</h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-[8px] bg-muted/70 px-3 py-2">
              <p className="text-xs font-medium text-ink-light">ชื่อที่ลงทะเบียน</p>
              <p className="mt-1 truncate font-semibold text-ink-dark">{registeredName}</p>
            </div>
            <div className="rounded-[8px] bg-muted/70 px-3 py-2">
              <p className="text-xs font-medium text-ink-light">เบอร์มือถือ</p>
              <p className="mt-1 truncate font-semibold text-ink-dark">{registeredPhone}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
