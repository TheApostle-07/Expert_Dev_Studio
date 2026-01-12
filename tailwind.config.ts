import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        richblack: "#00171F",
        prussian: "#003459",
        cerulean: "#007EA7",
        platinum: "#E5E5E5",
        accent: "#FCA311",
      },
      container: { center: true, padding: "1rem" },
      fontFamily: {
        sans: ["Poppins", "system-ui", "ui-sans-serif", "Segoe UI", "Arial"],
        body: ["Montserrat", "system-ui", "ui-sans-serif", "Segoe UI", "Arial"],
      },
      boxShadow: { soft: "0 10px 30px -15px rgba(0,0,0,0.15)" },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
