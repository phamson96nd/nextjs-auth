import envConfig from '@/app/config'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return Response.json({ logged_in: false })
  }

  try {
    const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (res. status !== 200) {
      return Response.json({ logged_in: false })
    }

    return Response.json({ logged_in: true })
  } catch {
    return Response.json({ logged_in: false })
  }
}
