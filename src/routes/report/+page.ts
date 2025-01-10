import type { PageLoad } from './$types';
import type { CategoryDoc, AccountDoc, AccountGroupDoc } from '~/type';

export const load: PageLoad = async () => {
	const { getAccounts, getCategories, getAccountGroups } = await import('~/lib/db');

	const accounts = await getAccounts();
	const accountGroups = await getAccountGroups();
	const categories = await getCategories();

	return {
		accountById: accounts.reduce(
			(acc, a) => {
				acc[a.id] = a;
				return acc;
			},
			{} as Record<string, AccountDoc>
		),
		accountGroupById: accountGroups.reduce(
			(acc, g) => {
				acc[g.id] = g;
				return acc;
			},
			{} as Record<string, AccountGroupDoc>
		),
		categoryById: categories.reduce(
			(acc, c) => {
				acc[c.id] = c;
				return acc;
			},
			{} as Record<string, CategoryDoc>
		)
	};
};
