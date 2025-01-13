<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import CurrencyForm from '~/components/CurrencyForm.svelte';
	import { useStore } from '~/lib/store';

	const { currencies } = useStore();

	async function onsave(code: string, title: string) {
		const { createCurrency, getCurrencies } = await import('~/lib/db');
		await createCurrency(code, title);
		$currencies = await getCurrencies();
		goto('#/currencies');
	}
</script>

<svelte:head>
	<title>New Currency - Acc</title>
</svelte:head>

<Header title="New Currency" returnPath="#/currencies" />

<CurrencyForm {onsave} />
