<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import ChevronIcon from '~/components/icons/ChevronIcon.svelte';
	import { useStore } from '~/lib/store';

	const { currencies } = useStore();
</script>

<svelte:head>
	<title>Currencies - Acc</title>
</svelte:head>

<Header title="Currencies" returnPath="#/" addPath="#/currencies/new" />

<div class="card m-4 divide-y divide-line">
	{#each $currencies as c (c.code)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="list-row"
			data-role="item"
			data-code={c.code}
			onclick={(e) => {
				if (e.currentTarget.dataset.code) {
					goto(`#/currencies/${e.currentTarget.dataset.code}`);
				}
			}}
		>
			<span class="w-14 flex-none font-semibold">{c.code}</span>
			<span class="min-w-0 flex-auto truncate text-muted">{c.title}</span>
			<ChevronIcon class="-mr-1 flex-none text-muted/60" />
		</div>
	{:else}
		<p class="px-4 py-6 text-center text-muted">No currencies yet.</p>
	{/each}
</div>
