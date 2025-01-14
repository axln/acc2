import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getCategories } = await import('~/lib/db');

	const category = (await getCategories()).find((c) => c.id === params.id);

	if (!category) {
		error(404, `Category ${params.id} not found`);
	}

	return {
		category
	};
};
