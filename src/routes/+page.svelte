<script lang="ts">
	import { dev } from '$app/environment';
	import Header from '~/components/Header.svelte';
	import AccountGroup from './AccountGroup.svelte';
	import {
		chooseTextFile,
		downloadJSON,
		formatAmount,
		formatTimestamp,
		getCurrencyRate,
		safeJSONParse
	} from '~/lib/utils';
	import { getDBSnapshot, restoreSnapshot, recalculateAccountBalances } from '~/lib/db';
	import { useStore } from '~/lib/store.js';

	const { baseCurrencyCode, rates } = useStore();

	let { data } = $props();

	// console.log('data:', data);

	let total = $derived(
		data.accounts.reduce((total, acc) => {
			if (acc.currencyCode === $baseCurrencyCode) {
				total += acc.balance;
			} else {
				total +=
					acc.balance *
					getCurrencyRate(acc.currencyCode, data.baseCurrencyCode, $rates, $baseCurrencyCode);
			}
			return total;
		}, 0)
	);

	async function onmenu(id: string) {
		// console.log('menu:', id);

		switch (id) {
			case 'backup':
				const backup = await getDBSnapshot();
				downloadJSON(backup, `acc-${formatTimestamp(Date.now())}.json`);
				break;

			case 'restore':
				chooseTextFile(async (text) => {
					const dbSnapshot = safeJSONParse(text);
					if (dbSnapshot) {
						const restored = await restoreSnapshot(dbSnapshot);
						if (restored) {
							// console.log('reloading page...');
							window.location.reload();
						}
					}
				});
				break;

			case 'recalc':
				recalculateAccountBalances().catch((err) => {
					console.error('Error recalculating account balances:', err);
				});
				break;
		}
	}
</script>

<svelte:head>
	<title>Accounts - Acc</title>
</svelte:head>

<Header
	title="Accounts"
	addPath="#/accounts/new"
	menuItems={[
		{
			id: 'groups',
			title: 'Account Groups',
			to: '#/groups'
		},
		{
			id: 'category',
			title: 'Categories',
			to: '#/categories'
		},
		{
			id: 'report',
			title: 'Report',
			to: '#/report'
		},
		{
			id: 'currency',
			title: 'Currencies',
			to: '#/currencies'
		},
		{
			id: 'rates',
			title: 'Rates',
			to: '#/rates'
		},
		{
			id: 'backup',
			title: 'Backup'
		},
		{
			id: 'restore',
			title: 'Restore'
		},
		{
			id: 'recalc',
			title: 'Recalc'
		},
		...(dev
			? [
					{
						id: 'test',
						title: 'Test',
						to: '#/test'
					}
				]
			: [])
	]}
	{onmenu}
/>

<section
	class="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#db2777] p-5 text-white shadow-lg shadow-primary/20"
>
	<div class="text-sm font-medium text-white/80">Total balance</div>
	<div class="mt-1 flex items-baseline gap-2">
		<span class="text-[2rem] font-bold tabular-nums leading-tight">{formatAmount(total, true)}</span
		>
		<span class="text-lg font-medium text-white/80">{$baseCurrencyCode || ''}</span>
	</div>
</section>

<div class="pb-6">
	{#each data.accountGroups as accountGroup}
		<AccountGroup {accountGroup} accounts={data.accounts} />
	{:else}
		<p class="px-6 py-10 text-center text-muted">
			No accounts yet. Create an account group in the menu, then add an account with the + button.
		</p>
	{/each}
</div>
