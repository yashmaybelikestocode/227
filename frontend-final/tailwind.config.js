/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FBFAF0',
        white: '#FFFFFF',
        surface: '#FFFFFA',
        mint: '#D6F0E7',
        'mint-soft': '#EAF7F1',
        'mint-deep': '#A8DCC8',
        ink: '#14302A',
        accent: '#1F5E4E',
        muted: '#4F6B63',
        line: '#D9E3D8',
        brick: '#A8432F',
        amber: '#F0D8A0',
        'amber-text': '#5A4310',
        neutral: '#E4EAE5',
        'neutral-text': '#4F6B63',
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}
