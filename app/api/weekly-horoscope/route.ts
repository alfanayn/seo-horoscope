import { NextResponse } from 'next/server'
import { fetchFromClaude } from '@/lib/data'
import { commitFileToGitHub } from '@/lib/github'
import { SIGNS } from '@/lib/signs'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const results = []

  for (const sign of SIGNS) {
    try {
const prompt = `Write a weekly horoscope for ${sign.name} for the upcoming week.
Tone: modern, mystical, warm, Gen Z friendly, natural English. Avoid repetitive astrology clichés.
Output EXACTLY as raw JSON without any markdown formatting, matching this schema:
{
  "overview": "100-220 chars",
  "love": "100-220 chars",
  "career": "100-220 chars",
  "health": "100-220 chars",
  "lucky_numbers": "three numbers separated by commas"
}`

const horoscope = await fetchFromClaude(prompt)
      if (!horoscope) {
        results.push({
          sign: sign.id,
          status: 'error',
          message: 'Generation failed',
        })

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
          weekly: {
            updatedAt: new Date().toISOString(),
            ...horoscope,
          },
        },
        null,
        2
      )

      await commitFileToGitHub(
        `data/horoscopes/${sign.id}.json`,
        jsonContent,
        `Update ${sign.name} weekly horoscope`
      )

      results.push({
        sign: sign.id,
        status: 'success',
      })
    } catch (error) {
      results.push({
        sign: sign.id,
        status: 'error',
        error: String(error),
      })
    }
  }

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    results,
  })
}