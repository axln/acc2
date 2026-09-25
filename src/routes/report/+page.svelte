<script lang="ts">
	import { onMount } from 'svelte';
	import type { TransactionDoc } from '~/type.js';
	import InputBox from '~/components/controls/InputBox.svelte';
	import Header from '~/components/Header.svelte';
	import CloseIcon from '~/components/icons/CloseIcon.svelte';
	import Line, { type ReportLine } from './Line.svelte';
	import { getTransactions } from '~/lib/db';
	import { formatAmount, formatTimestamp, getCurrencyRate } from '~/lib/utils';
	import { useStore } from '~/lib/store';
	import { TransactionKind } from '~/lib/enum';

	const { baseCurrencyCode, rates } = useStore();

	let { data } = $props();
	// console.log('report data:', data);

	const now = new Date();
	let monthYear = $state(
		`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
	);

	let displayDocs = $state<TransactionDoc[] | null>(null);

	onMount(() => {
		return () => {
			document.documentElement.style.removeProperty('overflow');
		};
	});

	const reportPromise = $derived.by(async () => {
		const [year, month] = monthYear.split('-');
		const start = new Date(parseInt(year), parseInt(month) - 1, 1).getTime();
		const end = new Date(parseInt(year), parseInt(month), 1).getTime();

		const transactionDocs = await getTransactions(start, end);
		const report = aggregateByCategory(
			transactionDocs.filter((d) => d.kind !== TransactionKind.Transfer)
		);
		addSortedLines(report);

		return report;
	});

	function closeDocs() {
		displayDocs = null;
		document.documentElement.style.removeProperty('overflow');
	}

	function amountInBaseCurrency(doc: TransactionDoc) {
		const accountDoc = data.accountById[doc.accountId];

		const amount =
			accountDoc && accountDoc.currencyCode !== $baseCurrencyCode
				? doc.amount *
					getCurrencyRate(accountDoc.currencyCode, $baseCurrencyCode, $rates, $baseCurrencyCode)
				: doc.amount;

		return doc.kind === TransactionKind.Expense ? -amount : amount;
	}

	function addSortedLines(l: ReportLine) {
		l.sorted = Object.values(l.lines).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
		for (const item of l.sorted) {
			addSortedLines(item);
		}
	}

	function splitBySign(report: ReportLine): ReportLine {
		const incomes = {
			title: 'Income',
			docs: [],
			lines: {},
			sorted: [],
			total: 0
		} as ReportLine;
		const expenses = {
			title: 'Expenses',
			docs: [],
			lines: {},
			sorted: [],
			total: 0
		} as ReportLine;

		for (const line of report.sorted) {
			if (line.total >= 0) {
				incomes.sorted.push(line);
			} else {
				expenses.sorted.push(line);
			}
		}
		incomes.total = incomes.sorted.reduce((acc, line) => acc + line.total, 0);
		expenses.total = expenses.sorted.reduce((acc, line) => acc + line.total, 0);
		return {
			title: '',
			docs: [],
			lines: {},
			sorted: [incomes, expenses],
			total: 0
		};
	}

	function aggregateByCategory(docs: TransactionDoc[]): ReportLine {
		return docs.reduce(
			(acc, doc) => {
				// if category isn't assinged, create a dummy one
				const cat = doc.categoryId
					? data.categoryById[doc.categoryId]
					: ({ title: '_UNCATEGORIZED' } as { title: string; subtitle?: string });

				// initialize and add line to record if not exist
				const line =
					acc.lines[cat.title] ||
					(acc.lines[cat.title] = {
						title: cat.title,
						lines: {},
						sorted: [],
						docs: [],
						total: 0
					});

				line.docs.push(doc);
				line.total += amountInBaseCurrency(doc);

				if (cat.subtitle) {
					// initialize and add subline to record if not exist
					const subline =
						line.lines[cat.subtitle] ||
						(line.lines[cat.subtitle] = {
							title: cat.subtitle,
							lines: {},
							sorted: [],
							docs: [],
							total: 0
						});
					subline.docs.push(doc);
					subline.total += amountInBaseCurrency(doc);
				}

				acc.total += amountInBaseCurrency(doc);

				return acc;
			},
			{
				title: '',
				lines: {},
				docs: [],
				sorted: [],
				total: 0
			} as ReportLine
		);
	}
</script>

<svelte:head>
	<title>Report - Acc</title>
</svelte:head>

<Header title="Report" subtitle="Amounts in {$baseCurrencyCode}" returnPath="#/" />

<div class="px-4 pt-4">
	<InputBox class="w-full" type="month" bind:value={monthYear} />
</div>

{#await reportPromise then report}
	<div class="pb-6">
		<Line
			line={splitBySign(report)}
			header
			currencyCode={$baseCurrencyCode}
			ondocs={(docs) => {
				displayDocs = docs;
				document.documentElement.style.setProperty('overflow', 'hidden');
			}}
		/>
	</div>
{/await}

{#if displayDocs}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- bottom sheet, closes on a backdrop tap -->
	<div
		class="fixed inset-0 z-[6] flex flex-col justify-end bg-black/40"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				closeDocs();
			}
		}}
	>
		<div
			class="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl"
		>
			<div class="sticky top-0 flex items-center border-b border-line bg-surface px-5 py-2">
				<h2 class="flex-auto text-lg font-semibold">Transactions</h2>
				<button
					class="-mr-2 flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[0.06] active:bg-fg/10"
					aria-label="Close"
					onclick={closeDocs}><CloseIcon /></button
				>
			</div>

			<div class="divide-y divide-line">
				{#each displayDocs as doc}
					<div class="px-5 py-3">
						<div class="flex items-start gap-3">
							<span class="min-w-0 flex-auto break-words">{doc.comment}</span>
							<span
								class={[
									'flex-none font-semibold tabular-nums',
									doc.kind === TransactionKind.Income && 'text-positive'
								]}
							>
								{formatAmount(
									doc.kind === TransactionKind.Expense ? -doc.amount : doc.amount,
									true,
									true
								)}
								<span class="text-sm font-normal text-muted"
									>{data.accountById[doc.accountId]?.currencyCode}</span
								>
							</span>
						</div>
						<div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
							{#if data.accountById[doc.accountId]}
								<span>
									{data.accountGroupById[data.accountById[doc.accountId].groupId]?.title}:{data
										.accountById[doc.accountId].title}
								</span>
							{/if}

							{#if doc.categoryId && data.categoryById[doc.categoryId]}
								<span class="chip">
									{`${data.categoryById[doc.categoryId].title}${data.categoryById[doc.categoryId].subtitle ? `:${data.categoryById[doc.categoryId].subtitle}` : ''}`}
								</span>
							{/if}
							<span class="ml-auto tabular-nums">
								{formatTimestamp(doc.timestamp)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
