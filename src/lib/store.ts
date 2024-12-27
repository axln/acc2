import type { Writable } from 'svelte/store';
import { getContext } from 'svelte';
import type { CategoryDoc, CurrencyDoc } from '~/type';

// just an unique value, object values are always unique
export const STORE = {};

export interface Store {
	rates: Writable<Record<string, number>>;
	baseCurrencyCode: Writable<string>;
	currencies: Writable<CurrencyDoc[]>;
	categories: Writable<CategoryDoc[]>;
}

export function useStore(): Store {
	return getContext(STORE);
}
