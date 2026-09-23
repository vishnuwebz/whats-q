/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qiyam: {
          sidebar: "#0B1528",
          sidebarHover: "#16233B",
          sidebarActive: "#1A2B49",
          sidebarBorder: "#1E293B",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          primary: "#10B981",
          primaryHover: "#059669",
          primaryLight: "#ECFDF5",
          primaryDark: "#065F46",
          dark: "#0F172A",
          muted: "#64748B",
          lightMuted: "#94A3B8",
          blue: "#3B82F6",
          blueLight: "#EFF6FF",
          purple: "#8B5CF6",
          purpleLight: "#F5F3FF",
          amber: "#F59E0B",
          amberLight: "#FFFBEB",
          red: "#EF4444",
          redLight: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        quote: ["Caveat", "Dancing Script", "Playfair Display", "cursive", "serif"],
        editorial: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        dropdown: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '150': '150',
        '200': '200',
      },
    },
  },
  plugins: [],
};
