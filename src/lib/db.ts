import { type IDBPDatabase, openDB } from 'idb';
import { nanoid } from 'nanoid';
import type { AccDB } from '~/type';
import { baseCurrencyName } from './const';

export let db: IDBPDatabase<AccDB>;

const dbPromise = openDB<AccDB>('acc', 3, {
	upgrade(upgradeDb, oldVer, newVer, tx) {
		if (!upgradeDb.objectStoreNames.contains('accountGroups')) {
			const accountGroupsStore = upgradeDb.createObjectStore('accountGroups', { keyPath: 'id' });
			accountGroupsStore.createIndex('title', 'title');
		}

		if (!upgradeDb.objectStoreNames.contains('accounts')) {
			const accountsStore = upgradeDb.createObjectStore('accounts', { keyPath: 'id' });
			accountsStore.createIndex('title', 'title');
		}

		if (!upgradeDb.objectStoreNames.contains('currencies')) {
			upgradeDb.createObjectStore('currencies', { keyPath: 'code' });
		}

		if (!upgradeDb.objectStoreNames.contains('categories')) {
			const categoriesStore = upgradeDb.createObjectStore('categories', { keyPath: 'id' });
			categoriesStore.createIndex('title', ['title', 'subtitle']);
		}

		if (!upgradeDb.objectStoreNames.contains('entries')) {
			const entriesStore = upgradeDb.createObjectStore('entries', { keyPath: 'id' });
			entriesStore.createIndex('accountId', 'accountId');
		}

		if (!upgradeDb.objectStoreNames.contains('transactions')) {
			const transactionsStore = upgradeDb.createObjectStore('transactions', { keyPath: 'id' });
			transactionsStore.createIndex('timestamp', 'timestamp');
		} else {
			const transactionsStore = tx.objectStore('transactions');
			console.log('store already exists, creating index');
			transactionsStore.createIndex('timestamp', 'timestamp');
		}

		if (!upgradeDb.objectStoreNames.contains('settings')) {
			upgradeDb.createObjectStore('settings', { keyPath: 'name' });
		}

		if (!upgradeDb.objectStoreNames.contains('rates')) {
			upgradeDb.createObjectStore('rates', { keyPath: 'code' });
		}
	}
}).then((dbInstance) => {
	db = dbInstance;
});

export async function initDb() {
	await dbPromise;
}

export async function getAccountGroups() {
	await initDb();
	return db.getAllFromIndex('accountGroups', 'title');
}

export async function getAccounts() {
	await initDb();
	return db.getAllFromIndex('accounts', 'title');
}

export async function getAccount(id: string) {
	await initDb();
	return db.get('accounts', id);
}

export async function getTransaction(id: string) {
	await initDb();
	return db.get('transactions', id);
}

export async function getBaseCurrencyCode() {
	await initDb();
	const settingsDocs = await db.getAll('settings');
	for (const settingsDoc of settingsDocs) {
		if (settingsDoc.name === baseCurrencyName) {
			return settingsDoc.value;
		}
	}

	return '';
}

export async function getRates() {
	await initDb();
	const rateDocs = await db.getAll('rates');
	return rateDocs.reduce(
		(acc, rateDoc) => {
			acc[rateDoc.code] = rateDoc.rate;
			return acc;
		},
		{} as Record<string, number>
	);
}

export async function getEntries(accountId: string, reverse = true) {
	await initDb();
	const entryDocs = await db.getAllFromIndex('entries', 'accountId', accountId);
	return entryDocs.sort((a, b) => {
		const cmp = b.timestamp - a.timestamp;
		return reverse ? -cmp : cmp;
	});
}

export async function getCategories() {
	await initDb();
	return db.getAllFromIndex('categories', 'title');
}

export async function createAccount(title: string, groupId: string, currencyCode: string) {
	await initDb();
	await db.put('accounts', {
		id: nanoid(5),
		title,
		groupId,
		currencyCode,
		balance: 0
	});
}

export async function getCurrencies() {
	await initDb();
	return db.getAll('currencies');
}
