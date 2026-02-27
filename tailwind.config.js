/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep dark theme with green highlight
        primary: '#4ade80', // Green highlight for buttons
        'primary-dark': '#22c55e',
        secondary: '#14B8A6', // Teal accent
        success: '#22C55E', // Green
        warning: '#F59E0B', // Amber
        danger: '#EF4444', // Red
        late: '#A855F7', // Purple
        // Deep dark backgrounds
        'dark-bg': '#1a1a1a',
        'dark-surface': '#101010',
        'dark-elevated': '#2a2a2a',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      boxShadow: {
        // Subtle 3D shadows
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Neon glow effects
        'glow-primary': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
        // Inner shadows for depth
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '10px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}
