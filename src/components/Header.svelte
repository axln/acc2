<script lang="ts">
	import type { MenuItem } from './Menu.svelte';
	import MenuIcon from './icons/MenuIcon.svelte';
	import BackIcon from './icons/BackIcon.svelte';
	import PlusIcon from './icons/PlusIcon.svelte';
	import DropDown from './controls/DropDown.svelte';
	import Menu from './Menu.svelte';

	interface Props {
		title: string;
		returnPath?: string;
		addPath?: string;
		menuItems?: MenuItem[];
		onmenu?: (id: string) => void;
	}

	let { title, returnPath, addPath, menuItems, onmenu }: Props = $props();

	// svelte-ignore non_reactive_update
	let dropdown: DropDown;
</script>

<header class="sticky top-0 z-[1] flex items-center bg-[cadetblue] p-2.5 text-white">
	<div class="min-w-[24px]">
		{#if returnPath}
			<a class="flex items-center" href={returnPath} draggable={false}>
				<BackIcon />
			</a>
		{/if}
	</div>

	<h1 class="m-0 flex-auto text-center text-white">
		{title}
	</h1>

	<div class="ml-auto flex min-w-[24px] gap-[15px]">
		{#if addPath}
			<a class="flex items-center" href={addPath}>
				<PlusIcon />
			</a>
		{/if}

		{#if menuItems}
			<DropDown
				class={[
					"[&>[data-role='caption']]:text-gray-200",
					"[&>[data-role='caption']]:hover:text-white",
					"[&>[data-role='caption']]:flex",
					"[&>[data-role='caption']]:items-center",
					"[&[data-opened]>[data-role='caption']]:text-white",
					"[&>[data-role='popover']]:text-[var(--default-text-color)]",
					"[&>[data-role='popover']]:rounded-sm"
				]}
				bind:this={dropdown}
			>
				{#snippet caption()}
					<MenuIcon />
				{/snippet}

				<Menu
					items={menuItems}
					onmenu={(id: string) => {
						dropdown.close();
						onmenu?.(id);
					}}
				/>
			</DropDown>
		{/if}
	</div>
</header>
