/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Cyber-Industrial Palette
				void: {
					DEFAULT: '#000000',
					50: '#0a0a0a',
					100: '#141414',
					200: '#1a1a1a',
					300: '#262626',
					400: '#333333'
				},
				electric: {
					DEFAULT: '#00D9FF',
					50: '#E6F9FF',
					100: '#B3F0FF',
					200: '#80E7FF',
					300: '#4DDEFF',
					400: '#1AD5FF',
					500: '#00D9FF',
					600: '#00B8D9',
					700: '#0097B3',
					800: '#00768D',
					900: '#005567'
				},
				signal: {
					DEFAULT: '#FFFFFF',
					50: '#F5F5F5',
					dim: '#CCCCCC',
					muted: '#999999'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Space Grotesk', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'Georgia', 'serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			backdropBlur: {
				xs: '2px'
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				}
			}
		}
	},
	plugins: []
};
