import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "oklch(78% 0.085 10)",
          light: "oklch(93% 0.03 10)",
          dark: "oklch(60% 0.09 10)",
        },
        cream: {
          DEFAULT: "oklch(97% 0.012 70)",
          2: "oklch(94% 0.018 70)",
        },
        ink: {
          DEFAULT: "oklch(28% 0.02 70)",
          light: "oklch(55% 0.02 70)",
        },
        ivory: "#f8f4ec",
        champagne: "#efe3ce",
        beige: "#dcc8a8",
        gold: {
          DEFAULT: "oklch(72% 0.1 75)",
          light: "oklch(88% 0.055 75)",
        },
      },
      fontFamily: {
        "great-vibes": ["var(--font-great-vibes)", "cursive"],
        cormorant: ["var(--font-cormorant)", "serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at 20% 20%, rgba(248, 244, 236, 0.7), rgba(220, 200, 168, 0.45)), linear-gradient(120deg, #ffffff, #f8f4ec)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(122, 92, 44, 0.12)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        weddingPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        weddingFloat: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(6px)" },
        },
        flapOpen: {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(180deg)" },
        },
        cardSlideUp: {
          "0%": { opacity: "0", transform: "translate(-50%, 10%)" },
          "100%": { opacity: "1", transform: "translate(-50%, -115%)" },
        },
        revealUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 600ms ease-out",
        "wedding-pulse": "weddingPulse 2.2s ease-in-out infinite",
        "wedding-float": "weddingFloat 2s ease-in-out infinite",
        "flap-open": "flapOpen 0.85s cubic-bezier(0.4,0,0.2,1) forwards",
        "card-slide-up": "cardSlideUp 0.7s cubic-bezier(0.2,0,0,1) 0.45s forwards",
        "reveal-up": "revealUp 0.8s ease forwards",
        "fade-in": "fadeIn 1s ease forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

