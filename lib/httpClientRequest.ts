import envConfig from "@/app/config"

interface RequestOptions {
  contentType?: string
  customBearer?: string
  body?: BodyInit | Record<string, any>
  nextConfig?: RequestInit["next"]
}

export async function httpClientRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
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

  let res = await fetch(`${envConfig.NEXT_PUBLIC_URL}${url}`, {
    method,
    headers,
    body,
    next: options?.nextConfig,
  })

  let data = await res.json()

  return { status: res.status, data }
}
