<script module lang="ts">
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
		currencyCode: string;
		ondocs?: (docs: TransactionDoc[]) => void;
	}

	let { line, nested = false, header = false, currencyCode, ondocs }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#each line.sorted as subline}
	{#if header}
		<section>
			<h2 class="section-label">
				<span class="flex-auto">{subline.title}</span>
				<span class={['flex-none text-sm tabular-nums', subline.total > 0 && 'text-positive']}>
					{formatAmount(Math.abs(subline.total), true)}
					<span class="font-normal text-muted">{currencyCode}</span>
				</span>
			</h2>

			<div class="card mx-4 divide-y divide-line">
				{#if subline.sorted.length > 0}
					<Line line={subline} {currencyCode} {ondocs} />
				{:else}
					<p class="px-4 py-4 text-center text-muted">Nothing this month</p>
				{/if}
			</div>
		</section>
	{:else}
		<div
			class={['list-row min-h-[52px] py-2.5', nested && 'pl-8 text-muted']}
			onclick={() => {
				ondocs?.(subline.docs);
			}}
		>
			<span class={['min-w-0 flex-1', !nested && 'font-medium']}>{subline.title}</span>
			<span class={['flex-none tabular-nums', !nested && 'font-semibold']}
				>{formatAmount(Math.abs(subline.total), true)}
				<span class="text-sm font-normal text-muted">{currencyCode}</span></span
			>
		</div>

		{#if subline.sorted.length > 0}
			<Line line={subline} nested {currencyCode} {ondocs} />
		{/if}
	{/if}
{/each}
