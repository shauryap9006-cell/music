import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/store/**/*.{ts,tsx}",
    "./src/styles/**/*.{ts,tsx}",
    "./src/types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          background: "#09090B",
          surface: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
          primary: "#E2E8F0",
          secondary: "#7DD3FC",
          text: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.42)",
          dim: "rgba(255,255,255,0.22)",
          blob1: "#1E293B",
          blob2: "#0F172A",
          blob3: "#1E3A5F"
        }
      },
      fontFamily: {
        display: ["var(--font-syne)"],
        body: ["var(--font-dm-sans)"],
        mono: ["var(--font-dm-mono)"]
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0, 0, 0, 0.5)",
        glow: "0 0 40px rgba(125, 211, 252, 0.15)",
        "glow-strong": "0 0 60px rgba(125, 211, 252, 0.25)"
      },
      backdropBlur: {
        aura: "28px"
      },
      animation: {
        "slow-spin": "slow-spin 20s linear infinite",
        float: "float 10s ease-in-out infinite",
        pulseRing: "pulse-ring 2.5s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite"
      },
      keyframes: {
        "slow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" }
        },
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.08)", opacity: "0.8" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      }
    }
  },
  plugins: []
};

export default config;
