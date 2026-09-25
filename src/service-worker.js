/// <reference types="@sveltejs/kit" />
import { base, build, files, prerendered, version } from '$service-worker';

const CACHE = `cache-${version}`;
// The app shell (index.html) isn't in `build`/`files`/`prerendered` since prerendering is
// disabled, so it's added explicitly. It's what the hash router serves for every in-app path.
const SHELL = `${base}/`;
const ASSETS = [...build, ...files, ...prerendered, SHELL];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);

		// `cache: 'reload'` bypasses the browser's HTTP cache. Otherwise the shell can come back
		// stale (GitHub Pages sends max-age=600) and still point at the previous deploy's bundle,
		// which is deleted from the server and from the old cache, so the app fails to load.
		const shell = await fetch(SHELL, { cache: 'reload' });
		const html = await shell.clone().text();
		if (!shell.ok || !build.some((file) => file.endsWith('.js') && html.includes(file))) {
			// failing the install keeps the previous worker and its cache; the browser retries later
			throw new Error('App shell does not match this build');
		}

		await cache.addAll(
			ASSETS.filter((url) => url !== SHELL).map((url) => new Request(url, { cache: 'reload' }))
		);
		await cache.put(SHELL, shell);
	}
	event.waitUntil(addFilesToCache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}
	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse;
		}

		try {
			const response = await fetch(event.request);
			if (response.status === 200) cache.put(event.request, response.clone());
			return response;
		} catch {
			if (event.request.mode === 'navigate') {
				const shellResponse = await cache.match(SHELL);
				if (shellResponse) return shellResponse;
			}
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) return cachedResponse;
			throw new Error('offline and not cached');
		}
	}

	event.respondWith(respond());
});
