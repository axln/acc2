<script lang="ts">
	import type { EntryDoc } from '~/type';
	import { formatAmount, formatTime } from '~/lib/utils';
	import { useStore } from '~/lib/store';
	import CheckIcon from '~/components/icons/CheckIcon.svelte';

	interface Props {
		entry: EntryDoc;
		ontransaction: (id: string) => void;
	}

	let { entry, ontransaction }: Props = $props();

	const { categories } = useStore();

	let category = $derived(
		entry.categoryId ? $categories.find((c) => c.id === entry.categoryId) : null
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	id={entry.transactionId}
	class="tap-row px-4 py-3"
	onclick={() => {
		ontransaction(entry.transactionId);
	}}
>
	<div class="flex items-start gap-3">
		<div class="min-w-0 flex-auto">
			{#if entry.comment}
				<span class="mr-1.5 break-words">{entry.comment}</span>
			{/if}

			{#if category}
				<span class="chip">
					{category.title}{category.subtitle ? `:${category.subtitle}` : ''}
				</span>
			{/if}
		</div>

		<div
			class={[
				'flex-none text-right font-semibold tabular-nums',
				entry.amount > 0 && 'text-positive'
			]}
		>
			{formatAmount(entry.amount, true, true)}
		</div>
	</div>

	<div class="mt-1 flex items-center gap-3 text-sm text-muted">
		<div class="flex flex-auto items-center gap-1.5 tabular-nums">
			{formatTime(entry.timestamp)}
			{#if entry.reconciled}
				<span class="flex items-center gap-1 text-positive">
					<CheckIcon size={14} /> Reconciled
				</span>
			{/if}
		</div>
		<div class="flex-none text-right tabular-nums">{formatAmount(entry.total, true)}</div>
	</div>
</div>
