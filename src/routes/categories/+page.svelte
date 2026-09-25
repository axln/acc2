<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import ChevronIcon from '~/components/icons/ChevronIcon.svelte';
	import { useStore } from '~/lib/store';

	const { categories } = useStore();
</script>

<svelte:head>
	<title>Categories - Acc</title>
</svelte:head>

<Header title="Categories" returnPath="#/" addPath="#/categories/new" />

<div class="card m-4 divide-y divide-line">
	{#each $categories as c (c.id)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="list-row"
			data-id={c.id}
			onclick={(e) => {
				if (e.currentTarget.dataset.id) {
					goto(`#/categories/${e.currentTarget.dataset.id}`);
				}
			}}
		>
			<span class="min-w-0 flex-auto truncate">
				{c.title}{#if c.subtitle}<span class="text-muted">:{c.subtitle}</span>{/if}
			</span>
			<ChevronIcon class="-mr-1 flex-none text-muted/60" />
		</div>
	{:else}
		<p class="px-4 py-6 text-center text-muted">No categories yet.</p>
	{/each}
</div>
