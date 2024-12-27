<script lang="ts">
	import Header from '~/components/Header.svelte';
	import TransactionForm from '~/components/TransactionForm.svelte';

	let { data } = $props();
	console.log('new transaction:', data);
</script>

<Header title="{data.account.title}: Transaction" returnPath="/#/accounts/{data.account.id}" />

<TransactionForm
	accountId={data.account.id}
	defaultTimestamp={data.t ? parseInt(data.t) : undefined}
	onsave={() => {
		console.log('on save');
	}}
/>
