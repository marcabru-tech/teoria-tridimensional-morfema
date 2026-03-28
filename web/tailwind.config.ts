import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { 
    extend: {
      colors: {
        'space-blue': '#1e40af',
        'space-green': '#16a34a',
        'space-red': '#dc2626',
      }
    } 
  },
  plugins: [],
}
export default config