<script lang="ts">
	import { tick } from 'svelte';
	import type { CategoryDoc } from '~/type';
	import DropDown from './controls/DropDown.svelte';
	import InputBox from './controls/InputBox.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		categoryId: string | undefined;
		value: string;
	}

	let { categories } = useStore();

	let { categoryId = $bindable(), value = $bindable('') }: Props = $props();
	if (categoryId) {
		value = getCategoryTitle(categoryId);
	}

	// the text the list is filtered by; empty shows every category
	let query = $state('');

	let categoryList = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return $categories;
		}
		const matches = $categories.filter((c) => formatTitle(c).toLowerCase().includes(q));
		// names starting with the text go first, so typing a category lists its subcategories on top
		const starts = (c: CategoryDoc) => formatTitle(c).toLowerCase().startsWith(q);
		return [...matches.filter(starts), ...matches.filter((c) => !starts(c))];
	});

	// the choice before the arrow keys moved it, which Escape brings back
	let beforeMove: { categoryId: string | undefined; value: string } | null = null;

	let dropdown: DropDown;
	let list: HTMLUListElement;

	function getCategoryTitle(categoryId: string) {
		const category = $categories.find((c) => c.id === categoryId);
		if (category) {
			return formatTitle(category);
		} else {
			return '';
		}
	}

	function formatTitle(c: CategoryDoc) {
		return `${c.title}${c.subtitle ? `:${c.subtitle}` : ''}`;
	}

	async function open() {
		if (!dropdown.opened()) {
			beforeMove = null;
		}
		dropdown.show();
		await tick();
		// center the selected item in the popover, which is the scroll container
		const popover = list.parentElement!;
		const item = selectedItem();
		popover.scrollTop = item ? item.offsetTop - (popover.clientHeight - item.offsetHeight) / 2 : 0;
	}

	function selectedItem() {
		return list.querySelector<HTMLElement>(`[data-id="${categoryId}"]`);
	}

	// moves the selection by step through the shown list, putting its text in the field
	async function move(step: number) {
		// a closed list only opens, showing the current choice
		if (!dropdown.opened()) {
			query = categoryId ? '' : value;
			open();
			return;
		}
		if (categoryList.length === 0) {
			return;
		}
		const index = categoryList.findIndex((c) => c.id === categoryId);
		const next =
			index === -1
				? step > 0
					? 0
					: categoryList.length - 1
				: Math.min(Math.max(index + step, 0), categoryList.length - 1);
		beforeMove ??= { categoryId, value };
		categoryId = categoryList[next].id;
		value = formatTitle(categoryList[next]);
		await tick();
		// scroll just enough to show the item
		const popover = list.parentElement!;
		const item = selectedItem();
		if (item) {
			if (item.offsetTop < popover.scrollTop) {
				popover.scrollTop = item.offsetTop;
			} else if (item.offsetTop + item.offsetHeight > popover.scrollTop + popover.clientHeight) {
				popover.scrollTop = item.offsetTop + item.offsetHeight - popover.clientHeight;
			}
		}
	}

	function select(id: string) {
		categoryId = id;
		value = getCategoryTitle(id);
		query = '';
		dropdown.close();
	}

	export function clear() {
		categoryId = '';
		value = '';
		query = '';
	}
</script>

<DropDown
	class={[
		'w-full',
		"[&>[data-role='popover']]:left-0",
		"[&>[data-role='popover']]:mt-1",
		"[&>[data-role='popover']]:overflow-y-auto",
		"[&>[data-role='popover']]:max-h-[360px]",
		"[&>[data-role='popover']]:py-1.5"
	]}
	toggle={false}
	bind:this={dropdown}
>
	{#snippet caption()}
		<InputBox
			class="w-full"
			type="text"
			bind:value
			placeholder="Category"
			onclick={() => {
				// a chosen category shows the whole list, typed text keeps it filtered
				query = categoryId ? '' : value;
				open();
			}}
			oninput={(e: Event & { currentTarget: HTMLInputElement }) => {
				const text = e.currentTarget.value;
				query = text;
				// typing keeps the text, so Escape has nothing to undo
				beforeMove = null;
				const category = $categories.find(
					(c) => text.trim().toLowerCase() === formatTitle(c).toLowerCase()
				);
				categoryId = category ? category.id : '';
				open();
			}}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
					e.preventDefault();
					move(e.key === 'ArrowDown' ? 1 : -1);
				} else if (e.key === 'Enter' && dropdown.opened()) {
					// Enter fixes the choice and closes the list instead of submitting the form
					e.preventDefault();
					if (categoryId) {
						select(categoryId);
					} else {
						query = '';
						dropdown.close();
					}
				} else if (e.key === 'Escape' && dropdown.opened()) {
					// Escape drops the choice made with the arrows and closes the list
					if (beforeMove) {
						({ categoryId, value } = beforeMove);
					}
					query = '';
					dropdown.close();
				}
			}}
		/>
	{/snippet}

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions-->
	<ul
		bind:this={list}
		onclick={(e) => {
			if (e.target instanceof HTMLLIElement && e.target.dataset.id) {
				select(e.target.dataset.id);
			}
		}}
	>
		{#each categoryList as c (c.id)}
			<li
				class={[
					'cursor-pointer px-4 py-3 transition-colors hover:bg-fg/[0.05] active:bg-fg/10',
					c.id === categoryId && 'bg-primary-soft font-medium text-primary'
				]}
				data-id={c.id}
			>
				{formatTitle(c)}
			</li>
		{:else}
			<li class="px-4 py-3 text-muted">No matching categories</li>
		{/each}
	</ul>
</DropDown>
