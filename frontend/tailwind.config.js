export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ember: { 50:'#fff3e0',100:'#ffe0b2',200:'#ffcc80',300:'#ffb74d',400:'#ffa726',500:'#ff9800',600:'#fb8c00',700:'#f57c00',800:'#ef6c00',900:'#e65100' },
        night: { 50:'#f8f7f6',100:'#ede9e4',200:'#d4cdc5',300:'#b5a99d',400:'#8f7f73',500:'#6b5d53',600:'#54453c',700:'#3d3029',800:'#2a1f18',900:'#1a1109',950:'#0d0805' }
      },
      fontFamily: {
        sans: ["'Outfit'", 'sans-serif'],
        display: ["'Playfair Display'", 'serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        float: { '0%,100%': {transform:'translateY(0)'}, '50%': {transform:'translateY(-6px)'} },
        shimmer: { '0%': {backgroundPosition:'-200% 0'}, '100%': {backgroundPosition:'200% 0'} },
        slideUp: { '0%': {opacity:0,transform:'translateY(24px)'}, '100%': {opacity:1,transform:'translateY(0)'} },
        fadeIn: { '0%': {opacity:0}, '100%': {opacity:1} }
      },
      backgroundImage: {
        'ember-glow': 'radial-gradient(ellipse at center, rgba(255,152,0,0.15) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
      }
    }
  },
  plugins: []
}
