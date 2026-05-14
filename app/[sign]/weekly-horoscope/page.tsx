import { SIGNS, getSign } from "@/lib/signs";
import { fetchWeeklyHoroscope } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return SIGNS.map((sign) => ({ sign: sign.id }));
}

export function generateMetadata({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  return {
    title: `${sign?.name} Weekly Horoscope | Cosmic Daily`,
    description: `Read your ${sign?.name} weekly horoscope. A 7-day forecast covering love, career, and overall energy.`,
  };
}

export default async function WeeklyHoroscope({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  if (!sign) return notFound();

  const weekly = await fetchWeeklyHoroscope(sign.id);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 pb-4 border-b border-white/10">
        <div className="text-4xl">{sign.symbol}</div>
        <h1 className="text-4xl font-bold">{sign.name} Weekly Horoscope</h1>
        <p className="text-white/60 text-sm font-mono tracking-wider">
          UPDATED: {weekly?.updatedAt ? new Date(weekly.updatedAt).toLocaleDateString() : "PENDING"}
        </p>
      </div>

      {weekly && weekly.overview ? (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-card border border-white/5">
            <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
              🌟 Week Overview
            </h2>
            <p className="text-white/80 leading-relaxed text-lg">{weekly.overview}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
                ❤️ Romance & Relationships
              </h2>
              <p className="text-white/80 leading-relaxed">{weekly.love}</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                💼 Ambitions & Money
              </h2>
              <p className="text-white/80 leading-relaxed">{weekly.career}</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🧘 Physical & Mental Health
              </h2>
              <p className="text-white/80 leading-relaxed">{weekly.health}</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-white/5 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">🍀 Lucky Numbers</h2>
              <div className="text-4xl font-black text-white">{weekly.lucky_numbers}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-card">
          <p className="text-white/60">This week's reading is being prepared by the stars. Check back soon.</p>
        </div>
      )}

      {/* Static SEO Content */}
      <section className="mt-16 pt-12 border-t border-white/10 prose prose-invert prose-p:text-white/70 max-w-none">
        <h2>Navigating the Week as a {sign.name}</h2>
        <p>A weekly forecast offers a broader perspective than daily insights. As a {sign.element} sign, use this overarching guidance to plan your important meetings, romantic dates, and self-care routines effectively.</p>
        
        <h3>Weekly Advice for {sign.name}</h3>
        <ul>
          <li><strong>Reflect:</strong> Take time each Sunday to align your intentions.</li>
          <li><strong>Act:</strong> Use your {sign.element} energy to push through midweek slumps.</li>
          <li><strong>Rest:</strong> Pay attention to your health readings to avoid burnout.</li>
        </ul>
      </section>

      <div className="pt-8 text-center">
        <Link href={`/${sign.id}`} className="text-accent hover:underline font-medium">
          ← Back to {sign.name} Hub
        </Link>
      </div>
    </div>
  );
}
