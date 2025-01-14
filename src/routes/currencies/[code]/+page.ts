import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getCurrencies } = await import('~/lib/db');

	const currency = (await getCurrencies()).find((c) => c.code === params.code);

	if (!currency) {
		error(404, `Category ${params.code} not found`);
	}

	return {
		currency
	};
};
