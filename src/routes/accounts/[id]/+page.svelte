<script module lang="ts">
	let scrollTop: number | null = null;
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { goto, beforeNavigate } from '$app/navigation';
	import type { EntryDoc } from '~/type.js';
	import Header from '~/components/Header.svelte';
	import Fab from '~/components/Fab.svelte';
	import Entry from './Entry.svelte';
	import { formatAmount, highlightElement } from '~/lib/utils';

	let { data } = $props();
	// console.log('account data:', data);

	beforeNavigate(() => {
		if (document.documentElement.scrollTop) {
			scrollTop = document.documentElement.scrollTop;
			console.log('scrollTop saved:', scrollTop);
		}
	});

	tick().then(() => {
		if (scrollTop) {
			document.documentElement.scrollTop = scrollTop;
			console.log('scrolltop restored:', scrollTop);
			scrollTop = null;
		}

		if (page.state.transactionId) {
			const element = document.getElementById(page.state.transactionId);
			if (element) {
				highlightElement(element, 'highlight-animation');
			}
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
	menuItems={[
		{
			id: 'edit',
			title: 'Edit',
			to: `#/accounts/${data.account.id}/edit`
		}
	]}
/>

<div class="flex items-baseline gap-2 px-5 pb-1 pt-4">
	<span class="text-sm text-muted">Balance</span>
	<span
		class={['ml-auto text-2xl font-bold tabular-nums', data.account.balance < 0 && 'text-negative']}
		>{formatAmount(data.account.balance, true)}</span
	>
	<span class="text-muted">{data.account.currencyCode}</span>
</div>

{#each Object.keys(data.entriesByDays) as dayKey}
	<h2 class="section-label">
		<span class="flex-auto">{dayKey}</span>
		<span class="flex-none tabular-nums">
			{formatAmount(calcDayTotal(data.entriesByDays[dayKey]), true, true)}
		</span>
	</h2>

	<div class="card mx-4 divide-y divide-line">
		{#each data.entriesByDays[dayKey] as entry (entry.id)}
			<Entry
				{entry}
				ontransaction={(id: string) => {
					goto(`#/accounts/${data.account.id}/transactions/${id}`);
				}}
			/>
		{/each}
	</div>
{:else}
	<p class="px-6 py-10 text-center text-muted">No transactions yet.</p>
{/each}

<Fab
	label="New transaction"
	href="#/accounts/{data.account.id}/transactions/new{data.lastTimestamp
		? `?t=${data.lastTimestamp}`
		: ''}"
/>
