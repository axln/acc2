import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { PAGE_SIZE, getLoadedCount } from './paging';

export const load: PageLoad = async ({ params }) => {
	const { getAccount, getEntriesPage } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	// only the newest entries, so the page opens quickly however long the history is;
	// the page reads older ones as it's scrolled
	const { entries, hasMore } = await getEntriesPage(
		account.id,
		Math.max(PAGE_SIZE, getLoadedCount(account.id))
	);

	return {
		account,
		entries,
		hasMore,
		lastTimestamp: entries.length > 0 ? entries[0].timestamp + 60000 : null
	};
};
