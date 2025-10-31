import envConfig from '@/app/config';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/api/me`, {
    method: "GET",
    headers: request.headers
  });

  const data = await res.json();

  if (res.status !== 200) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json(data, { status: 200 })
  return response
}