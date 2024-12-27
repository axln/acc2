<script lang="ts" module>
	let scrollTop: number | null = null;
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import type { EntryDoc } from '~/type.js';
	import { formatDate, formatAmount } from '~/lib/utils';
	import Header from '~/components/Header.svelte';
	import Entry from './Entry.svelte';

	let { data } = $props();
	console.log('account data:', data);

	let menuItems = $derived([
		{
			id: 'edit',
			title: 'Edit',
			to: `/#/accounts/${data.account.id}/edit`
		}
	]);

	let lastTimestamp = $derived(data.entries?.length > 0 ? data.entries[0].timestamp + 60000 : null);
	// $inspect(lastTimestamp);

	$effect(() => {
		if (scrollTop) {
			document.documentElement.scrollTop = scrollTop;
		}
		scrollTop = null;
	});

	let entriesByDays = $derived(
		data.entries.reduce(
			(acc, entry) => {
				const title = formatDate(entry.timestamp);

				if (acc[title]) {
					acc[title].push(entry);
				} else {
					acc[title] = [entry];
				}
				return acc;
			},
			{} as Record<string, EntryDoc[]>
		)
	);

	function getDayTotal(entries: EntryDoc[]) {
		return entries.reduce((acc, item) => {
			acc += item.amount;
			return acc;
		}, 0);
	}
</script>

<Header
	title={data.account.title}
	returnPath="/#/"
	addPath="/#/accounts/{data.account.id}/transactions/new{lastTimestamp
		? `?t=${lastTimestamp}`
		: ''}"
	{menuItems}
/>

{#each Object.keys(entriesByDays) as dayKey}
	<div class="flex gap-2.5 border-b border-solid border-b-[#ddd] bg-[#f4f4f8] px-2.5 py-0">
		<span class="flex-auto font-bold">{dayKey}</span>
		<span class="flex-none">{formatAmount(getDayTotal(entriesByDays[dayKey]), true, true)}</span>
	</div>

	{#each entriesByDays[dayKey] as entry (entry.id)}
		<Entry
			{entry}
			ontransaction={(id: string) => {
				scrollTop = document.documentElement.scrollTop;
				goto(`/#/accounts/${data.account.id}/transactions/${id}`);
			}}
		/>
	{/each}
{/each}
