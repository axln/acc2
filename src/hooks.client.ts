import type { ClientInit } from '@sveltejs/kit';
import { initDb } from './lib/db';

export const init: ClientInit = async () => {
	await initDb();
	// console.log('Client init finished');
};
