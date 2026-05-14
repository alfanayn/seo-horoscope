import { NextResponse } from 'next/server';
import { SIGNS } from '@/lib/signs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signId = searchParams.get('sign');

  if (!signId) {
    return NextResponse.json({ ok: false, message: 'Sign parameter is required.' }, { status: 400 });
  }

  const sign = SIGNS.find((s) => s.id === signId);
  if (!sign) {
    return NextResponse.json({ ok: false, message: 'Invalid zodiac sign.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, message: 'API key missing' }, { status: 500 });
  }

  const prompt = `Write a daily horoscope for ${sign.name} for today.
Tone: modern, mystical, warm, Gen Z friendly, natural English. Avoid repetitive astrology clichés.
Output EXACTLY as raw JSON without any markdown formatting, matching this schema:
{
  "today_energy": "100-220 chars",
  "love": "100-220 chars",
  "career": "100-220 chars",
  "health": "100-220 chars",
  "lucky_number": "a single number between 1 and 99"
}`;

  try {
    // We use next: { revalidate: 43200 } to cache the fetch result for 12 hours.
    // This guarantees you only pay for a few API calls per day per sign, while keeping it updated daily!
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
      next: { revalidate: 43200 }
    });

    const data = await response.json();
    if (!data.content) throw new Error(JSON.stringify(data));
    
    let content = data.content[0].text.trim();
    
    // Safety measure: remove any markdown wrapping the model might accidentally add
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      ok: true,
      horoscope: parsed
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (err: any) {
    console.error(`Error generating for ${sign.name}:`, err.message);
    return NextResponse.json({ ok: false, message: 'Failed to generate horoscope' }, { status: 500 });
  }
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
