import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getAccount, getEntries } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	return {
		account,
		entries: await getEntries(account.id)
	};
};
