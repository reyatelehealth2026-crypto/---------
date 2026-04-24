import liff from '@line/liff'

export interface LineProfile {
  userId: string
  displayName: string
  pictureUrl?: string
}

export interface LineSession {
  configured: boolean
  inClient: boolean
  profile: LineProfile | null
  accessToken: string | null
  friendFlag: boolean | null
  error: string | null
}

type LiffWithRequestFriendship = typeof liff & {
  requestFriendship?: () => Promise<unknown>
}

const liffId = import.meta.env.VITE_LIFF_ID as string | undefined

const explainFriendshipError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  if (
    message.includes('friendship') ||
    message.includes('status 400') ||
    message.includes('FORBIDDEN')
  ) {
    return new Error(
      'LINE OA ยังไม่พร้อมสำหรับตรวจสถานะเพื่อน: ต้อง link @clinicya เข้ากับ LINE Login channel 2008876929, เปิด Add friend option, ใช้ scope profile และตั้ง LIFF size เป็น Full',
    )
  }
  return error instanceof Error ? error : new Error('ไม่สามารถตรวจสถานะเพื่อน LINE OA ได้')
}

export const getLiffEntryUrl = () => (liffId ? `https://liff.line.me/${liffId}` : null)
export const getLineOfficialAccountUrl = () => {
  const oaId = import.meta.env.VITE_LINE_OA_ID || '@clinicya'
  return `https://line.me/R/ti/p/${encodeURIComponent(oaId)}`
}

export const initializeLine = async (): Promise<LineSession> => {
  if (!liffId) {
    return {
      configured: false,
      inClient: false,
      profile: null,
      accessToken: null,
      friendFlag: null,
      error: 'ยังไม่ได้ตั้งค่า VITE_LIFF_ID',
    }
  }

  try {
    await liff.init({ liffId })
    if (!liff.isLoggedIn()) {
      liff.login()
      return {
        configured: true,
        inClient: liff.isInClient(),
        profile: null,
        accessToken: null,
        friendFlag: null,
        error: 'กำลังเข้าสู่ระบบ LINE',
      }
    }

    const profile = await liff.getProfile()
    return {
      configured: true,
      inClient: liff.isInClient(),
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
      accessToken: liff.getAccessToken(),
      friendFlag: null,
      error: null,
    }
  } catch (error) {
    return {
      configured: true,
      inClient: false,
      profile: null,
      accessToken: null,
      friendFlag: null,
      error: error instanceof Error ? error.message : 'ไม่สามารถเริ่ม LIFF ได้',
    }
  }
}

export const requestLineFriendship = async () => {
  if (!liffId) throw new Error('ยังไม่ได้ตั้งค่า VITE_LIFF_ID')
  const liffWithFriendship = liff as LiffWithRequestFriendship

  try {
    if (typeof liffWithFriendship.requestFriendship === 'function') {
      await liffWithFriendship.requestFriendship()
    } else if (liff.isApiAvailable('openWindow')) {
      const oaId = import.meta.env.VITE_LINE_OA_ID || '@clinicya'
      liff.openWindow({
        url: `https://line.me/R/ti/p/${encodeURIComponent(oaId)}`,
        external: false,
      })
    }
  } catch (error) {
    throw explainFriendshipError(error)
  }

  try {
    const friendship = await liff.getFriendship()
    if (!friendship.friendFlag) {
      throw new Error('ยังตรวจไม่พบว่าเพิ่มเพื่อน LINE OA แล้ว')
    }
    return friendship.friendFlag
  } catch (error) {
    throw explainFriendshipError(error)
  }
}

export const openLineOfficialAccount = async () => {
  const url = getLineOfficialAccountUrl()
  try {
    if (liffId) {
      await liff.init({ liffId })
      if (liff.isApiAvailable('openWindow')) {
        liff.openWindow({ url, external: false })
        return
      }
    }
  } catch {
    // Fall back to a regular window open below.
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const shareCampaignToLine = async () => {
  if (!liffId) throw new Error('ยังไม่ได้ตั้งค่า VITE_LIFF_ID')
  if (!liff.isApiAvailable('shareTargetPicker')) {
    throw new Error('ยังไม่ได้เปิด shareTargetPicker ใน LINE Developers Console')
  }

  await liff.shareTargetPicker([
    {
      type: 'text',
      text: `มาใช้สิทธิ์ ${import.meta.env.VITE_CAMPAIGN_TITLE || 'สิทธิพิเศษจาก CNY HEALTHCARE'} ผ่าน LINE @clinicya: ${window.location.href}`,
    },
  ])
}
