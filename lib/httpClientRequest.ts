import envConfig from "@/app/config"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface RequestOptions {
  contentType?: string
  body?: BodyInit | Record<string, any>
}

export async function httpClientRequest(
  method: HttpMethod,
  url: string,
  options?: RequestOptions
) {
  const contentType = options?.contentType ?? "application/json"
  const headers: HeadersInit = {}

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

  async function sendRequest(token?: string) {
    const reqHeaders: HeadersInit = {
      ...(headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
      method,
      headers: reqHeaders,
      body,
    })

    return res
  }

  let res = await sendRequest()

  if (res.status === 401) {
    console.warn("⚠️ Access token expired → Refreshing...")

    const refreshRes = await fetch(`${envConfig.NEXT_PUBLIC_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (refreshRes.status === 200) {
      const data = await refreshRes.json()
      const newAccessToken = data.access_token

      if (newAccessToken) {
        res = await sendRequest(newAccessToken)
      } else {
        return { status: 401, data: { message: "Token refresh failed" } }
      }
    } else {
      return { status: 401, data: { message: "Token expired, please login again" } }
    }
  }
  const data = await res.json()
  
  return { status: res.status, data }
}
