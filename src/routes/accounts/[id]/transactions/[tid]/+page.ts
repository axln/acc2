import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getTransaction } = await import('~/lib/db');

	const transactionDoc = await getTransaction(params.tid);

	if (!transactionDoc) {
		error(404, `Transaction ${params.tid} not found`);
	}

	return {
		transactionDoc
	};
};
