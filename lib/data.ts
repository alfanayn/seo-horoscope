import { SIGNS } from './signs';

interface SkySnapshot {
  dateStr: string;
  planetsLine: string;
  aspectsLine: string;
}

interface WeeklySkySnapshot {
  weekKey: string;
  rangeLabel: string;
  moonJourney: string;
  phaseShift: string;
  keyPlanets: string;
  ingresses: string;
  aspectsLine: string;
}

let cachedDailySky: SkySnapshot | null = null;
let cachedWeeklySky: WeeklySkySnapshot | null = null;

async function fetchTransitDay(dt: Date) {
  const url = `https://astrology-api-gamma.vercel.app/api/transits?year=${dt.getUTCFullYear()}&month=${dt.getUTCMonth() + 1}&day=${dt.getUTCDate()}&hour=12&minute=0`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json?.ok || !Array.isArray(json.planets)) {
    throw new Error('Invalid transit API response');
  }
  return json;
}

function fmtShortDate(dt: Date): string {
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function getLiveSkySnapshot(): Promise<SkySnapshot> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  if (cachedDailySky && cachedDailySky.dateStr === dateStr) {
    return cachedDailySky;
  }

  try {
    const json = await fetchTransitDay(now);
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

    cachedDailySky = {
      dateStr,
      planetsLine,
      aspectsLine: aspectsLine || 'None major',
    };
    return cachedDailySky;
  } catch (err) {
    console.warn('Daily transit API fallback triggered:', err);
    return { dateStr, planetsLine: 'Unavailable', aspectsLine: 'Unavailable' };
  }
}

async function getWeeklySkySnapshot(): Promise<WeeklySkySnapshot> {
  const d0 = new Date();
  const weekKey = d0.toISOString().slice(0, 10);

  if (cachedWeeklySky && cachedWeeklySky.weekKey === weekKey) {
    return cachedWeeklySky;
  }

  const d3 = new Date(d0.getTime() + 3 * 86400000);
  const d6 = new Date(d0.getTime() + 6 * 86400000);
  const rangeLabel = `${fmtShortDate(d0)} - ${fmtShortDate(d6)}`;

  try {
    const [j0, j3, j6] = await Promise.all([
      fetchTransitDay(d0),
      fetchTransitDay(d3),
      fetchTransitDay(d6),
    ]);

    const getSign = (j: any, name: string) =>
      j.planets.find((p: any) => p.name === name)?.sign || '';

    const moonJourney = [getSign(j0, 'Moon'), getSign(j3, 'Moon'), getSign(j6, 'Moon')]
      .filter(Boolean)
      .join(' -> ');

    const phase0 = j0.moon?.phase || '';
    const phase6 = j6.moon?.phase || '';
    const phaseShift = phase0 === phase6 ? phase0 : `${phase0} to ${phase6}`;

    const tracked = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const keyPlanets = j0.planets
      .filter((p: any) => tracked.includes(p.name))
      .map((p: any) => `${p.name} in ${p.sign}${p.retrograde ? ' (Rx)' : ''}`)
      .join(', ');

    const ingresses: string[] = [];
    for (const name of tracked) {
      const s0 = getSign(j0, name);
      const s6 = getSign(j6, name);
      if (s0 && s6 && s0 !== s6) {
        ingresses.push(`${name} shifts from ${s0} into ${s6}`);
      }
    }

    const aspectSet = new Set<string>();
    for (const j of [j0, j3, j6]) {
      for (const a of (j.aspects || []).slice(0, 3)) {
        if (a.p1 && a.p2 && a.aspect?.name) {
          aspectSet.add(`${a.p1} ${a.aspect.name} ${a.p2}`);
        }
      }
    }

    cachedWeeklySky = {
      weekKey,
      rangeLabel,
      moonJourney,
      phaseShift,
      keyPlanets,
      ingresses: ingresses.length ? ingresses.join('; ') : 'No major inner-planet sign shifts',
      aspectsLine: Array.from(aspectSet).slice(0, 6).join(', ') || 'None major',
    };
    return cachedWeeklySky;
  } catch (err) {
    console.warn('Weekly transit API fallback triggered:', err);
    return {
      weekKey,
      rangeLabel,
      moonJourney: 'Unavailable',
      phaseShift: 'Unavailable',
      keyPlanets: 'Unavailable',
      ingresses: 'Unavailable',
      aspectsLine: 'Unavailable',
    };
  }
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
  "lucky_number": "a single number between 1 and 99",
  "score": 78
}`;

  return await fetchFromClaude(prompt, 1000);
}

export async function fetchWeeklyHoroscope(signId: string) {
  const sign = SIGNS.find((s) => s.id === signId);
  if (!sign) return null;

  const sky = await getWeeklySkySnapshot();
  const skyContext =
    sky.keyPlanets !== 'Unavailable'
      ? `Week of ${sky.rangeLabel}
Moon journey this week: ${sky.moonJourney} (${sky.phaseShift}).
Planetary positions: ${sky.keyPlanets}.
Sign shifts this week: ${sky.ingresses}.
Key weekly aspects: ${sky.aspectsLine}.`
      : `Week of ${sky.rangeLabel}.`;

  const prompt = `Write a vivid, engaging weekly horoscope for ${sign.name} for the week of ${sky.rangeLabel}.
${skyContext}

Rules:
- Name 2 to 4 real planetary transits, Moon shifts, or aspects from the data above and tie them specifically to ${sign.name}.
- Make it scannable and practical with specific timing across the week (e.g., "Early week...", "Midweek...", "By the weekend...") and mention a Best Day or Watch-Out Day inside "overview".
- Tone: modern, sharp, warm, Gen Z friendly, natural English. Avoid repetitive astrology clichés like "embrace the chaos", "cosmic dance", "universe is nudging you", or "trust the journey".
- Do NOT use the words "tropical" or "western".
- Output EXACTLY as raw JSON without any markdown formatting, matching this schema:
{
  "overview": "300-420 chars",
  "love": "280-390 chars",
  "career": "280-390 chars",
  "health": "240-350 chars",
  "lucky_numbers": "three numbers separated by commas",
  "score": 82
}`;

  return await fetchFromClaude(prompt, 1400);
}

export async function fetchFromClaude(prompt: string, maxTokens = 1200) {
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
        max_tokens: maxTokens,
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
