
export default {
  content: [
    './index.html',
    './frontend/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        display: ['Orbitron', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        neon: {
          bg: '#050508',
          surface: '#0d0d14',
          surface2: '#12121e',
          text: '#e8e8f0',
          cyan: '#00f5ff',
          pink: '#ff006e',
          lime: '#a8ff00',
          purple: '#bf00ff',
          amber: '#ffaa00',
          muted: '#5a5a70',
        },
        // Keep brutal aliases mapped to neon for backwards compat during migration
        brutal: {
          bg: '#050508',
          surface: '#0d0d14',
          text: '#e8e8f0',
          border: 'rgba(0,245,255,0.15)',
          accent: '#00f5ff',
          'accent-light': '#00f5ff',
          muted: '#5a5a70',
          green: '#a8ff00',
          'green-light': '#a8ff00',
          red: '#ff006e',
          ink: '#0d0d14',
          teal: '#00f5ff',
          amber: '#ffaa00',
          lavender: '#bf00ff',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.1)',
        'neon-pink': '0 0 20px rgba(255,0,110,0.4), 0 0 60px rgba(255,0,110,0.1)',
        'neon-lime': '0 0 20px rgba(168,255,0,0.4), 0 0 60px rgba(168,255,0,0.1)',
        'neon-purple': '0 0 20px rgba(191,0,255,0.4), 0 0 60px rgba(191,0,255,0.1)',
        'neon-amber': '0 0 20px rgba(255,170,0,0.4), 0 0 60px rgba(255,170,0,0.1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'grid-shift': 'gridShift 20s linear infinite',
        'pulse-glow-1': 'pulseGlow1 4s ease-in-out infinite alternate',
        'pulse-glow-2': 'pulseGlow2 6s ease-in-out infinite alternate',
        'nav-glow': 'navGlow 4s linear infinite',
        'blink': 'blink 1.2s step-end infinite',
        'glitch': 'glitch 8s infinite',
        'dot-pulse': 'dotPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
        },
        gridShift: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(60px)' },
        },
        pulseGlow1: {
          from: { opacity: 0.6, transform: 'scale(1)' },
          to: { opacity: 1, transform: 'scale(1.1)' },
        },
        pulseGlow2: {
          from: { opacity: 0.4, transform: 'scale(1.1)' },
          to: { opacity: 0.8, transform: 'scale(1)' },
        },
        navGlow: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        glitch: {
          '0%, 90%, 100%': { textShadow: 'none' },
          '92%': { textShadow: '-2px 0 #00f5ff, 2px 0 #ff006e', transform: 'skewX(-1deg)' },
          '94%': { textShadow: '2px 0 #00f5ff, -2px 0 #ff006e', transform: 'skewX(1deg)' },
          '96%': { textShadow: 'none', transform: 'skewX(0)' },
        },
        dotPulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }
    },
  },
  plugins: [],
}
