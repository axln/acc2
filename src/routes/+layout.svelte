<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { STORE } from '~/lib/store';
	import '~/app.css';

	let { data, children } = $props();

	setContext(STORE, {
		baseCurrencyCode: writable(data.baseCurrencyCode),
		rates: writable(data.rates),
		categories: writable(data.categories),
		currencies: writable(data.currencies),
		latestTimestamp: writable<number | null>(null)
	});
</script>

<main class="flex flex-1 flex-col">
	{@render children()}
</main>
