import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cosmic Daily - Modern SEO Horoscope",
  description: "Get your daily and weekly astrological forecasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="border-b border-white/10 bg-card py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-black text-accent tracking-tighter">
              COSMIC<span className="text-foreground">DAILY</span>
            </Link>
            <nav className="space-x-6 text-sm font-medium">
              <Link href="/" className="hover:text-accent transition-colors">All Signs</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-8 mt-12 text-center text-white/50 text-sm">
          <p>© {new Date().getFullYear()} Cosmic Daily. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
