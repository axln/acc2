import type { ClientInit } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { base } from '$app/paths';
import { initDb } from './lib/db';
import { hideStartupNotice, showStartupNotice } from './lib/startupNotice';

// How long opening the database may take before the page explains what's wrong
const DB_OPEN_TIMEOUT = 5000;

export const init: ClientInit = async () => {
	// Registered before the database opens, so a newer version can still arrive when
	// opening the database hangs or fails.
	if (!dev && 'serviceWorker' in navigator) {
		navigator.serviceWorker.register(`${base}/service-worker.js`, { type: 'module' });
	}

	// Opening the database waits, without any error, while an older copy of the app keeps it
	// open during an upgrade. The page would stay blank, so explain it instead.
	const watchdog = setTimeout(() => showStartupNotice(), DB_OPEN_TIMEOUT);
	try {
		await initDb();
	} catch (error) {
		showStartupNotice(error);
		throw error;
	} finally {
		clearTimeout(watchdog);
	}
	// the database opened after all, e.g. once the other copy was closed
	hideStartupNotice();
	// console.log('Client init finished');
};
