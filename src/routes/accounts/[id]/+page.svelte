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
	import { formatAmount, formatDate, highlightElement } from '~/lib/utils';
	import { PAGE_SIZE, clearLoadedCount, saveLoadedCount } from './paging';

	let { data } = $props();
	// console.log('account data:', data);

	// entries read after the first page, as the list is scrolled
	let olderEntries = $state.raw<EntryDoc[]>([]);
	let loadedAll = $state(false);
	let loading = false;

	let entries = $derived([...data.entries, ...olderEntries]);
	let hasMore = $derived(data.hasMore && !loadedAll);

	let entriesByDays = $derived(
		entries.reduce(
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

	async function loadMore() {
		if (loading || !hasMore) {
			return;
		}
		loading = true;
		try {
			const { getEntriesPage } = await import('~/lib/db');
			const page = await getEntriesPage(data.account.id, PAGE_SIZE, entries[entries.length - 1]);
			olderEntries = [...olderEntries, ...page.entries];
			loadedAll = !page.hasMore;
		} finally {
			loading = false;
		}
	}

	// reads the next page once the end of the list comes within a screen or so of view
	function nearEnd(node: Element) {
		const observer = new IntersectionObserver(
			([item]) => {
				if (item.isIntersecting) {
					loadMore();
				}
			},
			{ rootMargin: '1000px 0px' }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Only opening one of this account's views (a transaction, the edit form) keeps the list
	// as it is for the way back; opening the account from anywhere else starts at the top.
	beforeNavigate(({ to }) => {
		if (to?.url.hash.startsWith(`#/accounts/${data.account.id}/`)) {
			scrollTop = document.documentElement.scrollTop || null;
			saveLoadedCount(data.account.id, entries.length);
		} else {
			scrollTop = null;
			clearLoadedCount();
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

{#each Object.keys(entriesByDays) as dayKey}
	{@const flows = calcDayFlows(entriesByDays[dayKey])}
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
		{#each entriesByDays[dayKey] as entry (entry.id)}
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

{#if hasMore}
	<!-- recreated after each page so the observer checks again whether it's still near -->
	{#key entries.length}
		<div class="py-6 text-center text-sm text-muted" use:nearEnd>Loading…</div>
	{/key}
{/if}

<Fab
	label="New transaction"
	href="#/accounts/{data.account.id}/transactions/new{data.lastTimestamp
		? `?t=${data.lastTimestamp}`
		: ''}"
/>
