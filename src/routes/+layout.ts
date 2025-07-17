import type { LayoutLoad } from './$types';
import { getBaseCurrencyCode, getRates, getCategories, getCurrencies } from '~/lib/db';

export const load: LayoutLoad = async () => {
	const [baseCurrencyCode, rates, categories, currencies] = await Promise.all([
		getBaseCurrencyCode(),
		getRates(),
		getCategories(),
		getCurrencies()
	]);

	return {
		baseCurrencyCode,
		rates,
		categories,
		currencies
	};
};
