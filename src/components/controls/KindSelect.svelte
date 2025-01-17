<script lang="ts">
	import type { TransactionKind } from '~/lib/enum';
	import { transactionKinds } from '~/lib/const';

	interface Props {
		kind: TransactionKind;
	}

	let { kind = $bindable() }: Props = $props();

	function onpointerdown(e: Event) {
		if (e.target instanceof HTMLSpanElement) {
			// console.log('kind:', e.target.dataset.value);
			kind = e.target.dataset.value as TransactionKind;
		}
	}
</script>

<div class="user-select-none flex rounded-sm border border-gray-400">
	{#each transactionKinds as item}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			class={[
				'flex-1 border-l border-gray-400  p-[5px] text-center first:border-l-0',
				item.value === kind && 'bg-[cadetblue] text-white'
			]}
			data-value={item.value}
			{onpointerdown}
		>
			{item.title}
		</span>
	{/each}
</div>
