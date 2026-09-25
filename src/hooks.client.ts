import type { ClientInit } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { base } from '$app/paths';
import { initDb } from './lib/db';

export const init: ClientInit = async () => {
	await initDb();
	// console.log('Client init finished');

	if (!dev && 'serviceWorker' in navigator) {
		navigator.serviceWorker.register(`${base}/service-worker.js`, { type: 'module' });
	}
};
