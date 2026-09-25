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
		dropdown.show();
		await tick();
		// center the selected item in the popover, which is the scroll container
		const popover = list.parentElement!;
		const item = list.querySelector<HTMLElement>(`[data-id="${categoryId}"]`);
		popover.scrollTop = item ? item.offsetTop - (popover.clientHeight - item.offsetHeight) / 2 : 0;
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
				const category = $categories.find(
					(c) => text.trim().toLowerCase() === formatTitle(c).toLowerCase()
				);
				categoryId = category ? category.id : '';
				open();
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
