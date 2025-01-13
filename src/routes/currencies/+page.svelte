<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import { useStore } from '~/lib/store';

	const { currencies } = useStore();
</script>

<svelte:head>
	<title>Currencies - Acc</title>
</svelte:head>

<Header title="Currencies" returnPath="/#/" addPath="/#/currencies/new" />

{#each $currencies as c (c.code)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex cursor-pointer border-b border-gray-300 p-[10px] hover:bg-[#e1effa]"
		data-role="item"
		data-code={c.code}
		onclick={(e) => {
			if (e.currentTarget.dataset.code) {
				goto(`/#/currencies/${e.currentTarget.dataset.code}`);
			}
		}}
	>
		<div class="flex-none basis-[50px]">{c.code}</div>
		<div class="flex-auto">{c.title}</div>
	</div>
{/each}
