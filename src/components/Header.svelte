<script lang="ts">
	import type { MenuItem } from './Menu.svelte';
	import MenuIcon from './icons/MenuIcon.svelte';
	import BackIcon from './icons/BackIcon.svelte';
	import PlusIcon from './icons/PlusIcon.svelte';
	import DropDown from './controls/DropDown.svelte';
	import Menu from './Menu.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		returnPath?: string;
		addPath?: string;
		menuItems?: MenuItem[];
		onmenu?: (id: string) => void;
	}

	let { title, subtitle, returnPath, addPath, menuItems, onmenu }: Props = $props();

	// svelte-ignore non_reactive_update
	let dropdown: DropDown;

	const iconButton =
		'flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/[0.06] active:bg-fg/10';
</script>

<!-- select-none: on a phone, a tap on the title would select it and bring up Chrome's search bar -->
<header
	class="sticky top-0 z-[5] flex h-16 select-none items-center gap-1 border-b border-line bg-surface/95 px-1.5 backdrop-blur"
>
	{#if returnPath}
		<a class={iconButton} href={returnPath} draggable={false} aria-label="Back">
			<BackIcon />
		</a>
	{/if}

	<div class={['min-w-0 flex-auto', !returnPath && 'pl-3']}>
		<h1 class="truncate text-xl font-semibold">{title}</h1>
		{#if subtitle}
			<div class="-mt-0.5 truncate text-sm text-muted">{subtitle}</div>
		{/if}
	</div>

	{#if addPath}
		<a class={iconButton} href={addPath} aria-label="Add">
			<PlusIcon />
		</a>
	{/if}

	{#if menuItems}
		<DropDown
			class={[
				"[&>[data-role='caption']]:rounded-full",
				"[&[data-opened]>[data-role='caption']]:bg-fg/[0.06]",
				"[&>[data-role='popover']]:top-full",
				"[&>[data-role='popover']]:mt-1"
			]}
			bind:this={dropdown}
		>
			{#snippet caption()}
				<span class={iconButton}><MenuIcon /></span>
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
</header>
