<script lang="ts">
	import { TransactionKind } from '~/lib/enum';
	import { transactionKinds } from '~/lib/const';

	interface Props {
		kind: TransactionKind;
	}

	let { kind = $bindable() }: Props = $props();

	const activeColor: Record<TransactionKind, string> = {
		[TransactionKind.Expense]: 'text-negative',
		[TransactionKind.Transfer]: 'text-primary',
		[TransactionKind.Income]: 'text-positive'
	};

	function onpointerdown(e: Event) {
		if (e.target instanceof HTMLSpanElement) {
			kind = e.target.dataset.value as TransactionKind;
		}
	}
</script>

<div class="flex select-none gap-1 rounded-xl bg-fg/[0.06] p-1">
	{#each transactionKinds as item}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			class={[
				'flex-1 cursor-pointer rounded-lg py-2 text-center text-base font-medium transition-colors',
				item.value === kind
					? ['bg-surface font-semibold shadow-sm', activeColor[item.value]]
					: 'text-muted'
			]}
			data-value={item.value}
			{onpointerdown}
		>
			{item.title}
		</span>
	{/each}
</div>
