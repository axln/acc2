<script module lang="ts">
	export interface MenuItem {
		id: string;
		title: string;
		to?: string;
	}
</script>

<script lang="ts">
	interface Props {
		items: MenuItem[];
		onmenu?: (id: string) => void;
	}

	let { items = [], onmenu }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ul class="m-0 min-w-52 select-none p-0 py-1.5">
	{#each items as item (item.id)}
		<li
			class="cursor-pointer whitespace-nowrap transition-colors hover:bg-fg/[0.05] active:bg-fg/10"
			data-id={item.id}
			onclick={(event: Event) => {
				if (event.currentTarget instanceof HTMLLIElement) {
					if (event.currentTarget.dataset.id) {
						onmenu?.(event.currentTarget.dataset.id);
					}
				}
			}}
		>
			{#if item.to}
				<a class="block px-5 py-3" href={item.to} draggable={false}>
					{item.title}
				</a>
			{:else}
				<span class="block px-5 py-3">
					{item.title}
				</span>
			{/if}
		</li>
	{/each}
</ul>
