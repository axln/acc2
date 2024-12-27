<script lang="ts">
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();

	// console.log('transaction data:', data);
</script>

<Header
	title="{data.account.title}: Transaction"
	returnPath="/#/accounts/{data.account.id}"
	menuItems={[
		{
			id: 'delete',
			title: 'Delete'
		}
	]}
	onmenu={(id) => {
		console.log('onmenu:', id);
	}}
/>

<TransactionForm
	account={data.account}
	transactionDoc={data.transactionDoc}
	accountGroups={data.accountGroups}
	accounts={data.accounts}
	onsave={(params) => {
		console.log('onsave:', params);
	}}
/>
