<script lang="ts">
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();
	// console.log('new transaction:', data);
</script>

<Header title="{data.account.title}: New Transaction" returnPath="/#/accounts/{data.account.id}" />

<TransactionForm
	account={data.account}
	defaultTimestamp={data.t ? parseInt(data.t) : undefined}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	onsave={() => {
		console.log('on save');
	}}
/>
