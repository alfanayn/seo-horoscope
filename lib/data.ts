import { SIGNS } from './signs';

export async function fetchDailyHoroscope(signId: string) {
  const sign = SIGNS.find((s) => s.id === signId);
  if (!sign) return null;

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

  return await fetchFromClaude(prompt, 43200);
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

  return await fetchFromClaude(prompt, 86400);
}

async function fetchFromClaude(prompt: string, revalidateTime: number) {
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
      next: { revalidate: revalidateTime }
    });

    const data = await response.json();
    if (!data.content) throw new Error(JSON.stringify(data));
    
    let content = data.content[0].text.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching from Claude:', error);
    return null;
  }
}
