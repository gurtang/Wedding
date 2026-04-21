import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f8f4ec",
        champagne: "#efe3ce",
        beige: "#dcc8a8",
        gold: "#b4945a",
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
      },
      animation: {
        fadeInUp: "fadeInUp 600ms ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

