/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        richblack: "#00171F",
        prussian:  "#003459",
        cerulean:  "#007EA7",
        platinum:  "#E5E5E5",
        accent:    "#FCA311",
      },
      boxShadow: { soft: "0 10px 30px -15px rgba(0,0,0,.15)" },
      container: { center: true, padding: "1rem" },
      fontFamily: {
        sans: ["Poppins","system-ui","ui-sans-serif","Segoe UI","Arial"],
        body: ["Montserrat","system-ui","ui-sans-serif","Segoe UI","Arial"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
