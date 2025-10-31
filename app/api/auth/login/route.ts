import envConfig from '@/app/config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.status !== 200) {
    return NextResponse.json({ error: data }, { status: res.status });
  }

  const response = NextResponse.json(data, { status: 200 })
  response.cookies.set('access_token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: data.expires_in
  })

  response.cookies.set('refresh_token', data.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: data.refresh_expires_in
  })
  
  return response
}
