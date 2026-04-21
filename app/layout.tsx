import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", preload: false });

export const metadata: Metadata = {
  title: "Wedding RSVP",
  description: "Svadbene pozivnice sa RSVP funkcionalnošcu",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="font-[family-name:var(--font-sans)]">{children}</body>
    </html>
  );
}


