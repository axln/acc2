import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const { getAccountGroups, getAccounts } = await import('~/lib/db');

	return {
		accountGroups: await getAccountGroups(),
		accounts: await getAccounts()
	};
};
