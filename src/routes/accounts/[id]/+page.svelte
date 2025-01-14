<script lang="ts" module>
	let scrollTop: number | null = null;
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import type { EntryDoc } from '~/type.js';
	import Header from '~/components/Header.svelte';
	import Entry from './Entry.svelte';
	import { formatAmount } from '~/lib/utils';

	let { data } = $props();
	// console.log('account data:', data);

	tick().then(() => {
		if (scrollTop) {
			document.documentElement.scrollTop = scrollTop;
			console.log('scrolltop restored:', scrollTop);
			scrollTop = null;
		}
	});

	function calcDayTotal(entries: EntryDoc[]) {
		return entries.reduce((acc, item) => acc + item.amount, 0);
	}
</script>

<svelte:head>
	<title>{data.account.title} - Acc</title>
</svelte:head>

<Header
	title={data.account.title}
	returnPath="#/"
	addPath="#/accounts/{data.account.id}/transactions/new{data.lastTimestamp
		? `?t=${data.lastTimestamp}`
		: ''}"
	menuItems={[
		{
			id: 'edit',
			title: 'Edit',
			to: `#/accounts/${data.account.id}/edit`
		}
	]}
/>

{#each Object.keys(data.entriesByDays) as dayKey}
	<div class="flex gap-2.5 border-b border-gray-300 bg-gray-100 px-2.5 py-0">
		<span class="flex-auto font-bold">{dayKey}</span>
		<span class="flex-none"
			>{formatAmount(calcDayTotal(data.entriesByDays[dayKey]), true, true)}</span
		>
	</div>

	{#each data.entriesByDays[dayKey] as entry (entry.id)}
		<Entry
			{entry}
			ontransaction={(id: string) => {
				if (document.documentElement.scrollTop) {
					scrollTop = document.documentElement.scrollTop;
					console.log('scrollTop saved:', scrollTop);
				}
				goto(`#/accounts/${data.account.id}/transactions/${id}`);
			}}
		/>
	{/each}
{/each}
