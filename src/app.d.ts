// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			transactionId?: string;
		}
		// interface Platform {}
	}

	// Replaced at build time by Vite's `define` (see vite.config.ts) with the
	// version from package.json.
	const __APP_VERSION__: string;
}

export {};
