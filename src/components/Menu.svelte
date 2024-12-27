<script lang="ts" module>
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
<ul class="m-0 select-none p-0 py-[5px]">
	{#each items as item (item.id)}
		<li
			class="cursor-pointer whitespace-nowrap hover:bg-[#e1effa] active:bg-[#d1e3f0]"
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
				<a class="block py-2.5 pl-5 pr-[30px]" href={item.to} draggable={false}>
					{item.title}
				</a>
			{:else}
				<span class="block py-2.5 pl-5 pr-[30px]">
					{item.title}
				</span>
			{/if}
		</li>
	{/each}
</ul>
