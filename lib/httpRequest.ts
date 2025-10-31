import envConfig from "@/app/config"
import { cookies } from "next/headers"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface RequestOptions {
  contentType?: string
  customBearer?: string
  body?: BodyInit | Record<string, any>
  nextConfig?: RequestInit["next"]
}

export const httpRequest = async (
  method: HttpMethod,
  url: string,
  options?: RequestOptions
) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value

  const contentType = options?.contentType ?? "application/json"
  const bearerToken = options?.customBearer ?? accessToken

  const headers: HeadersInit = {}
  if (bearerToken) headers["Authorization"] = `Bearer ${bearerToken}`
  if (contentType && !(options?.body instanceof FormData)) {
    headers["Content-Type"] = contentType
  }

  let body: BodyInit | undefined
  if (options?.body) {
    if (contentType === "application/json" && !(options.body instanceof FormData)) {
      body = JSON.stringify(options.body)
    } else {
      body = options.body as BodyInit
    }
  }

  // 🔹 Gọi API chính
  let res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
    method,
    headers,
    body,
    next: options?.nextConfig,
  })

  // 🔁 Nếu hết hạn access token
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${envConfig.NEXT_PUBLIC_URL}/api/auth/refresh`, {
      method: "POST",
      // credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    })

    if (refreshRes.status === 200) {
      // ⚡ Retry request sau khi refresh thành công
      res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
        method,
        headers,
        body,
        next: options?.nextConfig,
      })
    } else {
      // Refresh token cũng hết hạn
      return { status: 401, data: { message: "Token expired, please login again" } }
    }
  }

  const data = await res.json()
  return { status: res.status, data }
}
