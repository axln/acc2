import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import pkg from './package.json';

// The version shown on the About page. CI bumps package.json before the build, so
// the deployed app carries the same version that is then committed back to main.
export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
});
