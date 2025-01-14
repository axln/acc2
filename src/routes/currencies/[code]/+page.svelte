<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import CurrencyForm from '~/components/CurrencyForm.svelte';
	import { useStore } from '~/lib/store';

	let { data } = $props();

	const { currencies } = useStore();

	async function onsave(code: string, title: string) {
		const { updateCurrency, getCurrencies } = await import('~/lib/db');
		await updateCurrency({
			...data.currency,
			code,
			title
		});
		$currencies = await getCurrencies();
		goto('#/currencies');
	}
</script>

<svelte:head>
	<title>Currency - Acc</title>
</svelte:head>

<Header title="Currency" returnPath="#/currencies" />

<CurrencyForm currency={data.currency} {onsave} />
