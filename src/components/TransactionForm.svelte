<script lang="ts">
	import type { AccountDoc, AccountGroupDoc, TransactionDoc, TransactionParams } from '~/type';
	import { TransactionKind } from '~/lib/enum';
	import KindSelect from './controls/KindSelect.svelte';
	import Button from './controls/Button.svelte';
	import AccountSelect from './AccountSelect.svelte';
	import { formatAmount, getLocalCustomISODateString, validateAmount } from '~/lib/utils';
	import CategoryCombo from './CategoryCombo.svelte';
	import InputBox from './controls/InputBox.svelte';
	import { focus } from '~/lib/actions/focus';
	import Keypad from './Keypad.svelte';

	interface Props {
		account: AccountDoc;
		transactionDoc?: TransactionDoc;
		defaultTimestamp?: number;
		accountGroups: AccountGroupDoc[];
		accounts: AccountDoc[];
		onsave: (params: TransactionParams) => void;
	}

	let { account, transactionDoc, defaultTimestamp, accountGroups, accounts, onsave }: Props =
		$props();

	let kind: TransactionKind = $state(transactionDoc?.kind || TransactionKind.Expense);
	let timestamp = $state(
		getLocalCustomISODateString(
			new Date(transactionDoc?.timestamp || defaultTimestamp || Date.now())
		)
	);
	let categoryId: string | undefined = $state(transactionDoc?.categoryId);
	let secondAccountId: string | undefined = $state(transactionDoc?.secondAccountId);
	let amount = $state(transactionDoc ? formatAmount(transactionDoc.amount) : '');
	let comment = $state(transactionDoc?.comment || '');
	let reconciled = $state(transactionDoc?.reconciled || false);

	$inspect(secondAccountId);

	let categoryCombo = $state<CategoryCombo>();

	function onsubmit(e: SubmitEvent) {
		//
	}
</script>

<form class="m-[10px] space-y-[10px]" {onsubmit}>
	<div>
		<KindSelect bind:kind />
	</div>

	<div class="flex gap-[10px]">
		<input
			class="w-full rounded-sm border border-gray-500 p-1 font-mono text-inherit outline-none"
			type="datetime-local"
			bind:value={timestamp}
			use:focus
		/>

		<Button
			class="w-[80px]"
			onclick={() => {
				timestamp = getLocalCustomISODateString(new Date());
			}}>Now</Button
		>
	</div>

	<div class="flex gap-[10px]">
		{#if kind === TransactionKind.Transfer}
			<AccountSelect bind:accountId={secondAccountId} {accounts} {accountGroups} placeholder="To" />
		{:else}
			<CategoryCombo bind:this={categoryCombo} bind:categoryId />
			<Button
				class="w-[80px]"
				onclick={() => {
					categoryCombo?.clear();
				}}>Clear</Button
			>
		{/if}
	</div>

	<div>
		Amount, {account.currencyCode}:
		<InputBox
			class={[
				'w-full',
				amount.trim() !== '' && !validateAmount(amount) && 'border-[red] text-[red]'
			]}
			type="text"
			bind:value={amount}
		/>
	</div>

	<div>
		<InputBox class="w-full" type="text" bind:value={comment} placeholder="Comment"></InputBox>
	</div>

	<div>
		<label class="flex gap-[5px]">
			<input type="checkbox" bind:checked={reconciled} />
			<span>Reconciled</span>
		</label>
	</div>

	<Keypad
		onkey={(k) => {
			if (k === '<') {
				amount = amount.substring(0, amount.length - 1);
			} else {
				amount += k;
			}
		}}
	/>
</form>
