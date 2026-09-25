<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import CurrencySelect from '~/components/CurrencySelect.svelte';
	import InputBox from '~/components/controls/InputBox.svelte';
	import Button from '~/components/controls/Button.svelte';
	import { parseRate, validateRate } from '~/lib/utils';
	import { baseCurrencyName } from '~/lib/const';
	import { useStore } from '~/lib/store';

	const { baseCurrencyCode, rates, currencies } = useStore();

	let baseCode = $state($baseCurrencyCode);

	let currentRates = $state(
		$currencies.reduce(
			(acc, { code }) => {
				acc[code] = String($rates[code] || 1);
				return acc;
			},
			{} as Record<string, string>
		)
	);

	function validateFields(): string {
		for (const [code, value] of Object.entries<string>(currentRates)) {
			if (!validateRate(value)) {
				const input = document.getElementById(code);
				if (input) {
					input.focus();
				}
				return `Invalid rate for ${code}`;
			}
		}

		return '';
	}

	async function onsubmit() {
		const validationError = validateFields();
		if (validationError) {
			alert(validationError);
			return;
		}

		const rateDocs = $currencies
			.filter(({ code }) => code !== baseCode)
			.map(({ code }) => {
				return {
					code,
					rate: parseRate(currentRates[code])
				};
			});

		const { updateSettings, updateRates } = await import('~/lib/db');

		await updateSettings({
			name: baseCurrencyName,
			value: baseCode
		});

		$baseCurrencyCode = baseCode;
		$rates = await updateRates(rateDocs, baseCode);
		goto('#/');
	}
</script>

<svelte:head>
	<title>Rates - Acc</title>
</svelte:head>

<Header title="Rates" returnPath="#/" />

<form class="space-y-3 p-4" {onsubmit}>
	<label class="block">
		<span class="mb-1 block px-1 text-sm font-medium text-muted">Base currency</span>
		<CurrencySelect bind:currencyCode={baseCode} placeholder="Base Currency" />
	</label>

	{#each $currencies as { code }}
		{#if code !== baseCode}
			<label class="block">
				<span class="mb-1 block px-1 text-sm font-medium text-muted">{code}</span>
				<InputBox
					class={[
						'w-full tabular-nums',
						!validateRate(currentRates[code]) &&
							'border-negative text-negative focus:border-negative focus:ring-negative/25'
					]}
					id={code}
					type="text"
					inputmode="decimal"
					bind:value={currentRates[code]}
				/>
			</label>
		{/if}
	{/each}

	<div class="pt-2">
		<Button class="w-full" type="submit">Save</Button>
	</div>
</form>
