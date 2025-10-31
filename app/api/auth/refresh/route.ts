import envConfig from '@/app/config'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 })
  }

  const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/api/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${refreshToken}`,
    },
    credentials: "include",
  })

  const data = await res.json()

  if (res.status !== 200) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json(data, { status: 200 })
  response.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: data.expires_in,
  })

  // ❌ Không tạo refresh mới — Laravel vẫn giữ refresh_token cũ
  return response
}
