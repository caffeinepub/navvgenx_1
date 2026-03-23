import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        space: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        sans: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: "oklch(0.72 0.12 75)",
          light: "oklch(0.85 0.08 75)",
          dark: "oklch(0.60 0.14 75)",
        },
        navy: {
          DEFAULT: "oklch(0.155 0.030 265)",
          light: "oklch(0.22 0.035 265)",
          dark: "oklch(0.10 0.020 265)",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
        card: "0 1px 4px 0 rgba(15,23,42,0.06), 0 0 0 1px rgba(229,229,229,1)",
        "card-hover": "0 8px 28px 0 rgba(15,23,42,0.12)",
        gold: "0 4px 16px oklch(0.72 0.12 75 / 0.35)",
        "gold-lg": "0 8px 32px oklch(0.72 0.12 75 / 0.45)",
        nav: "0 -1px 20px 0 rgba(15,23,42,0.08), 0 0 0 1px rgba(229,229,229,0.8)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "navv-bounce": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "navv-bounce": "navv-bounce 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
