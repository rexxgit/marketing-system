/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ===== COLORS =====
      colors: {
        // Dark Theme Base
        'dark-bg': '#0a0e1a',
        'dark-secondary': '#0c1120',
        'dark-tertiary': '#050810',
        
        // Glassmorphism
        'glass': 'rgba(255, 255, 255, 0.04)',
        'glass-border': 'rgba(255, 255, 255, 0.06)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-active': 'rgba(255, 255, 255, 0.12)',
        
        // Accent Colors
        'accent-indigo': '#6366f1',
        'accent-pink': '#ec4899',
        'accent-purple': '#8b5cf6',
        'accent-blue': '#3b82f6',
        'accent-cyan': '#06b6d4',
        'accent-green': '#10b981',
        
        // Text Colors
        'text-primary': '#F1F5F9',
        'text-secondary': '#CBD5E1',
        'text-muted': '#94A3B8',
        'text-dim': '#64748B',
        
        // Status Colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
      },
      
      // ===== BACKDROP BLUR =====
      backdropBlur: {
        'glass': '24px',
        'glass-light': '12px',
        'glass-heavy': '48px',
      },
      
      // ===== BOX SHADOWS =====
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.5)',
        'glow-indigo': '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-pink': '0 0 40px rgba(236, 72, 153, 0.15)',
        'glow-purple': '0 0 40px rgba(139, 92, 246, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'button-glow': '0 8px 30px rgba(99, 102, 241, 0.35)',
      },
      
      // ===== BORDER RADIUS =====
      borderRadius: {
        'glass': '16px',
        'glass-sm': '12px',
        'glass-lg': '20px',
        'glass-xl': '24px',
      },
      
      // ===== ANIMATIONS =====
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-out': 'slideOut 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      
      // ===== KEYFRAMES =====
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      
      // ===== BACKGROUND IMAGE =====
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at 20% 50%, #111827 0%, #0a0e1a 70%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.05))',
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-accent': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-success': 'linear-gradient(135deg, #10b981, #34d399)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      },
      
      // ===== FONT FAMILY =====
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      // ===== SPACING =====
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      // ===== TRANSITION =====
      transitionProperty: {
        'glass': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
