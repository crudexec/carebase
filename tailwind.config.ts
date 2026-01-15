import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Modern color palette with better contrast
      colors: {
        // Background colors
        background: {
          DEFAULT: "#F8FAFC",
          secondary: "#F1F5F9",
          tertiary: "#FFFFFF",
        },
        // Foreground/text colors
        foreground: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          tertiary: "#94A3B8",
        },
        // Border colors
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
        },
        // Primary - Blue with good contrast
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#DBEAFE",
          foreground: "#FFFFFF",
        },
        // Success - Green
        success: {
          DEFAULT: "#22C55E",
          hover: "#16A34A",
          light: "#DCFCE7",
          foreground: "#FFFFFF",
        },
        // Warning - Amber
        warning: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          light: "#FEF3C7",
          foreground: "#FFFFFF",
        },
        // Error - Red
        error: {
          DEFAULT: "#EF4444",
          hover: "#DC2626",
          light: "#FEE2E2",
          foreground: "#FFFFFF",
        },
        // Info - Purple
        info: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          light: "#EDE9FE",
          foreground: "#FFFFFF",
        },
        // Sidebar
        sidebar: {
          DEFAULT: "#1E293B",
          hover: "#334155",
          active: "#3B82F6",
          text: "#CBD5E1",
          "text-active": "#FFFFFF",
        },
        // Role-specific colors (more saturated)
        role: {
          admin: "#C084FC",
          "ops-manager": "#38BDF8",
          clinical: "#34D399",
          staff: "#FBBF24",
          supervisor: "#F472B6",
          carer: "#4ADE80",
          sponsor: "#A3E635",
        },
        // Severity colors
        severity: {
          low: "#86EFAC",
          medium: "#FDE047",
          high: "#FDBA74",
          critical: "#FCA5A5",
        },
      },
      // Typography
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        "heading-1": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-2": ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        "heading-3": ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
        tiny: ["0.6875rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      // Border radius
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      // Shadows
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      // Spacing
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      // Animation
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease",
        slideUp: "slideUp 0.2s ease",
        slideDown: "slideDown 0.2s ease",
      },
    },
  },
  plugins: [],
};

export default config;
