import type { PageLoad } from './$types';
import type { CategoryDoc, AccountDoc } from '~/type';

export const load: PageLoad = async () => {
	const { getAccounts, getCategories } = await import('~/lib/db');

	const accounts = await getAccounts();
	const categories = await getCategories();

	return {
		accountById: accounts.reduce(
			(acc, a) => {
				acc[a.id] = a;
				return acc;
			},
			{} as Record<string, AccountDoc>
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
