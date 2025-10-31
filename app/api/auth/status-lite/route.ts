import { cookies } from "next/headers"
import jwt, { JwtPayload } from "jsonwebtoken"

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  let expires_at: Date | null = null

  if (accessToken) {
    const decoded = jwt.decode(accessToken) as JwtPayload | null
    if (decoded?.exp) {
      expires_at = new Date(decoded.exp * 1000)
    }

    return Response.json({ logged_in: true, expires_at })
  } else {
    return Response.json({ logged_in: false, expires_at })
  }

}