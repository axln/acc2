import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

// semantic colors are defined as RGB channels in app.css, so they switch with the color scheme
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				canvas: token('canvas'),
				surface: token('surface'),
				fg: token('fg'),
				muted: token('muted'),
				line: token('line'),
				primary: {
					DEFAULT: token('primary'),
					fg: token('primary-fg'),
					soft: token('primary-soft')
				},
				positive: token('positive'),
				negative: token('negative')
			},
			fontSize: {
				xs: ['0.8125rem', '1.125rem'],
				sm: ['0.9375rem', '1.375rem'],
				base: ['1.0625rem', '1.5rem'],
				lg: ['1.1875rem', '1.625rem'],
				xl: ['1.375rem', '1.875rem']
			}
		}
	},

	plugins: [typography],
	future: {
		hoverOnlyWhenSupported: true
	}
} satisfies Config;
