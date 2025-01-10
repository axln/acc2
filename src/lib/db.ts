import { type IDBPDatabase, openDB } from 'idb';
import { nanoid } from 'nanoid';
import type {
	AccDB,
	TransactionParams,
	TransactionDoc,
	EntryDoc,
	AccountGroupDoc,
	CategoryDoc,
	CurrencyDoc,
	SettingsDoc,
	RateDoc,
	AccountDoc,
	DBSnapshot
} from '~/type';
import { TransactionKind } from './enum';
import { baseCurrencyName } from './const';
import { formatTimestamp } from './utils';

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

export async function getAccountGroup(id: string) {
	await initDb();
	return db.get('accountGroups', id);
}

export async function getAccounts() {
	// console.log('gettting accounts...');
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
	// console.log('Getting entries...');
	await initDb();
	const entryDocs = await db.getAllFromIndex('entries', 'accountId', accountId);
	return entryDocs.sort((a, b) => {
		const cmp = a.timestamp - b.timestamp;
		return reverse ? -cmp : cmp;
	});
}

export async function getCategories() {
	await initDb();
	return db.getAllFromIndex('categories', 'title');
}

export async function createCategory(title: string, subtitle: string) {
	await initDb();
	const cat = {
		id: nanoid(5),
		title,
		subtitle
	};
	await db.put('categories', cat);
	return cat;
}

export async function updateCategory(categoryDoc: CategoryDoc) {
	await initDb();
	await db.put('categories', categoryDoc);
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

export async function updateAccount(accountDoc: AccountDoc) {
	await initDb();
	await db.put('accounts', accountDoc);
}

export async function getCurrencies(): Promise<CurrencyDoc[]> {
	await initDb();
	return db.getAll('currencies');
}

export async function createTransaction(params: TransactionParams) {
	await initDb();

	const tx = db.transaction(['entries', 'transactions'], 'readwrite');
	const entriesStore = tx.objectStore('entries');
	const transactionsStore = tx.objectStore('transactions');

	const [transactionDoc, entryDoc, secondEntryDoc] = makeTransactionDocs(
		params,
		nanoid(5),
		nanoid(5),
		nanoid(5)
	);

	await Promise.all([
		transactionsStore.add(transactionDoc),
		entriesStore.add(entryDoc),
		...(secondEntryDoc ? [entriesStore.add(secondEntryDoc)] : []),
		tx.done
	]);

	await Promise.all([
		recalcBalance(transactionDoc.accountId),
		transactionDoc.secondAccountId ? recalcBalance(transactionDoc.secondAccountId) : false
	]);

	return transactionDoc;
}

export async function recalcBalance(accountId: string) {
	await initDb();

	const entries = await getEntries(accountId, false);
	let total = 0;
	for (const entry of entries) {
		total += entry.amount;
		if (entry.total !== total) {
			await db.put('entries', {
				...entry,
				total
			});
		}
	}
	const account = await getAccount(accountId);
	if (!account) {
		return;
	}
	if (account.balance !== total) {
		await db.put('accounts', {
			...account,
			balance: total
		});
		return true;
	}
	return false;
}

export function makeTransactionDocs(
	{
		kind,
		accountId,
		timestamp,
		categoryId,
		secondAccountId,
		secondAmount,
		amount,
		comment,
		reconciled
	}: TransactionParams,
	transactionId: string,
	entryId: string,
	secondEntryId?: string
): [TransactionDoc, EntryDoc, EntryDoc?] {
	const entryDoc: EntryDoc = {
		id: entryId,
		timestamp,
		accountId,
		...(categoryId ? { categoryId } : {}),
		transactionId,
		comment,
		amount: kind === TransactionKind.Income ? amount : -amount,
		total: 0,
		...(reconciled ? { reconciled } : {})
	};

	if (kind === TransactionKind.Transfer && secondEntryId && secondAccountId) {
		const secondEntryDoc: EntryDoc = {
			id: secondEntryId,
			timestamp,
			accountId: secondAccountId,
			transactionId,
			comment,
			amount: secondAmount || amount,
			total: 0,
			...(reconciled ? { reconciled } : {})
		};

		const transactionDoc: TransactionDoc = {
			id: transactionId,
			kind,
			timestamp,
			accountId,
			secondAccountId,
			amount,
			...(secondAmount ? { secondAmount } : {}),
			comment,
			entryId: entryDoc.id,
			secondEntryId: secondEntryDoc.id,
			...(reconciled ? { reconciled } : {})
		};
		return [transactionDoc, entryDoc, secondEntryDoc];
	} else {
		const transactionDoc: TransactionDoc = {
			id: transactionId,
			kind,
			timestamp,
			accountId,
			...(categoryId ? { categoryId } : {}),
			amount,
			comment,
			entryId: entryDoc.id,
			...(reconciled ? { reconciled } : {})
		};
		return [transactionDoc, entryDoc];
	}
}

export async function updateTransaction(
	prevTransactionDoc: TransactionDoc,
	newParams: TransactionParams
) {
	await initDb();

	const [prevEntryDoc, prevSecondEntryDoc] = await Promise.all([
		db.get('entries', prevTransactionDoc.entryId),
		prevTransactionDoc.secondEntryId ? db.get('entries', prevTransactionDoc.secondEntryId) : null
	]);
	if (!prevEntryDoc) {
		return;
	}

	const [transactionDoc, entryDoc, secondEntryDoc] = makeTransactionDocs(
		newParams,
		prevTransactionDoc.id,
		prevEntryDoc.id,
		prevSecondEntryDoc ? prevSecondEntryDoc.id : nanoid(5)
	);

	await Promise.all([
		db.put('transactions', transactionDoc),
		db.put('entries', entryDoc),
		secondEntryDoc
			? prevSecondEntryDoc
				? db.put('entries', secondEntryDoc)
				: db.add('entries', secondEntryDoc)
			: prevSecondEntryDoc
				? db.delete('entries', prevSecondEntryDoc.id)
				: null
	]);

	await Promise.all([
		recalcBalance(transactionDoc.accountId),
		transactionDoc.secondAccountId ? recalcBalance(transactionDoc.secondAccountId) : null,
		prevTransactionDoc.secondAccountId &&
		prevTransactionDoc.secondAccountId !== newParams.secondAccountId
			? recalcBalance(prevTransactionDoc.secondAccountId)
			: null
	]);
}

export async function deleteTransaction(id: string) {
	await initDb();
	const transactionDoc = await db.get('transactions', id);
	if (!transactionDoc) {
		return;
	}

	await Promise.all([
		db.delete('transactions', id),
		db.delete('entries', transactionDoc.entryId),
		transactionDoc.secondEntryId ? db.delete('entries', transactionDoc.secondEntryId) : null
	]);

	await Promise.all([
		recalcBalance(transactionDoc.accountId),
		transactionDoc.secondAccountId ? recalcBalance(transactionDoc.secondAccountId) : null
	]);
}

export async function updateAccountGroup(accountGroupDoc: AccountGroupDoc) {
	await initDb();
	await db.put('accountGroups', accountGroupDoc);
}

export async function createAccountGroup(title: string, currencyCode: string) {
	await initDb();
	await db.put('accountGroups', {
		id: nanoid(5),
		currencyCode,
		title
	});
}

export async function createCurrency(code: string, title: string) {
	await initDb();
	await db.put('currencies', {
		code,
		title
	});
}

export async function updateCurrency(currencyDoc: CurrencyDoc) {
	await initDb();
	await db.put('currencies', currencyDoc);
}

export async function updateSettings(settingsDoc: SettingsDoc) {
	await initDb();
	await db.put('settings', settingsDoc);
}

export async function updateRates(rateDocs: RateDoc[], baseCurrencyCode: string) {
	await initDb();

	const newRates: Record<string, number> = {};
	await db.delete('rates', baseCurrencyCode);
	await Promise.all(
		rateDocs.map((doc) => {
			newRates[doc.code] = doc.rate;
			return db.put('rates', doc);
		})
	);
	return newRates;
}

export async function getDBSnapshot(): Promise<DBSnapshot> {
	await initDb();

	const [currencies, accountGroups, accounts, categories, transactions, entries, settings, rates] =
		await Promise.all([
			getCurrencies(),
			getAccountGroups(),
			getAccounts(),
			getCategories(),
			db.getAll('transactions'),
			db.getAll('entries'),
			db.getAll('settings'),
			db.getAll('rates')
		]);

	return {
		ver: formatTimestamp(Date.now()),
		currencies,
		rates,
		settings,
		accountGroups,
		accounts,
		categories,
		transactions,
		entries
	};
}

export function validateDBSnapshot(snapshot: DBSnapshot) {
	if (!snapshot.ver) {
		return false;
	}

	if (!snapshot.currencies) {
		return false;
	}

	if (!snapshot.accountGroups) {
		return false;
	}

	if (!snapshot.categories) {
		return false;
	}

	if (!snapshot.categories) {
		return false;
	}

	if (!snapshot.transactions) {
		return false;
	}

	if (!snapshot.entries) {
		return false;
	}

	return true;
}

export async function restoreSnapshot(snapshot: DBSnapshot) {
	await initDb();

	if (!confirm('All the data will be overwritten. Are you sure you want to continue?')) {
		return false;
	}

	if (validateDBSnapshot(snapshot)) {
		const tx = db.transaction(
			[
				'currencies',
				'accountGroups',
				'accounts',
				'categories',
				'transactions',
				'entries',
				'settings',
				'rates'
			],
			'readwrite'
		);

		await Promise.all([
			tx.objectStore('currencies').clear(),
			tx.objectStore('accountGroups').clear(),
			tx.objectStore('accounts').clear(),
			tx.objectStore('categories').clear(),
			tx.objectStore('transactions').clear(),
			tx.objectStore('entries').clear(),
			tx.objectStore('settings').clear(),
			tx.objectStore('rates').clear()
		]);

		for (const item of snapshot.currencies) {
			await tx.objectStore('currencies').put(item);
		}
		for (const item of snapshot.accountGroups) {
			await tx.objectStore('accountGroups').put(item);
		}
		for (const item of snapshot.accounts) {
			await tx.objectStore('accounts').put(item);
		}
		for (const item of snapshot.categories) {
			await tx.objectStore('categories').put(item);
		}
		for (const item of snapshot.transactions) {
			await tx.objectStore('transactions').put(item);
		}
		for (const item of snapshot.entries) {
			await tx.objectStore('entries').put(item);
		}
		for (const item of snapshot.settings) {
			await tx.objectStore('settings').put(item);
		}
		for (const item of snapshot.rates) {
			await tx.objectStore('rates').put(item);
		}

		await tx.done;
		return true;
	} else {
		alert('Invalid snapshot format.');
		return false;
	}
}

export async function getTransactions(start: number, end: number, reverse = false) {
	await initDb();

	const transactionDocs = await db.getAllFromIndex(
		'transactions',
		'timestamp',
		IDBKeyRange.bound(start, end, false, true)
	);
	return transactionDocs.sort((a, b) => b.timestamp - a.timestamp);
}
