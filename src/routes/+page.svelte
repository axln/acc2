<script lang="ts" module>
	const menuItems = [
		{
			id: 'groups',
			title: 'Account Groups',
			to: '/#/groups'
		},
		{
			id: 'category',
			title: 'Categories',
			to: '/#/categories'
		},
		{
			id: 'report',
			title: 'Report',
			to: '/#/report'
		},
		{
			id: 'currency',
			title: 'Currencies',
			to: '/#/currencies'
		},
		{
			id: 'rates',
			title: 'Rates',
			to: '/#/rates'
		},
		{
			id: 'backup',
			title: 'Backup'
		},
		{
			id: 'restore',
			title: 'Restore'
		}
	];
</script>

<script lang="ts">
	import Header from '~/components/Header.svelte';
	import AccountGroup from './AccountGroup.svelte';
	import { formatAmount, getCurrencyRate } from '~/lib/utils';
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

	function onmenu(id: string) {
		console.log('menu:', id);

		switch (id) {
			case 'backup':
				break;

			case 'restore':
				break;
		}
	}
</script>

<Header title="Accounts" addPath="/#/accounts/new" {menuItems} {onmenu} />

{#each data.accountGroups as accountGroup}
	<AccountGroup {accountGroup} accounts={data.accounts} />
{/each}

<div class="flex border-b border-gray-300 bg-gray-100 px-2.5 font-bold text-gray-500">
	<div>Total</div>

	<div class="ml-auto">
		{formatAmount(total, true)}
		{$baseCurrencyCode || ''}
	</div>
</div>
