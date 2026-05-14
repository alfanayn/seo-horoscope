import { NextResponse } from 'next/server';
import { fetchWeeklyHoroscope } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signId = searchParams.get('sign');

  if (!signId) {
    return NextResponse.json({ ok: false, message: 'Sign parameter is required.' }, { status: 400 });
  }

  const horoscope = await fetchWeeklyHoroscope(signId);

  if (!horoscope) {
    return NextResponse.json({ ok: false, message: 'Invalid zodiac sign or failed to generate.' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    horoscope
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
