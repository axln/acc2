import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { getAccountGroup } = await import('~/lib/db');

	const accountGroup = await getAccountGroup(params.id);
	if (!accountGroup) {
		error(404, `Account group ${params.id} not found`);
	}

	return {
		accountGroup
	};
};
