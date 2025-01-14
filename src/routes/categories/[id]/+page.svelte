<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import CategoryForm from '~/components/CategoryForm.svelte';
	import { useStore } from '~/lib/store.js';

	let { categories } = useStore();
	let { data } = $props();

	async function onsave(title: string, subtitle?: string) {
		const { updateCategory, getCategories } = await import('~/lib/db');
		await updateCategory({
			...data.category,
			title,
			subtitle: subtitle || ''
		});
		$categories = await getCategories();
		goto(`#/categories`);
	}
</script>

<svelte:head>
	<title>Category - Acc</title>
</svelte:head>

<Header title="Category" returnPath="#/categories" />

<CategoryForm category={data.category} {onsave} />
