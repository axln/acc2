<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountDoc, AccountGroupDoc } from '~/type';
	import Account from './Account.svelte';
	import { formatAmount, getGroupBalance } from '~/lib/utils';
	import { useStore } from '~/lib/store.js';

	interface Props {
		accountGroup: AccountGroupDoc;
		accounts: AccountDoc[];
	}

	let { accountGroup, accounts }: Props = $props();

	const { baseCurrencyCode, rates } = useStore();

	let groupAccounts = $derived(accounts.filter((a) => a.groupId === accountGroup.id));
	let balance = $derived(
		getGroupBalance(groupAccounts, accountGroup.currencyCode, $rates, $baseCurrencyCode)
	);
</script>

<div>
	<div class="flex border-b border-gray-300 bg-gray-100 px-2.5 py-0 font-bold text-gray-500">
		<span class="flex-auto">{accountGroup.title}</span>
		<span>{formatAmount(balance, true)} {accountGroup.currencyCode}</span>
	</div>

	{#each groupAccounts as account (account.id)}
		<Account
			{account}
			onaccount={(id) => {
				goto(`#/accounts/${id}`);
			}}
		/>
	{/each}
</div>
