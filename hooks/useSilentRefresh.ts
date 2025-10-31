'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useSilentRefresh() {
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)
  const isRefreshing = useRef(false)
  const router = useRouter()

  useEffect(() => {
    console.log('Running useSilentRefresh')
    let stopped = false

    async function scheduleRefresh() {
      if (isRefreshing.current || stopped) return
      isRefreshing.current = true

      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (res.status !== 200) {
          console.warn('⚠️ Refresh token hết hạn hoặc không tồn tại')
          return
        }

        const data = await res.json()
        const expiresIn = data.expires_in || 900
        const nextInterval = Math.max((expiresIn - 60) * 1000, 60 * 1000)
        console.log(`🔁 Next silent refresh in ${nextInterval / 1000}s`)

        if (refreshTimer.current) clearTimeout(refreshTimer.current)
        refreshTimer.current = setTimeout(scheduleRefresh, nextInterval)

        router.refresh()
      } catch (err) {
        console.error('❌ Silent refresh error:', err)
      } finally {
        isRefreshing.current = false
      }
    }

    async function init() {
      try {
        const check = await fetch('/api/auth/status')
        const { logged_in } = await check.json()

        if (logged_in) {
          console.log('✅ Access token còn hiệu lực, không gọi refresh ban đầu')
          return
        }

        console.log('🔁 Access token hết hạn, bắt đầu silent refresh...')
        await scheduleRefresh()
      } catch (err) {
        console.error('❌ Error checking auth status:', err)
      }
    }

    init()

    return () => {
      stopped = true
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
  }, [])
}
