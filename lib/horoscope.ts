import fs from 'fs'
import path from 'path'

export function getHoroscope(signId: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'horoscopes',
      `${signId}.json`
    )

    if (!fs.existsSync(filePath)) {
      return null
    }

    const raw = fs.readFileSync(filePath, 'utf8')

    return JSON.parse(raw)
  } catch (error) {
    console.error(error)
    return null
  }
}