import { SIGNS } from './signs';

interface SkySnapshot {
  dateStr: string;
  planetsLine: string;
  aspectsLine: string;
}

let cachedSky: SkySnapshot | null = null;

async function getLiveSkySnapshot(): Promise<SkySnapshot> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  if (cachedSky && cachedSky.dateStr === dateStr) {
    return cachedSky;
  }

  try {
    const url = `https://astrology-api-gamma.vercel.app/api/transits?year=${now.getUTCFullYear()}&month=${now.getUTCMonth() + 1}&day=${now.getUTCDate()}&hour=12&minute=0`;
    const res = await fetch(url);
    const json = await res.json();

    if (json?.ok && Array.isArray(json.planets)) {
      const planetsLine = json.planets
        .filter((p: any) =>
          ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.name)
        )
        .map((p: any) => `${p.name} in ${p.sign}${p.retrograde ? ' (Rx)' : ''}`)
        .join(', ');

      const aspectsLine = Array.isArray(json.aspects)
        ? json.aspects
            .slice(0, 4)
            .map((a: any) => `${a.p1} ${a.aspect?.name} ${a.p2}`)
            .join(', ')
        : '';

      cachedSky = {
        dateStr,
        planetsLine,
        aspectsLine: aspectsLine || 'None major',
      };
      return cachedSky;
    }
  } catch (err) {
    console.warn('Transit API fallback triggered:', err);
  }

  return {
    dateStr,
    planetsLine: 'Unavailable',
    aspectsLine: 'Unavailable',
  };
}

export async function fetchDailyHoroscope(signId: string) {
  const sign = SIGNS.find((s) => s.id === signId);
  if (!sign) return null;

  const sky = await getLiveSkySnapshot();
  const skyContext =
    sky.planetsLine !== 'Unavailable'
      ? `Live sky today (${sky.dateStr}): ${sky.planetsLine}.\nKey aspects today: ${sky.aspectsLine}.`
      : `Date: ${sky.dateStr}.`;

  const prompt = `Write a daily horoscope for ${sign.name} for today.
${skyContext}

Rules:
- Name 1 to 3 of today's real planetary transits or aspects naturally (such as the Moon's sign, a retrograde planet, or an exact aspect) and connect them specifically to ${sign.name}'s temperament or ruling planet.
- Tone: modern, warm, grounded, Gen Z friendly, natural English. Avoid repetitive astrology clichés like "embrace the chaos", "cosmic dance", "universe is nudging you", or "trust the journey".
- Do NOT use the words "tropical" or "western".
- Output EXACTLY as raw JSON without any markdown formatting, matching this schema:
{
  "today_energy": "150-240 chars",
  "love": "140-230 chars",
  "career": "140-230 chars",
  "health": "130-210 chars",
  "lucky_number": "a single number between 1 and 99"
}`;

  return await fetchFromClaude(prompt);
}

export async function fetchWeeklyHoroscope(signId: string) {
  const sign = SIGNS.find((s) => s.id === signId);
  if (!sign) return null;

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

  return await fetchFromClaude(prompt);
}

export async function fetchFromClaude(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('API key missing');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!data.content) throw new Error(JSON.stringify(data));

    let content = data.content[0].text.trim();
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching from Claude:', error);
    return null;
  }
}
