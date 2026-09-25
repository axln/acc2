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

	// money that came into the account and money that left it, kept apart instead of netted
	function calcDayFlows(entries: EntryDoc[]) {
		return entries.reduce(
			(acc, item) => {
				if (item.amount > 0) {
					acc.credit += item.amount;
				} else {
					acc.debit += item.amount;
				}
				return acc;
			},
			{ credit: 0, debit: 0 }
		);
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

{#each Object.keys(data.entriesByDays) as dayKey}
	{@const flows = calcDayFlows(data.entriesByDays[dayKey])}
	<h2 class="section-label">
		<span class="flex-auto">{dayKey}</span>
		{#if flows.credit}
			<span class="flex-none tabular-nums text-positive"
				>{formatAmount(flows.credit, true, true)}</span
			>
		{/if}
		{#if flows.debit}
			<span class="flex-none tabular-nums">{formatAmount(flows.debit, true)}</span>
		{/if}
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
