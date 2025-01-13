<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';
	import { deleteTransaction } from '~/lib/db.js';
	import type { TransactionParams } from '~/type.js';

	let { data } = $props();

	// console.log('transaction data:', data);

	async function onsave(params: TransactionParams) {
		const { updateTransaction } = await import('~/lib/db');
		await updateTransaction(data.transactionDoc, params);
		goto(`#/accounts/${data.transactionDoc.accountId}`);
	}

	async function onmenu(id: string) {
		if (id === 'delete') {
			if (confirm('Delete transaction?')) {
				await deleteTransaction(data.transactionDoc.id);
				goto(`#/accounts/${data.transactionDoc.accountId}`);
			}
		}
	}
</script>

<svelte:head>
	<title>{data.account.title}: Transaction - Acc</title>
</svelte:head>

<Header
	title="{data.account.title}: Transaction"
	returnPath="#/accounts/{data.account.id}"
	menuItems={[
		{
			id: 'delete',
			title: 'Delete'
		}
	]}
	{onmenu}
/>

<TransactionForm
	account={data.account}
	transactionDoc={data.transactionDoc}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	{onsave}
/>
