<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Account Groups - Acc</title>
</svelte:head>

<Header title="Account Groups" returnPath="#/" addPath="#/groups/new" />

{#each data.accountGroups as ac (ac.id)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cursor-pointer p-[10px] hover:bg-[#e1effa]"
		data-id={ac.id}
		onclick={(e) => {
			if (e.currentTarget.dataset.id) {
				goto(`#/groups/${e.currentTarget.dataset.id}`);
			}
		}}
	>
		{ac.title}
	</div>
{/each}
