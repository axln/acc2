import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const { getAccount } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	const hashQuery = url.hash.split('?')[1];
	const t = hashQuery ? new URLSearchParams(hashQuery).get('t') : null;

	return {
		account,
		t
	};
};
