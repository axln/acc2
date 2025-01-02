<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';

	let { data } = $props();
</script>

<Header title="Account Groups" returnPath="/#/" addPath="/#/groups/new" />

{#each data.accountGroups as accountGroup (accountGroup.id)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cursor-pointer p-[10px] hover:bg-[#e1effa]"
		data-id={accountGroup.id}
		onclick={(e) => {
			if (e.currentTarget.dataset.id) {
				goto(`/#/groups/${e.currentTarget.dataset.id}`);
			}
		}}
	>
		{accountGroup.title}
	</div>
{/each}
