<script lang="ts">
	import { goto } from '$app/navigation';
	import type { TransactionParams } from '~/type.js';
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';
	import { useStore } from '~/lib/store';

	let { data } = $props();
	// console.log('new transaction:', data);
	const { latestTimestamp } = useStore();

	async function onsave(params: TransactionParams) {
		const { createTransaction } = await import('~/lib/db');
		const doc = await createTransaction(params);
		$latestTimestamp = doc.timestamp;
		// console.log('transaction created:', doc);
		goto(`#/accounts/${data.account.id}`);
	}
</script>

<svelte:head>
	<title>{data.account.title}: New Transaction - Acc</title>
</svelte:head>

<Header title="{data.account.title}: New Transaction" returnPath="#/accounts/{data.account.id}" />

<TransactionForm
	account={data.account}
	defaultTimestamp={$latestTimestamp
		? $latestTimestamp + 60000
		: data.t
			? parseInt(data.t)
			: undefined}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	{onsave}
/>
