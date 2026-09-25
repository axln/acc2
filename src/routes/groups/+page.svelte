<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import ChevronIcon from '~/components/icons/ChevronIcon.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Account Groups - Acc</title>
</svelte:head>

<Header title="Account Groups" returnPath="#/" addPath="#/groups/new" />

<div class="card m-4 divide-y divide-line">
	{#each data.accountGroups as ac (ac.id)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="list-row"
			data-id={ac.id}
			onclick={(e) => {
				if (e.currentTarget.dataset.id) {
					goto(`#/groups/${e.currentTarget.dataset.id}`);
				}
			}}
		>
			<span class="min-w-0 flex-auto truncate">{ac.title}</span>
			<span class="flex-none text-sm text-muted">{ac.currencyCode}</span>
			<ChevronIcon class="-mr-1 flex-none text-muted/60" />
		</div>
	{:else}
		<p class="px-4 py-6 text-center text-muted">No account groups yet.</p>
	{/each}
</div>
