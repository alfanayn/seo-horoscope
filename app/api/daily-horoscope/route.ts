import { NextResponse } from 'next/server'
import { fetchFromClaude } from '@/lib/data' // Yeni helper'ı çağırıyoruz
import { commitFileToGitHub } from '@/lib/github'
import { SIGNS } from '@/lib/signs'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const results = []

  for (const sign of SIGNS) {
    try {
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

      const horoscope = await fetchFromClaude(prompt); 

      if (!horoscope) {
        results.push({ sign: sign.id, status: 'error', message: 'Generation failed' })
        continue
      }

const existingResponse = await fetch(
  `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/data/horoscopes/${sign.id}.json?t=${Date.now()}`,
  {
    cache: 'no-store'
  }
)

let existingData: any = {}

if (existingResponse.ok) {
  existingData = await existingResponse.json()
}

const jsonContent = JSON.stringify(
  {
    ...existingData,
    updatedAt: new Date().toISOString(),
    daily: horoscope,
  },
  null,
  2
)

      await commitFileToGitHub(`data/horoscopes/${sign.id}.json`, jsonContent, `Update ${sign.name} daily horoscope`)
      results.push({ sign: sign.id, status: 'success' })
    } catch (error) {
      results.push({ sign: sign.id, status: 'error', error: String(error) })
    }
  }

  return NextResponse.json({ ok: true, results })
}