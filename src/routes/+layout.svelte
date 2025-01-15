<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { STORE } from '~/lib/store.js';
	import '~/app.css';

	let { data, children } = $props();

	const latestTimestamp = writable<number | null>(null);

	setContext(STORE, {
		baseCurrencyCode: writable(data.baseCurrencyCode),
		rates: writable(data.rates),
		categories: writable(data.categories),
		currencies: writable(data.currencies),
		latestTimestamp
	});
</script>

<main class="flex flex-1 flex-col">
	{@render children()}
</main>
