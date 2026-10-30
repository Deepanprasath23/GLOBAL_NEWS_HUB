// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Editorial palette
        "midnight-backdrop": "#100e0b",
        "midnight-charcoal": "#111827",
        "deep-charcoal": "#151D29",
        "surface-primary": "#1F2937",
        "surface-secondary": "#243041",
        "surface-elevated": "#273449",
        // Emerald accent
        "emerald": "#49CF9E",
        "turquoise": "#41B79B",
        "mint": "#86B99A",
        // Reading text colors
        "text-primary": "#D1D5DB",
        "text-secondary": "#9CA3AF",
        "heading": "#F9FAFB",
        "metadata": "#94A3B8",
        // Subtle border
        "border-subtle": "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "IBM Plex Sans", "Source Sans 3", "sans-serif"],
      },
      blur: {
        // custom blur values for gradient layers (mobile/desktop handled via media queries)
        "ember-1-mobile": "113px",
        "ember-2-mobile": "125px",
        "ember-3-mobile": "200px",
        "ember-4-mobile": "138px",
        "ember-1-desktop": "162px",
        "ember-2-desktop": "180px",
        "ember-3-desktop": "260px",
        "ember-4-desktop": "198px",
      },
      inset: {
        "0": "0",
      },
    },
  },
  plugins: [],
};
