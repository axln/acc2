<script module>
	import type { TransactionDoc } from '~/type.js';

	export interface ReportLine {
		title: string;
		total: number;
		docs: TransactionDoc[];
		lines: Record<string, ReportLine>;
		sorted: ReportLine[];
	}
</script>

<script lang="ts">
	import { formatAmount } from '~/lib/utils';
	import Line from './Line.svelte';

	interface Props {
		line: ReportLine;
		nested?: boolean;
		header?: boolean;
		ondocs?: (docs: TransactionDoc[]) => void;
	}

	let { line, nested = false, header = false, ondocs }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#each line.sorted as subline}
	<div
		class={[
			'flex gap-[10px] border-b border-gray-300 px-[10px]',
			header ? 'bg-[#f4f4f8] font-bold text-gray-500' : 'py-[5px]',
			nested && 'pl-[20px]'
		]}
		onclick={() => {
			ondocs?.(subline.docs);
		}}
	>
		<span class="flex-1">{subline.title}</span>
		<span class="flex-none">{formatAmount(Math.abs(subline.total), true)}</span>
	</div>

	{#if subline.sorted.length > 0}
		<Line line={subline} nested={!header} {ondocs} />
	{/if}
{/each}
