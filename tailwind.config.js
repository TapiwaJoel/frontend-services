/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/src/**/*.{html,ts,tsx,js,jsx}',
    './libs/**/src/**/*.{html,ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors mapped from themes.scss
        theme: {
          primary: 'var(--theme-primary-color)',
          accent: 'var(--theme-accent-color)',
          background: 'var(--theme-background-color)',
          text: 'var(--theme-text-color)',
          'text-secondary': 'var(--theme-text-secondary)',
          border: 'var(--theme-border-color)',
        },
        // Default theme colors
        default: {
          primary: '#1976d2',
          accent: '#ff4081',
          background: '#ffffff',
          text: '#212121',
          'text-secondary': '#757575',
          border: '#e0e0e0',
        },
        // Umdzidzisi brand colors
        umdzidzisi: {
          primary: '#e91e63',
          accent: '#9c27b0',
          background: '#fafafa',
          text: '#212121',
          'text-secondary': '#757575',
          border: '#e0e0e0',
        },
        // Umtengesi brand colors
        umtengesi: {
          primary: '#4caf50',
          accent: '#ff9800',
          background: '#f5f5f5',
          text: '#212121',
          'text-secondary': '#757575',
          border: '#e0e0e0',
        },
        // App selector gradient colors
        gradient: {
          purple: '#667eea',
          'purple-dark': '#764ba2',
        },
        // Gray scale from app-selector.component.scss
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        // Material Design notification colors
        success: {
          DEFAULT: '#52c41a',
          light: '#f6ffed',
        },
        error: {
          DEFAULT: '#ff4d4f',
          light: '#fff2f0',
        },
        warning: {
          DEFAULT: '#faad14',
          light: '#fffbe6',
        },
        info: {
          DEFAULT: '#1890ff',
          light: '#e6f7ff',
        },
      },
      boxShadow: {
        'theme': '0 0 0 1px var(--theme-shadow)',
        'notification': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 12px 24px rgba(102, 126, 234, 0.15)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'spin': 'spin 0.8s linear infinite',
        'dropdown-fade-in': 'dropdownFadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          from: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        spin: {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        dropdownFadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(-8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
