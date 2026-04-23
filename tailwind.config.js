/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#1E1B4B",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-1": "radial-gradient(at 40% 20%, hsla(240,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(261,100%,74%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "fade-in-up": "fadeInUp 0.5s ease-out both",
        "fade-in-up-delay": "fadeInUp 0.6s ease-out 0.1s both",
        "fade-in-up-delay2": "fadeInUp 0.6s ease-out 0.2s both",
        "slide-up": "slideUp 0.4s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-slower": "float 12s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "gradient-x": "gradientX 4s ease infinite",
        "scale-in": "scaleIn 0.3s ease-out both",
        "spin-slow": "spin 8s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "bar-fill": "barFill 1s ease-out both",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.92)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        barFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-width)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(99,102,241,0.7)" },
        },
      },
    },
  },
  plugins: [],
};
