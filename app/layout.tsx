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

function withProtocol(value?: string) {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function isLocalhost(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

const preferredSiteUrl =
  withProtocol(process.env.NEXT_PUBLIC_BASE_URL) ||
  withProtocol(process.env.NEXT_PUBLIC_SITE_URL) ||
  withProtocol(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ||
  withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  withProtocol(process.env.NEXT_PUBLIC_VERCEL_URL) ||
  withProtocol(process.env.VERCEL_URL) ||
  "https://pozivnicazavencanje.vercel.app";

const vercelFallbackUrl =
  withProtocol(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ||
  withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  withProtocol(process.env.NEXT_PUBLIC_VERCEL_URL) ||
  withProtocol(process.env.VERCEL_URL);

const siteUrl =
  preferredSiteUrl && isLocalhost(preferredSiteUrl) && vercelFallbackUrl
    ? vercelFallbackUrl
    : preferredSiteUrl || "https://pozivnicazavencanje.vercel.app";

const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

const ogImageUrl = new URL("/images/wedding-og-v4.jpg", metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Proslavite naš poseban dan sa nama.",
    template: "%s | Pozivnica za venčanje",
  },
  description: "Personalizovana pozivnica za venčanje",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: new URL("/", metadataBase).toString(),
    siteName: "Pozivnica za venčanje",
    locale: "sr_RS",
    title: "Proslavite naš poseban dan sa nama.",
    description: "Personalizovana pozivnica za venčanje",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Proslavite naš poseban dan sa nama.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proslavite naš poseban dan sa nama.",
    description: "Personalizovana pozivnica za venčanje",
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
