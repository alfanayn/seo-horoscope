import { SIGNS, getSign } from "@/lib/signs";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return SIGNS.map((sign) => ({ sign: sign.id }));
}

export function generateMetadata({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  return {
    title: `${sign?.name} Horoscope Hub | Cosmic Daily`,
    description: `Everything you need to know about ${sign?.name} astrology, including daily forecasts, weekly insights, and personality traits.`,
  };
}

export default function SignPage({ params }: { params: { sign: string } }) {
  const sign = getSign(params.sign);
  if (!sign) return notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <div className="text-6xl">{sign.symbol}</div>
        <h1 className="text-4xl font-bold">{sign.name} Hub</h1>
        <p className="text-white/60">{sign.date} • {sign.element} Element</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href={`/${sign.id}/daily-horoscope`} className="p-8 rounded-2xl bg-card border border-white/10 hover:border-accent hover:bg-accent/5 transition-all text-center group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Daily Horoscope</h2>
          <p className="text-white/60 text-sm">Today's energy, love, career, and luck.</p>
        </Link>
        <Link href={`/${sign.id}/weekly-horoscope`} className="p-8 rounded-2xl bg-card border border-white/10 hover:border-accent hover:bg-accent/5 transition-all text-center group">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">Weekly Horoscope</h2>
          <p className="text-white/60 text-sm">The 7-day overarching cosmic forecast.</p>
        </Link>
      </div>

      {/* Evergreen SEO Content */}
      <section className="mt-16 prose prose-invert prose-p:text-white/70 prose-headings:text-white max-w-none bg-card p-8 rounded-2xl border border-white/5">
        <h2>About {sign.name}</h2>
        <p>
          {sign.name} is a powerful {sign.element} sign known for unique traits and characteristics. 
          People born under this sign are often deeply connected to their cosmic ruler and the natural flow of the universe. 
          Understanding a {sign.name}'s true nature requires looking past the surface into their profound spiritual depths.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-8 mt-8">
          <div>
            <h3>Personality Traits</h3>
            <ul>
              <li><strong>Element:</strong> {sign.element}</li>
              <li><strong>Ruling Energy:</strong> Dynamic & expressive</li>
              <li><strong>Modality:</strong> Cardinal/Fixed/Mutable</li>
            </ul>
          </div>
          <div>
            <h3>Strengths & Weaknesses</h3>
            <ul>
              <li className="text-green-400"><strong>Strengths:</strong> Passionate, loyal, intuitive, authentic</li>
              <li className="text-red-400"><strong>Weaknesses:</strong> Stubborn, easily misunderstood, intense</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
