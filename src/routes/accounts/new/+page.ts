import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const { getAccountGroups } = await import('~/lib/db');

	return {
		accountGroups: await getAccountGroups()
	};
};
