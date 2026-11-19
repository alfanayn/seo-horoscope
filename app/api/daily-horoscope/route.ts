import { NextResponse } from 'next/server'
import { fetchDailyHoroscope } from '@/lib/data'
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
      let horoscope: any = null
      const maxRetries = 3

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        horoscope = await fetchDailyHoroscope(sign.id)
        if (horoscope) {
          break
        }
        console.warn(`${sign.name} için deneme ${attempt} başarısız oldu. Tekrar deneniyor...`)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      if (!horoscope) {
        results.push({ sign: sign.id, status: 'error', message: 'Generation failed after 3 attempts' })
        continue
      }

      let randomNum: number
      do {
        randomNum = Math.floor(Math.random() * (99 - 8 + 1)) + 8
      } while (randomNum.toString().includes('7'))

      horoscope.lucky_number = randomNum.toString()
      horoscope.score = String(horoscope.score ?? (Math.floor(Math.random() * (99 - 50 + 1)) + 50))
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
    daily: {
      updatedAt: new Date().toISOString(), 
      ...horoscope,
    },
  },
  null,
  2
)

await commitFileToGitHub(`data/horoscopes/${sign.id}.json`, jsonContent, `Update ${sign.name} daily horoscope [skip ci]`)
      results.push({ sign: sign.id, status: 'success' })
    } catch (error) {
      results.push({ sign: sign.id, status: 'error', error: String(error) })
    }
  }

  return NextResponse.json({ ok: true, results })
}