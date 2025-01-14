import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getTransaction } = await import('~/lib/db');

	const transaction = await getTransaction(params.tid);

	if (!transaction) {
		error(404, `Transaction ${params.tid} not found`);
	}

	return {
		transaction
	};
};
