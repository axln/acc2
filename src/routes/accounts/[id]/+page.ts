import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { EntryDoc } from '~/type';
import { formatDate } from '~/lib/utils';

export const load: PageLoad = async ({ params }) => {
	const { getAccount, getEntries } = await import('~/lib/db');

	const account = await getAccount(params.id);

	if (!account) {
		error(404, `Account ${params.id} not found`);
	}

	const entries = await getEntries(account.id);

	return {
		account,
		entries,
		entriesByDays: entries.reduce(
			(acc, entry) => {
				const title = formatDate(entry.timestamp);

				if (acc[title]) {
					acc[title].push(entry);
				} else {
					acc[title] = [entry];
				}
				return acc;
			},
			{} as Record<string, EntryDoc[]>
		),
		lastTimestamp: entries?.length > 0 ? entries[0].timestamp + 60000 : null
	};
};
