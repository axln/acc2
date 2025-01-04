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
	RateDoc
} from '~/type';
import { TransactionKind } from './enum';
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
	console.log('Getting entries...');
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

export async function getCurrencies(): Promise<CurrencyDoc[]> {
	await initDb();
	return db.getAll('currencies');
}

export async function createTransaction(params: TransactionParams) {
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

	const [changed1, changed2] = await Promise.all([
		recalcBalance(transactionDoc.accountId),
		transactionDoc.secondAccountId ? recalcBalance(transactionDoc.secondAccountId) : false
	]);
	/* if (changed1 || changed2) {
		accounts.set(await getAccounts());
	} */
	return transactionDoc;
}

export async function recalcBalance(accountId: string) {
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

	const [changed1, changed2] = await Promise.all([
		recalcBalance(transactionDoc.accountId),
		transactionDoc.secondAccountId ? recalcBalance(transactionDoc.secondAccountId) : null,
		prevTransactionDoc.secondAccountId &&
		prevTransactionDoc.secondAccountId !== newParams.secondAccountId
			? recalcBalance(prevTransactionDoc.secondAccountId)
			: null
	]);

	/* if (changed1 || changed2) {
		 accounts.set(await getAccounts());
	} */
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
