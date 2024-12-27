import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const hashQuery = url.hash.split('?')[1];
	const t = hashQuery ? new URLSearchParams(hashQuery).get('t') : null;

	return {
		t
	};
};
