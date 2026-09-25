// How many entries the account page reads at a time
export const PAGE_SIZE = 50;

// How many entries the account page had loaded when it opened one of its own views (a
// transaction, the edit form). Coming back loads as many again, so the scroll position
// and the highlighted transaction are still there.
let saved: { accountId: string; count: number } | null = null;

export function saveLoadedCount(accountId: string, count: number) {
	saved = { accountId, count };
}

export function clearLoadedCount() {
	saved = null;
}

export function getLoadedCount(accountId: string) {
	return saved?.accountId === accountId ? saved.count : 0;
}
