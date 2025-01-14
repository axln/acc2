import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['InterVariable', ...defaultTheme.fontFamily.sans]
			}
		}
	},

	plugins: [typography]
} satisfies Config;
