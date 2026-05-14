import Link from "next/link";
import { SIGNS } from "@/lib/signs";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-12">
      <div className="space-y-4 pt-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Your Cosmic <span className="text-accent">Blueprint</span>
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Modern, mystical, and accurate daily horoscopes generated every midnight. Find out what the universe has planned for you.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SIGNS.map((sign) => (
          <Link 
            key={sign.id} 
            href={`/${sign.id}`}
            className="p-6 rounded-2xl bg-card border border-white/5 hover:border-accent hover:bg-accent/5 transition-all group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sign.symbol}</div>
            <h2 className="font-bold text-lg">{sign.name}</h2>
            <p className="text-xs text-white/40">{sign.date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
