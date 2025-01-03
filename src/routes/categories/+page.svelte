<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import { useStore } from '~/lib/store';

	const { categories } = useStore();
</script>

<Header title="Categories" returnPath="/#/" addPath="/#/categories/new" />
{#each $categories as c (c.id)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cursor-pointer border-b border-gray-300 p-[10px]"
		data-id={c.id}
		onclick={(e) => {
			if (e.currentTarget.dataset.id) {
				goto(`/#/categories/${e.currentTarget.dataset.id}`);
			}
		}}
	>
		{c.title}{c.subtitle ? `:${c.subtitle}` : ''}
	</div>
{/each}
