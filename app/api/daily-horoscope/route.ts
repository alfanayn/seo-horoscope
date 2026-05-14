import { NextResponse } from 'next/server';
import { getHoroscopeData } from '@/lib/data';
import { SIGNS } from '@/lib/signs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signId = searchParams.get('sign');

  if (!signId) {
    return NextResponse.json({ ok: false, message: 'Sign parameter is required.' }, { status: 400 });
  }

  const isValidSign = SIGNS.some((s) => s.id === signId);
  if (!isValidSign) {
    return NextResponse.json({ ok: false, message: 'Invalid zodiac sign.' }, { status: 400 });
  }

  const data = getHoroscopeData(signId);

  if (!data || !data.daily) {
    return NextResponse.json({ ok: false, message: 'Horoscope data not found.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    horoscope: data.daily
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
