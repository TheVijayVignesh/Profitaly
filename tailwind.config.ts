import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'var(--theme-border)',
				input: 'var(--theme-border)',
				ring: 'var(--theme-primary)',
				background: 'var(--theme-background)',
				foreground: 'var(--theme-foreground)',
				primary: {
					DEFAULT: 'var(--theme-primary)',
					foreground: 'var(--theme-primaryForeground)'
				},
				secondary: {
					DEFAULT: 'var(--theme-muted)',
					foreground: 'var(--theme-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--theme-error)',
					foreground: 'var(--theme-foreground)'
				},
				muted: {
					DEFAULT: 'var(--theme-muted)',
					foreground: 'var(--theme-mutedForeground)'
				},
				accent: {
					DEFAULT: 'var(--theme-accent)',
					foreground: 'var(--theme-foreground)'
				},
				popover: {
					DEFAULT: 'var(--theme-card)',
					foreground: 'var(--theme-foreground)'
				},
				card: {
					DEFAULT: 'var(--theme-card)',
					foreground: 'var(--theme-foreground)'
				},
				sidebar: {
					DEFAULT: 'var(--theme-card)',
					foreground: 'var(--theme-foreground)',
					primary: 'var(--theme-primary)',
					'primary-foreground': 'var(--theme-primaryForeground)',
					accent: 'var(--theme-accent)',
					'accent-foreground': 'var(--theme-foreground)',
					border: 'var(--theme-border)',
					ring: 'var(--theme-primary)'
				},
				finance: {
					profit: 'var(--theme-success)',
					loss: 'var(--theme-error)',
					neutral: '#9E9E9E',
					blue: '#3498DB',
					dark: '#1A2238',
					navy: '#0D1B2A',
					accent: '#00C8C8'
				},
				glassmorphism: {
					bg: 'rgba(255, 255, 255, 0.05)',
					border: 'rgba(255, 255, 255, 0.1)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				theme: 'var(--theme-fontFamily)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)',
					},
					'50%': {
						transform: 'translateY(-10px)',
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
						boxShadow: '0 0 20px rgba(0, 200, 200, 0.3)'
					},
					'50%': {
						opacity: '0.7',
						boxShadow: '0 0 40px rgba(0, 200, 200, 0.6)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
