'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function useSilentRefresh() {
  const timer = useRef<NodeJS.Timeout | null>(null)
  const isRefreshing = useRef(false)
  const router = useRouter()

  useEffect(() => {
    let stopped = false

    // Hàm gọi /api/auth/refresh và tự đặt lịch lần sau
    async function refreshAndSchedule() {
      if (isRefreshing.current || stopped) return
      isRefreshing.current = true

      try {
        console.log('🔁 Đang gọi /api/auth/refresh...')
        const res = await fetch('/api/auth/refresh', { method: 'POST' })

        if (!res.ok) {
          console.warn('⚠️ Refresh token hết hạn hoặc không tồn tại')
          return
        }

        const data = await res.json()
        const expiresIn = data.expires_in ?? 900 // mặc định 15 phút
        const nextTime = Math.max((expiresIn - 60) * 1000, 60 * 1000) // trừ 1 phút

        console.log(`✅ Refresh thành công. Lần tiếp theo sau ${nextTime / 1000}s`)

        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(refreshAndSchedule, nextTime)

        // Cập nhật lại dữ liệu user trong component server (SSR)
        router.refresh()
      } catch (err) {
        console.error('❌ Lỗi khi refresh token:', err)
      } finally {
        isRefreshing.current = false
      }
    }

    async function init() {
      try {
        const res = await fetch('/api/auth/status-lite')
        const data = await res.json()

        if (data.logged_in) {
          console.log('✅ Token còn hiệu lực, không cần refresh ngay', data.expires_in)
          const nextTime = Math.max((data.expires_in ?? 900 - 60) * 1000, 60 * 1000)
          timer.current = setTimeout(refreshAndSchedule, nextTime)
        } else {
          console.log('🔁 Token hết hạn — gọi refresh ngay')
          await refreshAndSchedule()
        }
      } catch (err) {
        console.error('❌ Lỗi khi kiểm tra trạng thái đăng nhập:', err)
      }
    }

    init()

    return () => {
      stopped = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [router])
}
