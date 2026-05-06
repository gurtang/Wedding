import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", preload: false });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000";

const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

const ogImageUrl = new URL("/images/wedding-hero-v2.png", metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Proslavite naš poseban dan sa nama.",
    template: "%s | Pozivnica za vencanje",
  },
  description: "Milena & Slobodan - Vencanje",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Milena & Slobodan",
    locale: "sr_RS",
    title: "Proslavite naš poseban dan sa nama.",
    description: "Milena & Slobodan - Vencanje",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Proslavite naš poseban dan sa nama.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proslavite naš poseban dan sa nama.",
    description: "Milena & Slobodan - Vencanje",
    images: [ogImageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="sr"
      className={`${manrope.variable} ${playfair.variable} ${cormorant.variable} ${greatVibes.variable} ${montserrat.variable}`}
    >
      <body className="font-[family-name:var(--font-sans)]">{children}</body>
    </html>
  );
}
