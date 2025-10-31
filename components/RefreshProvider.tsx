'use client'
import { useSilentRefresh } from '@/hooks/useSilentRefresh'

export default function RefreshProvider() {
  useSilentRefresh()
  return null
}