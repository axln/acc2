<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import CategoryForm from '~/components/CategoryForm.svelte';
	import { useStore } from '~/lib/store.js';

	let { categories } = useStore();

	async function onsave(title: string, subtitle?: string) {
		const { createCategory, getCategories } = await import('~/lib/db');
		await createCategory(title, subtitle || '');
		$categories = await getCategories();
		goto(`/#/categories`);
	}
</script>

<Header title="New Category" returnPath="/#/categories" />

<CategoryForm {onsave} />
