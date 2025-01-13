<script lang="ts" module>
	let scrollTop: number | null = null;
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import type { EntryDoc } from '~/type.js';
	import { formatAmount } from '~/lib/utils';
	import Header from '~/components/Header.svelte';
	import Entry from './Entry.svelte';

	let { data } = $props();
	// console.log('account data:', data);

	let menuItems = $derived([
		{
			id: 'edit',
			title: 'Edit',
			to: `#/accounts/${data.account.id}/edit`
		}
	]);

	tick().then(() => {
		if (scrollTop) {
			document.documentElement.scrollTop = scrollTop;
			console.log('scrolltop restored:', scrollTop);
		}
		scrollTop = null;
	});

	function getDayTotal(entries: EntryDoc[]) {
		return entries.reduce((acc, item) => {
			acc += item.amount;
			return acc;
		}, 0);
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
	{menuItems}
/>

{#each Object.keys(data.entriesByDays) as dayKey}
	<div class="flex gap-2.5 border-b border-b-[#ddd] bg-[#f4f4f8] px-2.5 py-0">
		<span class="flex-auto font-bold">{dayKey}</span>
		<span class="flex-none"
			>{formatAmount(getDayTotal(data.entriesByDays[dayKey]), true, true)}</span
		>
	</div>

	{#each data.entriesByDays[dayKey] as entry (entry.id)}
		<Entry
			{entry}
			ontransaction={(id: string) => {
				scrollTop = document.documentElement.scrollTop;
				console.log('scrollTop saved:', scrollTop);
				goto(`#/accounts/${data.account.id}/transactions/${id}`);
			}}
		/>
	{/each}
{/each}
