<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
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

	function depthOf(hash: string) {
		return hash.replace(/^#/, '').split('?')[0].split('/').filter(Boolean).length;
	}

	// 1: pushing to a deeper (or sibling) view, slides in from the right, iOS "push" style.
	// -1: returning to a shallower view, slides in from the left, iOS "pop" style.
	let direction = $state(1);

	beforeNavigate(({ from, to }) => {
		if (from && to) {
			direction = depthOf(to.url.hash) < depthOf(from.url.hash) ? -1 : 1;
		}
	});

	// skip the transition on the very first paint, only animate actual navigation
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});

	// The deeper view is always on top and travels the full width; the view underneath
	// only shifts by 30% and dims, like UINavigationController.
	// Svelte runs t from 0 to 1 for intros and from 1 to 0 for outros, so t = 1 means "in place".
	function ios(node: Element, { top }: { top: boolean }) {
		return {
			duration: mounted ? 350 : 0,
			easing: cubicOut,
			css: (t: number, u: number) =>
				top
					? `z-index: 2; transform: translateX(${u * 100}%); box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);`
					: `z-index: 1; transform: translateX(${u * -30}%); filter: brightness(${1 - u * 0.15});`
		};
	}
</script>

<!-- The column is exactly the screen width. With an automatic one, a row that can't wrap
	(a long word, a long chip) would widen every page past the screen. -->
<main class="relative grid flex-1 grid-cols-[minmax(0,1fr)] overflow-x-clip">
	{#key page.url.hash.split('?')[0]}
		<div
			class="col-start-1 row-start-1 flex min-h-dvh flex-col bg-canvas"
			in:ios={{ top: direction === 1 }}
			out:ios={{ top: direction === -1 }}
		>
			{@render children()}
		</div>
	{/key}
</main>
