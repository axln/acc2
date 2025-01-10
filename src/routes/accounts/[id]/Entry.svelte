<script lang="ts">
	import { useStore } from '~/lib/store';
	import type { EntryDoc } from '~/type';
	import { formatAmount, formatTime } from '~/lib/utils';

	interface Props {
		entry: EntryDoc;
		ontransaction: (id: string) => void;
	}
	let { entry, ontransaction }: Props = $props();

	const { categories } = useStore();

	let category = $derived(
		entry.categoryId ? $categories.find((category) => category.id === entry.categoryId) : null
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	id={entry.id}
	class="cursor-pointer border-b border-b-[#ddd] px-2.5 py-[5px] hover:bg-[#e1effa] active:bg-[#d1e3f0]"
	class:bg-[#e8ffe0]={entry.reconciled}
	onclick={() => {
		ontransaction(entry.transactionId);
	}}
>
	<div class="flex gap-2.5">
		<div class="flex-auto">
			<span class="[&:not(:only-child)]:mr-[5px]">{entry.comment}</span>

			{#if category}
				<span
					class="whitespace-nowrap rounded border border-[#ddd] bg-[#eee] px-[3px] text-[13px] leading-[1em]"
				>
					{category.title}{category.subtitle ? `:${category.subtitle}` : ''}
				</span>
			{/if}
		</div>

		<div class="flex-none text-right" class:text-[green]={entry.amount > 0}>
			{formatAmount(entry.amount, true, true)}
		</div>
	</div>

	<div class="mt-[5px] flex gap-2.5 text-[13px]" class:text-[#999]={entry.reconciled}>
		<div class="flex-auto">{formatTime(entry.timestamp)}</div>
		<div class="flex-none text-right">{formatAmount(entry.total, true)}</div>
	</div>
</div>
