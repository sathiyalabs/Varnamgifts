export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  safelist: ["theme-german-silver", "theme-brass", "theme-trending", "theme-corporate"],
  theme: {
    extend: {
      colors: { gold: "#D4AF37", brass: "#C5A059", cream: "#FDFBF7", ink: "#1A1A1A", maroon: "#5C001E", teal: "#004B49" },
      fontFamily: { sans: ["Inter", "sans-serif"], display: ["Playfair Display", "Georgia", "serif"] },
    },
  },
  plugins: [],
};
