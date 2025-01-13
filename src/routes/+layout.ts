import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	const { getBaseCurrencyCode, getRates, getCategories, getCurrencies } = await import('~/lib/db');

	return {
		baseCurrencyCode: await getBaseCurrencyCode(),
		rates: await getRates(),
		categories: await getCategories(),
		currencies: await getCurrencies()
	};
};
