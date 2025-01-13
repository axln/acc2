<script lang="ts">
	import type { TransactionDoc } from '~/type.js';
	import InputBox from '~/components/controls/InputBox.svelte';
	import Header from '~/components/Header.svelte';
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
		l.sorted = Object.values(l.lines).sort((a, b) => a.total - b.total);
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

<Header title="Report" returnPath="#/" />

<div class="p-[10px]">
	<InputBox class="w-full" type="month" bind:value={monthYear} />
</div>

{#await reportPromise then report}
	<Line
		line={splitBySign(report)}
		header
		ondocs={(docs) => {
			displayDocs = docs;
			document.documentElement.style.setProperty('overflow', 'hidden');
		}}
	/>
{/await}

{#if displayDocs}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- popup -->
	<div class="fixed inset-0 z-[2] flex items-stretch bg-[#8885] p-[10px]">
		<!-- content -->
		<div class="flex-1 overflow-y-auto bg-[#fff] shadow-sm">
			<!-- header -->
			<div class="sticky top-0 flex items-center border-b border-[#ddd] bg-[#f4f4f8]">
				<h2 class="m-[0_10px] flex-auto text-[16px] font-bold text-gray-500">Transactions</h2>
				<button
					class="m-[5px] ml-auto rounded-sm border border-gray-400 p-[0_10px] align-middle"
					onclick={() => {
						displayDocs = null;
						document.documentElement.style.removeProperty('overflow');
					}}>X</button
				>
			</div>

			{#each displayDocs as doc}
				<div class="border-b border-[#ddd] p-[5px_10px]">
					<div class="flex">
						<span
							>{data.accountGroupById[data.accountById[doc.accountId].groupId].title}:{data
								.accountById[doc.accountId].title}</span
						>
						<span class="ml-auto">
							{formatAmount(
								doc.kind === TransactionKind.Expense ? -doc.amount : doc.amount,
								true,
								true
							)}
						</span>
						<span>{data.accountById[doc.accountId]?.currencyCode}</span>
					</div>
					<div class="flex items-center gap-[10px]">
						{#if doc.categoryId}
							<span>{doc.comment}</span>
							<span
								class="whitespace-nowrap rounded-[5px] border border-[#ddd] bg-[#eee] px-[3px] text-[13px]"
							>
								{`${data.categoryById[doc.categoryId].title}${data.categoryById[doc.categoryId].subtitle ? `:${data.categoryById[doc.categoryId].subtitle}` : ''}`}
							</span>
							<span class="ml-auto text-[13px] text-gray-400">
								{formatTimestamp(doc.timestamp)}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
