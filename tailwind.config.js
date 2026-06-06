/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // ← 确保包含 .tsx
  ],
  safelist: [
    "text-[var(--crt-text)]",
    "text-[var(--crt-accent)]",
    "text-[var(--crt-dim)]",
    "bg-[var(--crt-bg)]",
    "bg-[var(--crt-panel)]",
    "border-[var(--crt-border)]",
    "border-[var(--crt-border-strong)]",
    "shadow-[0_0_12px_var(--crt-accent)]",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f9fe',
        surface: '#f9f9fe',
        'on-surface': '#1a1c1f',
        'on-surface-variant': '#424655',
        'outline-variant': '#c3c6d8',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e8e8ed',
        'primary-container': '#1562f0',
        'on-primary-container': '#edefff',
      },
    },
  },
  plugins: [],
};