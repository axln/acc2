import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getAccount, getAccountGroups } = await import('~/lib/db');

	const accountDoc = await getAccount(params.id);
	if (!accountDoc) {
		error(404, `Account ${params.id} not found`);
	}

	return {
		accountDoc,
		accountGroups: await getAccountGroups()
	};
};
