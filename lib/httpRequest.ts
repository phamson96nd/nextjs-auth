import envConfig from "@/app/config"
import { cookies } from "next/headers"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface RequestOptions {
  contentType?: string
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
  const headers: HeadersInit = {
    "Authorization": `Bearer ${accessToken}`,
  }
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

  let res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
    method,
    headers,
    body,
    next: options?.nextConfig,
  })

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${envConfig.NEXT_PUBLIC_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    })

    if (refreshRes.status === 200) {
      res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
        method,
        headers,
        body,
        next: options?.nextConfig,
      })
    } else {
      return { status: 401, data: { message: "Token expired, please login again" } }
    }
  }

  const data = await res.json()
  return { status: res.status, data }
}
