<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountDoc, AccountGroupDoc } from '~/type';
	import { useStore } from '~/lib/store.js';
	import { formatAmount, getGroupBalance } from '~/lib/utils';
	import Account from './Account.svelte';

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

	function onaccount(id: string) {
		goto(`/#/accounts/${id}`);
	}
</script>

<div>
	<div class="flex border-b border-b-[#ddd] bg-[#f4f4f8] px-2.5 py-0 font-bold text-[#777]">
		<span class="flex-auto">{accountGroup.title}</span>
		<span>{formatAmount(balance, true)} {accountGroup.currencyCode}</span>
	</div>

	{#each groupAccounts as account (account.id)}
		<Account {account} {onaccount} />
	{/each}
</div>
