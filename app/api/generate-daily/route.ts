import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SIGNS } from '@/lib/signs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Basic security to ensure only your cron job can trigger this
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  const results = [];

  for (const sign of SIGNS) {
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (!data.content) throw new Error(JSON.stringify(data));
      
      let content = data.content[0].text.trim();
      
      // Safety measure: remove any markdown wrapping the model might accidentally add
      if (content.startsWith('\`\`\`json')) {
        content = content.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (content.startsWith('\`\`\`')) {
        content = content.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      const parsed = JSON.parse(content);
      
      const dirPath = path.join(process.cwd(), 'data', 'horoscopes');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${sign.id}.json`);
      let existing = { daily: {}, weekly: {} };
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      
      existing.daily = {
        updatedAt: new Date().toISOString(),
        ...parsed
      };
      
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      results.push({ sign: sign.id, status: 'success' });
      
    } catch (err: any) {
      console.error(`Error generating for ${sign.name}:`, err.message);
      results.push({ sign: sign.id, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
}
