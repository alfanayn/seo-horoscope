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

  const prompt = `Write a weekly horoscope for ${sign.name} for the upcoming week.
Tone: modern, mystical, warm, Gen Z friendly, natural English. Avoid repetitive astrology clichés.
Output EXACTLY as raw JSON without any markdown formatting, matching this schema:
{
  "overview": "100-220 chars",
  "love": "100-220 chars",
  "career": "100-220 chars",
  "health": "100-220 chars",
  "lucky_numbers": "three numbers separated by commas"
}`;

  try {
    // Cache the fetch result for 7 days (604800 seconds)
    // Wait, let's use 43200 (12 hours) so it's always fresh enough
    // For weekly, caching for 3-4 days could be fine, but let's stick to 43200 (12h) to be safe.
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
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    const data = await response.json();
    if (!data.content) throw new Error(JSON.stringify(data));
    
    let content = data.content[0].text.trim();
    
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
