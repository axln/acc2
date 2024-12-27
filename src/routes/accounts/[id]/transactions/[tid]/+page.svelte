<script lang="ts" module>
	const menuItems = [
		{
			id: 'delete',
			title: 'Delete'
		}
	];
</script>

<script lang="ts">
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();

	console.log('transaction data:', data);
</script>

<Header
	title="Transaction"
	returnPath="/#/accounts/{data.account.id}"
	{menuItems}
	onmenu={(id) => {
		console.log('onmenu:', id);
	}}
/>

<TransactionForm
	accountId={data.account.id}
	transactionDoc={data.transactionDoc}
	onsave={(params) => {
		console.log('onsave:', params);
	}}
/>
