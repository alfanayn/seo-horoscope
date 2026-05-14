import fs from 'fs';
import path from 'path';

export function getHoroscopeData(sign: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'horoscopes', `${sign.toLowerCase()}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}
