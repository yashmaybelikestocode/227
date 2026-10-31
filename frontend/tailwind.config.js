/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        mist: '#F3F6FB',
        midnight: '#12203F',
        navy: '#1A2F5C',
        muted: '#55607A',
        line: '#E3E7EF',
        blush: {
          DEFAULT: '#FBE4E9',
          soft: '#FEF3F5',
          deep: '#EDB8C4',
        },
        rose: {
          DEFAULT: '#A8325A',
        },
        postponed: {
          bg: '#F7D3DB',
          text: '#5B1F33',
        },
        neutralBadge: {
          bg: '#E8ECF3',
          text: '#55607A',
        },
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}
