<script lang="ts">
	import { goto } from '$app/navigation';
	import type { TransactionParams } from '~/type.js';
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();
	// console.log('new transaction:', data);

	async function onsave(params: TransactionParams) {
		const { createTransaction } = await import('~/lib/db');
		const doc = await createTransaction(params);
		// console.log('transaction created:', doc);
		goto(`/#/accounts/${data.account.id}`);
	}
</script>

<Header title="{data.account.title}: New Transaction" returnPath="/#/accounts/{data.account.id}" />

<TransactionForm
	account={data.account}
	defaultTimestamp={data.t ? parseInt(data.t) : undefined}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	{onsave}
/>
