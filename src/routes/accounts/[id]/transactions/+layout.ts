import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
// export const ssr = false;

export const load: LayoutLoad = async ({ params }) => {
	const { getAccount, getAccountGroups, getAccounts } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	return {
		account,
		accountGroups: await getAccountGroups(),
		accounts: await getAccounts()
	};
};
