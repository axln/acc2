<script lang="ts">
	import type { AccountDoc, AccountGroupDoc, TransactionDoc, TransactionParams } from '~/type';
	import { TransactionKind } from '~/lib/enum';
	import KindSelect from './controls/KindSelect.svelte';
	import Button from './controls/Button.svelte';
	import AccountSelect from './AccountSelect.svelte';
	import {
		formatAmount,
		getLocalCustomISODateString,
		validateAmount,
		parseAmount
	} from '~/lib/utils';
	import CategoryCombo from './CategoryCombo.svelte';
	import InputBox from './controls/InputBox.svelte';
	import { focus } from '~/lib/actions/focus';
	import Keypad from './Keypad.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		account: AccountDoc;
		transactionDoc?: TransactionDoc;
		defaultTimestamp?: number;
		accountGroups: AccountGroupDoc[];
		accounts: AccountDoc[];
		onsave: (params: TransactionParams) => void;
	}

	const { categories } = useStore();

	let { account, transactionDoc, defaultTimestamp, accountGroups, accounts, onsave }: Props =
		$props();

	let kind: TransactionKind = $state(transactionDoc?.kind || TransactionKind.Expense);
	let datetime = $state(
		getLocalCustomISODateString(
			new Date(transactionDoc?.timestamp || defaultTimestamp || Date.now())
		)
	);
	$inspect(datetime);
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
				categories.set(await getCategories());
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

<form class="m-[10px] space-y-[10px]" {onsubmit}>
	<div>
		<KindSelect bind:kind />
	</div>

	<div class="flex gap-[10px]">
		<input
			class="w-full rounded-sm border border-gray-500 p-1 font-mono text-inherit outline-none"
			type="datetime-local"
			bind:value={datetime}
		/>

		<Button
			class="w-[80px]"
			type="button"
			onclick={() => {
				datetime = getLocalCustomISODateString(new Date());
			}}>Now</Button
		>
	</div>

	<div class="flex gap-[10px]">
		{#if kind === TransactionKind.Transfer}
			<AccountSelect bind:accountId={secondAccountId} {accounts} {accountGroups} placeholder="To" />
		{:else}
			<CategoryCombo bind:this={categoryCombo} bind:categoryId bind:value={categoryValue} />
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

	{#if secondAccount && secondCurrency}
		<div>
			Amount, {secondAccount.currencyCode}:
			<InputBox
				class={[
					'w-full',
					secondAmount.trim() !== '' && !validateAmount(secondAmount) && 'border-[red] text-[red]'
				]}
				type="text"
				bind:value={secondAmount}
			/>
		</div>
	{/if}

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

	<div>
		<Button class="mt-[10px] w-full p-[5px]" type="submit">
			{transactionDoc ? 'Save' : 'Create'}
		</Button>
	</div>
</form>
