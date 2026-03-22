import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#002D62",
          foreground: "#ffffff",
          hover: "#003F8A",
        },
        secondary: {
          DEFAULT: "#CE1126",
          foreground: "#ffffff",
          hover: "#A50E1F",
        },
        accent: {
          DEFAULT: "#CE1126",
        },
        dr: {
          blue: "#002D62",
          red: "#CE1126",
          white: "#FFFFFF",
        },
      },
      animation: {
        "in": "fadeIn 0.2s ease-out",
        "slide-in-from-right-5": "slideInFromRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
