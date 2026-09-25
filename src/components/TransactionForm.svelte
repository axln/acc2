<script lang="ts">
	import type { AccountDoc, AccountGroupDoc, TransactionDoc, TransactionParams } from '~/type';
	import { TransactionKind } from '~/lib/enum';
	import Button from './controls/Button.svelte';
	import InputBox from './controls/InputBox.svelte';
	import KindSelect from './controls/KindSelect.svelte';
	import AccountSelect from './AccountSelect.svelte';
	import CategoryCombo from './CategoryCombo.svelte';
	import Keypad from './Keypad.svelte';
	import {
		formatAmount,
		getLocalCustomISODateString,
		validateAmount,
		parseAmount
	} from '~/lib/utils';
	import { useStore } from '~/lib/store';

	interface Props {
		account: AccountDoc;
		transaction?: TransactionDoc;
		defaultTimestamp?: number;
		accountGroups: AccountGroupDoc[];
		accounts: AccountDoc[];
		onsave: (params: TransactionParams) => void;
	}

	const { categories } = useStore();

	let {
		account,
		transaction: transactionDoc,
		defaultTimestamp,
		accountGroups,
		accounts,
		onsave
	}: Props = $props();

	let kind: TransactionKind = $state(transactionDoc?.kind || TransactionKind.Expense);
	let datetime = $state(
		getLocalCustomISODateString(
			new Date(transactionDoc?.timestamp || defaultTimestamp || Date.now())
		)
	);

	// $inspect(datetime);

	let categoryId: string | undefined = $state(transactionDoc?.categoryId);
	let secondAccountId: string | undefined = $state(transactionDoc?.secondAccountId);
	let categoryValue = $state('');
	let amount = $state(transactionDoc ? formatAmount(transactionDoc.amount) : '');
	let secondAmount: string = $state(
		transactionDoc?.secondAmount ? formatAmount(transactionDoc.secondAmount) : ''
	);
	let comment = $state(transactionDoc?.comment || '');
	let reconciled = $state(transactionDoc?.reconciled || false);

	// $inspect(secondAccountId);

	let categoryCombo = $state<CategoryCombo>();

	let secondAccount = $derived(
		secondAccountId ? accounts.find((a) => a.id === secondAccountId) : null
	);
	let secondCurrency = $derived(
		secondAccount ? secondAccount.currencyCode !== account.currencyCode : false
	);

	function validateFields(): string {
		if (!validateAmount(amount)) {
			return 'Invalid amount';
		}

		if (kind === TransactionKind.Transfer) {
			if (!secondAccountId) {
				return 'Must choose the second account';
			}

			if (secondAccountId === account.id) {
				return 'Cannot transfer to the same account';
			}

			if (secondCurrency && !validateAmount(secondAmount)) {
				return 'Invalid second amount';
			}
		}

		return '';
	}

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		const validationError = validateFields();
		if (validationError) {
			alert(validationError);
			return;
		}

		if (kind !== TransactionKind.Transfer && !categoryId && categoryValue.trim() !== '') {
			const [title, subtitle = ''] = categoryValue.trim().split(':');

			const existingCat = $categories.find((c) => c.title === title && c.subtitle === subtitle);
			if (!existingCat) {
				const { createCategory, getCategories } = await import('~/lib/db');
				const cat = await createCategory(title, subtitle);
				// refreshing categories store
				$categories = await getCategories();
				// console.log('new cat added:', cat);
				categoryId = cat.id;
			}
		}

		const params: TransactionParams =
			kind === TransactionKind.Transfer
				? {
						kind,
						timestamp: new Date(datetime).getTime(),
						accountId: account.id,
						secondAccountId,
						...(secondCurrency
							? {
									secondAmount: parseAmount(secondAmount)
								}
							: {}),
						amount: parseAmount(amount),
						comment: comment.trim(),
						...(reconciled ? { reconciled: true } : {})
					}
				: {
						kind,
						timestamp: new Date(datetime).getTime(),
						accountId: account.id,
						categoryId: categoryId || undefined,
						amount: parseAmount(amount),
						comment: comment.trim(),
						...(reconciled ? { reconciled: true } : {})
					};

		onsave(params);
	}
</script>

<form class="space-y-3 p-4" {onsubmit}>
	<KindSelect bind:kind />

	<div class="flex gap-2">
		<InputBox class="min-w-0 flex-1 tabular-nums" type="datetime-local" bind:value={datetime} />

		<Button
			class="w-20 flex-none"
			variant="secondary"
			type="button"
			onclick={() => {
				datetime = getLocalCustomISODateString(new Date());
			}}>Now</Button
		>
	</div>

	<div class="flex gap-2">
		{#if kind === TransactionKind.Transfer}
			<AccountSelect bind:accountId={secondAccountId} {accounts} {accountGroups} placeholder="To" />
		{:else}
			<CategoryCombo bind:this={categoryCombo} bind:categoryId bind:value={categoryValue} />
			<Button
				class="w-20 flex-none"
				variant="secondary"
				type="button"
				onclick={() => {
					categoryCombo?.clear();
				}}>Clear</Button
			>
		{/if}
	</div>

	<label class="block">
		<span class="mb-1 block px-1 text-sm font-medium text-muted"
			>Amount, {account.currencyCode}</span
		>
		<InputBox
			class={[
				'h-14 w-full text-right text-2xl font-semibold tabular-nums',
				amount.trim() !== '' &&
					!validateAmount(amount) &&
					'border-negative text-negative focus:border-negative focus:ring-negative/25'
			]}
			type="text"
			bind:value={amount}
			inputmode="decimal"
			placeholder="0.00"
		/>
	</label>

	{#if secondAccount && secondCurrency}
		<label class="block">
			<span class="mb-1 block px-1 text-sm font-medium text-muted"
				>Amount, {secondAccount.currencyCode}</span
			>
			<InputBox
				class={[
					'h-14 w-full text-right text-2xl font-semibold tabular-nums',
					secondAmount.trim() !== '' &&
						!validateAmount(secondAmount) &&
						'border-negative text-negative focus:border-negative focus:ring-negative/25'
				]}
				type="text"
				bind:value={secondAmount}
				inputmode="decimal"
				placeholder="0.00"
			/>
		</label>
	{/if}

	<InputBox class="w-full" type="text" bind:value={comment} placeholder="Comment"></InputBox>

	<label class="flex min-h-11 cursor-pointer items-center gap-3 px-1">
		<input
			class="size-5 accent-[rgb(var(--c-primary))]"
			type="checkbox"
			bind:checked={reconciled}
		/>
		<span>Reconciled</span>
	</label>

	<Keypad
		onkey={(k) => {
			if (k === '<') {
				amount = amount.substring(0, amount.length - 1);
			} else {
				amount += k;
			}
		}}
	/>

	<Button class="!mt-5 w-full" type="submit">
		{transactionDoc ? 'Save' : 'Create'}
	</Button>
</form>
