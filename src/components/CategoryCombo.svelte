<script lang="ts">
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

	let filter = $state(false);

	// let value = $state(categoryId ? getCategoryTitle(categoryId) : '');

	let categoryList = $derived.by(() => {
		value; // trigger on change
		return filter
			? $categories.filter((c) => {
					const fullTitle = `${c.title}:${c.subtitle}`;
					return fullTitle.toLowerCase().includes(value.trim().toLowerCase());
				})
			: $categories;
	});

	let dropdown: DropDown;

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

	export function clear() {
		categoryId = '';
		value = '';
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
	bind:this={dropdown}
>
	{#snippet caption()}
		<InputBox
			class="w-full"
			type="text"
			bind:value
			placeholder="Category"
			oninput={() => {
				// console.log('value:', value);
				dropdown.show();
				const category = $categories.find(
					(c) => value.trim().toLocaleLowerCase() === formatTitle(c).toLocaleLowerCase()
				);
				if (category) {
					categoryId = category.id;
					value = formatTitle(category);
					filter = false;
				} else {
					categoryId = '';
					filter = true;
				}
			}}
		/>
	{/snippet}

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions-->
	<ul
		onclick={(e) => {
			if (e.target instanceof HTMLLIElement) {
				categoryId = e.target.dataset.id;
				const category = $categories.find((c) => c.id === categoryId);
				if (category) {
					value = formatTitle(category);
				}
				dropdown.close();
				filter = false;
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
				{c.title}{c.subtitle ? `:${c.subtitle}` : ''}
			</li>
		{:else}
			<li class="px-4 py-3 text-muted">No matching categories</li>
		{/each}
	</ul>
</DropDown>
