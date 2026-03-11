import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        virtue: {
          bg: "#0A0A0A",
          surface: "#121212",
          elevated: "#171717",
          border: "rgba(255,255,255,0.06)",
          "border-strong": "rgba(255,255,255,0.1)",
          text: "#F5F5F5",
          "text-secondary": "#A0A0A0",
          "text-muted": "#666666",
          accent: "#4C7DFF",
          "accent-secondary": "#8B7CFF",
          "accent-glow": "rgba(76,125,255,0.15)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "hero": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "section": ["28px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "panel-title": ["20px", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        "body": ["16px", { lineHeight: "1.5" }],
        "meta": ["13px", { lineHeight: "1.4" }],
        "micro": ["11px", { lineHeight: "1.3", letterSpacing: "0.04em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "panel": "12px",
        "card": "10px",
      },
      backdropBlur: {
        "panel": "12px",
      },
      boxShadow: {
        "panel": "0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
        "panel-hover": "0 2px 4px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
        "glow-accent": "0 0 20px rgba(76,125,255,0.15)",
        "glow-soft": "0 0 40px rgba(76,125,255,0.08)",
      },
      animation: {
        "slide-up": "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-slow": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "cinematic": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
