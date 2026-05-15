export const dynamic = 'force-static'
import { SIGNS, getSign } from "@/lib/signs";
import { getHoroscope } from "@/lib/horoscope";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return SIGNS.map((sign) => ({ sign: sign.id }));
}

export function generateMetadata({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  return {
    title: `${sign?.name} Daily Horoscope | Cosmic Daily`,
    description: `Read today's ${sign?.name} daily horoscope. Accurate insights on love, career, and energy.`,
  };
}

export default async function DailyHoroscope({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  if (!sign) return notFound();

const data = getHoroscope(sign.id);
const daily = data?.daily;
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 pb-4 border-b border-white/10">
        <div className="text-4xl">{sign.symbol}</div>
        <h1 className="text-4xl font-bold">{sign.name} Daily Horoscope</h1>
        <p className="text-white/60 text-sm font-mono tracking-wider">
UPDATED: {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "PENDING"}        </p>
      </div>

      {daily && daily.today_energy ? (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-card border border-white/5">
            <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
              ✨ Today's Cosmic Energy
            </h2>
            <p className="text-white/80 leading-relaxed text-lg">{daily.today_energy}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
                ❤️ Love & Connections
              </h2>
              <p className="text-white/80 leading-relaxed">{daily.love}</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                💼 Career & Goals
              </h2>
              <p className="text-white/80 leading-relaxed">{daily.career}</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🧘 Health & Wellness
              </h2>
              <p className="text-white/80 leading-relaxed">{daily.health}</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">🍀 Lucky Number</h2>
              <div className="text-6xl font-black text-white">{daily.lucky_number}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-card">
          <p className="text-white/60">Today's reading is being prepared by the stars. Check back soon.</p>
        </div>
      )}

      {/* Static SEO Content */}
      <section className="mt-16 pt-12 border-t border-white/10 prose prose-invert prose-p:text-white/70 max-w-none">
        <h2>Why Read Your {sign.name} Daily Horoscope?</h2>
        <p>Astrology provides a cosmic weather report. By understanding the daily transits, {sign.name}s can navigate challenges with grace and seize fleeting opportunities. Remember that as a {sign.element} sign, your intuition plays a massive role in how these energies manifest.</p>
        
        <h3>Frequently Asked Questions</h3>
        <div className="space-y-4 mt-6">
          <div className="p-4 bg-card rounded-lg border border-white/5">
            <h4 className="font-bold text-white mb-2">When does the daily horoscope update?</h4>
            <p className="text-sm m-0">Our horoscopes update every day precisely at midnight UTC to give you the freshest insights for your day.</p>
          </div>
          <div className="p-4 bg-card rounded-lg border border-white/5">
            <h4 className="font-bold text-white mb-2">How accurate are these readings?</h4>
            <p className="text-sm m-0">We use advanced AI combined with real-time planetary transits to craft deeply contextual and modern interpretations tailored specifically for {sign.name}.</p>
          </div>
        </div>
      </section>

      <div className="pt-8 text-center">
        <Link href={`/${sign.id}`} className="text-accent hover:underline font-medium">
          ← Back to {sign.name} Hub
        </Link>
      </div>
    </div>
  );
}
