import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  KeyRound,
  PackageCheck,
  Phone,
  RefreshCw,
  Save,
  Search,
  TicketCheck,
  Users,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import {
  fetchAdminSummary,
  redeemAdminReward,
  updateAdminRewardTemplate,
  type AdminParticipant,
  type AdminRewardTemplate,
  type AdminSummary,
} from '../lib/api'
import { useGame } from '../context/GameContext'

const ADMIN_KEY_STORAGE = 'cny-admin-key'

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <div className="rounded-[8px] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-light">{label}</p>
        <Icon size={18} className="text-pharmacy-green" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-ink-dark">{value}</p>
    </div>
  )
}

const statusBadge = (participant: AdminParticipant) => {
  if (!participant.mainRewardId) return { label: 'ยังไม่เล่น', className: 'bg-muted text-ink-light' }
  if (!participant.friendUnlocked) return { label: 'รอแอด LINE', className: 'bg-[#FFF6DC] text-[#A85A00]' }
  if (participant.mainRewardStatus === 'used') return { label: 'รับแล้ว', className: 'bg-success-mint/15 text-pharmacy-green' }
  return { label: 'พร้อมรับของ', className: 'bg-sky-wash text-pharmacy-green' }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state } = useGame()
  const [adminKey, setAdminKey] = useState(() => searchParams.get('key') ?? window.sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [submittedKey, setSubmittedKey] = useState(adminKey)
  const [reloadToken, setReloadToken] = useState(0)
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [drafts, setDrafts] = useState<Record<string, AdminRewardTemplate>>({})
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = submittedKey.trim() || undefined
    if (key) window.sessionStorage.setItem(ADMIN_KEY_STORAGE, key)

    setIsLoading(true)
    setError(null)
    fetchAdminSummary(key)
      .then((nextSummary) => {
        if (cancelled) return
        setSummary(nextSummary)
        setDrafts(Object.fromEntries(nextSummary.rewardTemplates.map((reward) => [reward.id, { ...reward }])))
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'โหลดแดชบอร์ดไม่สำเร็จ')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [submittedKey, reloadToken])

  const stats = useMemo(() => {
    const participants = summary?.participants ?? []
    return {
      registered: participants.length,
      played: participants.filter((participant) => Boolean(participant.mainRewardId)).length,
      lineReady: participants.filter((participant) => participant.friendUnlocked).length,
      redeemed: participants.filter((participant) => participant.mainRewardStatus === 'used').length,
    }
  }, [summary?.participants])

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const participants = summary?.participants ?? []
    if (!normalizedQuery) return participants
    return participants.filter((participant) =>
      [
        participant.name,
        participant.phone,
        participant.displayName,
        participant.lineUserId,
        participant.mainRewardName,
        participant.mainRewardStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    )
  }, [query, summary?.participants])

  const totalRemaining = useMemo(
    () => (summary?.rewardTemplates ?? []).filter((reward) => reward.active).reduce((sum, reward) => sum + reward.stock_remaining, 0),
    [summary?.rewardTemplates],
  )

  const loadWithKey = () => {
    setSubmittedKey(adminKey)
    setReloadToken((value) => value + 1)
  }

  const updateDraft = <K extends keyof AdminRewardTemplate>(id: string, key: K, value: AdminRewardTemplate[K]) => {
    setDrafts((current) => {
      const previous = current[id]
      if (!previous) return current
      return {
        ...current,
        [id]: {
          ...previous,
          [key]: value,
        },
      }
    })
  }

  const saveReward = async (id: string) => {
    const draft = drafts[id]
    if (!draft) return

    setSavingId(id)
    setError(null)
    setNotice(null)
    try {
      const stock = Number(draft.stock_remaining)
      const response = await updateAdminRewardTemplate(
        id,
        {
          name: draft.name,
          description: draft.description,
          amount: 0,
          weight: stock,
          stock_remaining: stock,
          terms: draft.terms,
          active: draft.active,
        },
        adminKey.trim() || undefined,
      )
      setSummary((current) =>
        current
          ? {
              ...current,
              rewardTemplates: current.rewardTemplates.map((reward) =>
                reward.id === id ? response.rewardTemplate : reward,
              ),
            }
          : current,
      )
      setDrafts((current) => ({ ...current, [id]: response.rewardTemplate }))
      setNotice(`บันทึก ${response.rewardTemplate.name} แล้ว`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'บันทึกรางวัลไม่สำเร็จ')
    } finally {
      setSavingId(null)
    }
  }

  const redeemReward = async (participant: AdminParticipant) => {
    if (!participant.mainRewardId) return

    setRedeemingId(participant.mainRewardId)
    setError(null)
    setNotice(null)
    try {
      const response = await redeemAdminReward(participant.mainRewardId, adminKey.trim() || undefined)
      setSummary(response.summary)
      setDrafts(Object.fromEntries(response.summary.rewardTemplates.map((reward) => [reward.id, { ...reward }])))
      setNotice(`ยืนยันรับของให้ ${participant.name} แล้ว`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ยืนยันรับของไม่สำเร็จ')
    } finally {
      setRedeemingId(null)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-parchment px-5 py-5 text-ink-dark">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-pharmacy-green"
        >
          <ArrowLeft size={18} />
          กลับหน้าแคมเปญ
        </button>

        <section className="grid gap-5 rounded-[8px] bg-deep-green p-5 text-white shadow-elevated md:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm text-white/75">{state.campaign.name || pharmacyProfile.name}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Admin หน้างาน</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              ใช้หน้านี้ค้นหาผู้ร่วมกิจกรรม ตรวจว่าเล่นแล้วหรือยัง แอด LINE แล้วหรือยัง และกดยืนยันรับของได้ทันที
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              loadWithKey()
            }}
            className="rounded-[8px] bg-white/10 p-4"
          >
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Admin key</label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  className="h-11 w-full rounded-[8px] border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-gold"
                  placeholder="ใส่เมื่อเปิด ADMIN_KEY"
                />
              </div>
              <button className="grid size-11 place-items-center rounded-[8px] bg-gold text-deep-green" aria-label="โหลดข้อมูลแอดมิน">
                <RefreshCw size={18} />
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="mt-5 rounded-[8px] border border-alert-coral/25 bg-alert-coral/10 p-4 text-sm text-alert-coral">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-5 rounded-[8px] border border-pharmacy-green/25 bg-sky-wash p-4 text-sm font-semibold text-pharmacy-green">
            {notice}
          </div>
        )}

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="ลงทะเบียน" value={stats.registered} icon={Users} />
          <StatCard label="เล่นแล้ว" value={stats.played} icon={Gift} />
          <StatCard label="แอด LINE แล้ว" value={stats.lineReady} icon={TicketCheck} />
          <StatCard label="รับของแล้ว" value={stats.redeemed} icon={PackageCheck} />
          <StatCard label="ของคงเหลือ" value={totalRemaining} icon={Gift} />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.25fr]">
          <section className="rounded-[8px] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold">ของรางวัล</h2>
              <p className="text-sm leading-6 text-ink-light">
                ใส่แค่จำนวนคงเหลือ ระบบจะใช้จำนวนนี้คำนวณโอกาสสุ่มให้อัตโนมัติ ของน้อยจะออกยากเอง
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-[8px] bg-muted p-4 text-sm text-ink-medium">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="space-y-3">
                {(summary?.rewardTemplates ?? []).map((reward) => {
                  const draft = drafts[reward.id] ?? reward
                  return (
                    <div key={reward.id} className="rounded-[8px] border border-paper-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-light">{reward.id}</p>
                          <input
                            value={draft.name}
                            onChange={(event) => updateDraft(reward.id, 'name', event.target.value)}
                            className="mt-1 w-full rounded-[8px] border border-paper-line px-3 py-2 font-semibold outline-none focus:border-pharmacy-green"
                          />
                        </div>
                        <label className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-ink-medium">
                          <input
                            type="checkbox"
                            checked={draft.active}
                            onChange={(event) => updateDraft(reward.id, 'active', event.target.checked)}
                            className="accent-pharmacy-green"
                          />
                          เปิดใช้
                        </label>
                      </div>

                      <label className="mt-3 block text-xs font-semibold text-ink-light">
                        จำนวนคงเหลือ
                        <input
                          type="number"
                          min={0}
                          value={draft.stock_remaining}
                          onChange={(event) => updateDraft(reward.id, 'stock_remaining', Number(event.target.value || 0))}
                          className="mt-1 h-11 w-full rounded-[8px] border border-paper-line px-3 text-lg font-semibold text-ink-dark outline-none focus:border-pharmacy-green"
                        />
                      </label>

                      <button
                        onClick={() => void saveReward(reward.id)}
                        disabled={savingId === reward.id}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
                      >
                        <Save size={16} />
                        {savingId === reward.id ? 'กำลังบันทึก...' : 'บันทึกจำนวน'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="rounded-[8px] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">เช็คผู้ร่วมกิจกรรม</h2>
                <p className="text-sm text-ink-light">ค้นด้วยชื่อ เบอร์ LINE หรือชื่อรางวัล</p>
              </div>
              <Users className="text-pharmacy-green" size={22} />
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-[12px] border-2 border-paper-line bg-white pl-10 pr-3 text-base outline-none focus:border-pharmacy-green"
                placeholder="ค้นหา เช่น ชื่อ เบอร์โทร LINE หรือรางวัล"
              />
            </div>

            <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
              {filteredParticipants.length === 0 ? (
                <p className="rounded-[8px] bg-sky-wash p-4 text-sm leading-6 text-ink-medium">ไม่พบรายการที่ค้นหา</p>
              ) : (
                filteredParticipants.map((participant) => {
                  const badge = statusBadge(participant)
                  const canRedeem =
                    Boolean(participant.mainRewardId) &&
                    participant.friendUnlocked &&
                    participant.mainRewardStatus === 'unused'
                  return (
                    <div key={participant.id} className="rounded-[8px] border border-paper-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{participant.name}</p>
                          <a href={`tel:${participant.phone}`} className="mt-1 flex items-center gap-1 text-xs font-medium text-pharmacy-green">
                            <Phone size={13} />
                            {participant.phone}
                          </a>
                          <p className="mt-1 truncate text-xs text-ink-light">
                            LINE: {participant.displayName || participant.lineUserId || 'ยังไม่ผูก LINE'}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 rounded-[7px] bg-muted/70 px-3 py-2 text-xs leading-5 text-ink-medium">
                        <p>สมัคร: {formatThaiDate(participant.registeredAt)}</p>
                        <p>เล่นเกม: {participant.mainRewardId ? 'เล่นแล้ว' : 'ยังไม่เล่น'}</p>
                        <p>แอดเพื่อน: {participant.friendUnlocked ? `ยืนยันแล้ว ${participant.friendshipVerifiedAt ? formatThaiDate(participant.friendshipVerifiedAt) : ''}` : 'ยังไม่ยืนยัน'}</p>
                        <p>รางวัล: {participant.mainRewardName || '-'}</p>
                        <p>
                          สถานะรับของ:{' '}
                          {participant.mainRewardStatus === 'used'
                            ? `รับแล้ว ${participant.mainRewardUsedAt ? formatThaiDate(participant.mainRewardUsedAt) : ''}`
                            : participant.mainRewardId
                              ? 'ยังไม่ได้รับ'
                              : '-'}
                        </p>
                      </div>

                      {canRedeem ? (
                        <button
                          onClick={() => void redeemReward(participant)}
                          disabled={redeemingId === participant.mainRewardId}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] bg-pharmacy-green px-4 py-3 text-sm font-semibold text-white shadow-button disabled:opacity-60"
                        >
                          <CheckCircle2 size={18} />
                          {redeemingId === participant.mainRewardId ? 'กำลังยืนยัน...' : 'ยืนยันรับของ'}
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-[12px] bg-muted px-4 py-3 text-sm font-semibold text-ink-light">
                          {participant.mainRewardStatus === 'used' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          {participant.mainRewardStatus === 'used'
                            ? 'รับของแล้ว'
                            : !participant.mainRewardId
                              ? 'ยังไม่ได้เล่นเกม'
                              : 'ต้องแอด LINE ก่อนรับของ'}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
