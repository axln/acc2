import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getAccount, getTransaction } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	const transactionDoc = await getTransaction(params.tid);

	if (!transactionDoc) {
		error(404, `Transaction ${params.tid} not found`);
	}

	return {
		account,
		transactionDoc
	};
};
