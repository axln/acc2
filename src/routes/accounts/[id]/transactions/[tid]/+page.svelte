<script lang="ts">
	import { goto } from '$app/navigation';
	import type { TransactionParams } from '~/type.js';
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();

	// console.log('transaction data:', data);

	async function onsave(params: TransactionParams) {
		const { updateTransaction } = await import('~/lib/db');
		await updateTransaction(data.transaction, params);
		goto(`#/accounts/${data.transaction.accountId}`, {
			state: {
				transactionId: data.transaction.id
			}
		});
	}

	async function onmenu(id: string) {
		const { deleteTransaction } = await import('~/lib/db');
		if (id === 'delete') {
			if (confirm('Delete transaction?')) {
				await deleteTransaction(data.transaction.id);
				goto(`#/accounts/${data.transaction.accountId}`);
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
	transaction={data.transaction}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	{onsave}
/>
