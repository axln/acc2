<script lang="ts">
	import type { TransactionDoc, TransactionParams } from '~/type';
	import { TransactionKind } from '~/lib/enum';
	import KindSelect from './controls/KindSelect.svelte';
	import Button from './controls/Button.svelte';
	import AccountSelect from './AccountSelect.svelte';
	import { getLocalCustomISODateString } from '~/lib/utils';
	import CategoryCombo from './CategoryCombo.svelte';
	import { focus } from '~/lib/actions/focus';

	interface Props {
		accountId: string;
		transactionDoc?: TransactionDoc;
		defaultTimestamp?: number;
		onsave: (params: TransactionParams) => void;
	}

	let { accountId, transactionDoc, defaultTimestamp, onsave }: Props = $props();

	let kind: TransactionKind = $state(transactionDoc?.kind || TransactionKind.Expense);
	let timestamp = $state(
		getLocalCustomISODateString(
			new Date(transactionDoc?.timestamp || defaultTimestamp || Date.now())
		)
	);
	let categoryId: string | undefined = $state(transactionDoc?.categoryId);
	let secondAccountId: string | undefined = $state(transactionDoc?.secondAccountId);

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
			<AccountSelect bind:accountId={secondAccountId} placeholder="To" />
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
</form>
