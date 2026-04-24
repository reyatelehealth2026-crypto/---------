import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Gift, KeyRound, Phone, QrCode, RefreshCw, Save, Settings, Share2, TicketCheck, Users } from 'lucide-react'
import { formatThaiDate, pharmacyProfile } from '../lib/campaign'
import { fetchAdminSummary, updateAdminRewardTemplate, type AdminRewardTemplate, type AdminSummary } from '../lib/api'
import { useGame } from '../context/GameContext'

const ADMIN_KEY_STORAGE = 'cny-admin-key'

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: typeof Users
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

export default function AdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state } = useGame()
  const [adminKey, setAdminKey] = useState(() => searchParams.get('key') ?? window.sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [submittedKey, setSubmittedKey] = useState(adminKey)
  const [reloadToken, setReloadToken] = useState(0)
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [drafts, setDrafts] = useState<Record<string, AdminRewardTemplate>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const totalWeight = useMemo(
    () => (summary?.rewardTemplates ?? []).filter((reward) => reward.active).reduce((sum, reward) => sum + reward.weight, 0),
    [summary],
  )

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
      const response = await updateAdminRewardTemplate(
        id,
        {
          name: draft.name,
          description: draft.description,
          amount: Number(draft.amount),
          weight: Number(draft.weight),
          stock_remaining: Number(draft.stock_remaining),
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
            <h1 className="mt-2 font-display text-4xl font-semibold">Admin CNY HEALTHCARE</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              ตั้งค่ารางวัลในตู้กาชาปอง ดู stock และติดตามผู้ร่วมกิจกรรมจาก LINE OA / QR แคมเปญเดียวกัน
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

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
          <StatCard label="Scans" value={summary?.events.scan ?? 0} icon={QrCode} />
          <StatCard label="Registers" value={summary?.events.register ?? 0} icon={Users} />
          <StatCard label="Players" value={summary?.participants.length ?? 0} icon={BarChart3} />
          <StatCard label="Draws" value={summary?.events.draw ?? 0} icon={Gift} />
          <StatCard label="LINE OA" value={summary?.events.friend ?? 0} icon={TicketCheck} />
          <StatCard label="Shares" value={summary?.events.share ?? 0} icon={Share2} />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="rounded-[8px] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">ตั้งค่ารางวัล</h2>
                <p className="text-sm text-ink-light">แก้ชื่อรางวัล ส่วนลด น้ำหนักสุ่ม stock และเปิด/ปิดรางวัลได้ทันที</p>
              </div>
              <span className="rounded-full bg-sky-wash px-3 py-1 text-xs font-semibold text-pharmacy-green">
                น้ำหนักที่เปิดใช้ {totalWeight}
              </span>
            </div>

            {isLoading ? (
              <div className="rounded-[8px] bg-muted p-4 text-sm text-ink-medium">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="space-y-4">
                {(summary?.rewardTemplates ?? []).map((reward) => {
                  const draft = drafts[reward.id] ?? reward
                  return (
                    <div key={reward.id} className="rounded-[8px] border border-paper-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
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

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <label className="text-xs font-semibold text-ink-light">
                          ส่วนลด
                          <input
                            type="number"
                            min={0}
                            value={draft.amount}
                            onChange={(event) => updateDraft(reward.id, 'amount', Number(event.target.value || 0))}
                            className="mt-1 h-10 w-full rounded-[8px] border border-paper-line px-3 text-sm text-ink-dark outline-none focus:border-pharmacy-green"
                          />
                        </label>
                        <label className="text-xs font-semibold text-ink-light">
                          น้ำหนักสุ่ม
                          <input
                            type="number"
                            min={0}
                            value={draft.weight}
                            onChange={(event) => updateDraft(reward.id, 'weight', Number(event.target.value || 0))}
                            className="mt-1 h-10 w-full rounded-[8px] border border-paper-line px-3 text-sm text-ink-dark outline-none focus:border-pharmacy-green"
                          />
                        </label>
                        <label className="text-xs font-semibold text-ink-light">
                          คงเหลือ
                          <input
                            type="number"
                            min={0}
                            value={draft.stock_remaining}
                            onChange={(event) => updateDraft(reward.id, 'stock_remaining', Number(event.target.value || 0))}
                            className="mt-1 h-10 w-full rounded-[8px] border border-paper-line px-3 text-sm text-ink-dark outline-none focus:border-pharmacy-green"
                          />
                        </label>
                      </div>

                      <label className="mt-3 block text-xs font-semibold text-ink-light">
                        รายละเอียด
                        <textarea
                          value={draft.description}
                          onChange={(event) => updateDraft(reward.id, 'description', event.target.value)}
                          className="mt-1 min-h-20 w-full rounded-[8px] border border-paper-line px-3 py-2 text-sm leading-6 text-ink-dark outline-none focus:border-pharmacy-green"
                        />
                      </label>

                      <label className="mt-3 block text-xs font-semibold text-ink-light">
                        เงื่อนไข
                        <textarea
                          value={draft.terms}
                          onChange={(event) => updateDraft(reward.id, 'terms', event.target.value)}
                          className="mt-1 min-h-16 w-full rounded-[8px] border border-paper-line px-3 py-2 text-sm leading-6 text-ink-dark outline-none focus:border-pharmacy-green"
                        />
                      </label>

                      <button
                        onClick={() => void saveReward(reward.id)}
                        disabled={savingId === reward.id}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-pharmacy-green px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
                      >
                        <Save size={16} />
                        {savingId === reward.id ? 'กำลังบันทึก...' : 'บันทึกรางวัลนี้'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-[8px] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">ผู้ร่วมกิจกรรม</h2>
                  <p className="text-sm text-ink-light">ล่าสุดสูงสุด 200 รายการ</p>
                </div>
                <Users className="text-pharmacy-green" size={22} />
              </div>

              <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
                {(summary?.participants.length ?? 0) === 0 ? (
                  <p className="rounded-[8px] bg-sky-wash p-4 text-sm leading-6 text-ink-medium">ยังไม่มีผู้ร่วมกิจกรรม</p>
                ) : (
                  summary?.participants.map((participant) => (
                    <div key={participant.id} className="rounded-[8px] border border-paper-line p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{participant.name}</p>
                          <a href={`tel:${participant.phone}`} className="mt-1 flex items-center gap-1 text-xs font-medium text-pharmacy-green">
                            <Phone size={13} />
                            {participant.phone}
                          </a>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${participant.friendUnlocked ? 'bg-sky-wash text-pharmacy-green' : 'bg-muted text-ink-light'}`}>
                          {participant.friendUnlocked ? 'LINE แล้ว' : 'รอ LINE'}
                        </span>
                      </div>
                      <div className="mt-3 rounded-[7px] bg-muted/70 px-3 py-2 text-xs leading-5 text-ink-medium">
                        <p>LINE: {participant.displayName || participant.lineUserId || '-'}</p>
                        <p>สมัคร: {formatThaiDate(participant.registeredAt)}</p>
                        <p>คูปอง: {participant.mainRewardName || 'ยังไม่ได้สุ่ม'} {participant.mainRewardCode ? `(${participant.mainRewardCode})` : ''}</p>
                        <p>ทั้งหมด: {participant.rewardCount} สิทธิ์</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[8px] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Settings className="text-pharmacy-green" size={20} />
                <h2 className="font-display text-2xl font-semibold">QR / Branch source</h2>
              </div>
              <p className="mt-1 text-sm text-ink-light">ข้อมูลจาก query: branch, qr_id, utm_campaign</p>
              <div className="mt-4 space-y-3">
                {(summary?.sources.length ?? 0) === 0 ? (
                  <p className="rounded-[8px] bg-sky-wash p-4 text-sm leading-6 text-ink-medium">
                    ยังไม่มี source ในเครื่องนี้ ลองเปิดหน้าแรกด้วย ?branch=สีลม&qr_id=front01
                  </p>
                ) : (
                  summary?.sources.map((row) => (
                    <div key={row.source} className="rounded-[8px] border border-paper-line p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{row.source}</p>
                        <p className="text-sm text-pharmacy-green">{row.total} events</p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-pharmacy-green"
                          style={{ width: `${Math.min(row.total * 20, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
