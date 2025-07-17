import type { PageLoad } from './$types';
import { getAccountGroups, getAccounts } from '~/lib/db';

export const load: PageLoad = async () => {
	return {
		accountGroups: await getAccountGroups(),
		accounts: await getAccounts()
	};
};
