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

<section>
	<h2 class="section-label">
		<span class="flex-auto truncate">{accountGroup.title}</span>
		<span class="tabular-nums">{formatAmount(balance, true)} {accountGroup.currencyCode}</span>
	</h2>

	{#if groupAccounts.length}
		<div class="card mx-4 divide-y divide-line">
			{#each groupAccounts as account (account.id)}
				<Account
					{account}
					onaccount={(id) => {
						goto(`#/accounts/${id}`);
					}}
				/>
			{/each}
		</div>
	{/if}
</section>
