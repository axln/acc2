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
		const newRates = await updateRates(rateDocs, baseCode);
		$rates = newRates;
		goto('/#/');
	}
</script>

<Header title="Rates" returnPath="/#/" />

<form class="m-[10px] space-y-[10px]" {onsubmit}>
	<div>
		Base currency:
		<CurrencySelect bind:currencyCode={baseCode} placeholder="Base Currency" />
	</div>

	{#each $currencies as { code }}
		{#if code !== baseCode}
			<div>
				<div>{code}:</div>
				<div>
					<InputBox
						class={[
							'w-full outline-none',
							!validateRate(currentRates[code]) && 'border-red-500 text-red-500'
						]}
						type="text"
						bind:value={currentRates[code]}
					/>
				</div>
			</div>
		{/if}
	{/each}

	<div class="!mt-[20px]">
		<Button class="mt-[10px] w-full" type="submit">Save</Button>
	</div>
</form>
