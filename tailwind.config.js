/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        color1: "#3D12FA",
        color2: "#6B6B6B",
        color3: "#F4F8FC",
        color4: "#9EA5AD",
        color5: "#FB0800",
        color6: "#FD8C05",
        color7: "#E8E8E8",
        color8: "#BECAD6",
        color9: "#84C953",
        color10: "#018221",
        color11: "#9BACC0",
        color12: "#FAFAFA",
      }
    },
  },
  plugins: [],
}

