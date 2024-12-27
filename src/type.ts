import type { DBSchema } from 'idb';
import { TransactionKind } from '~/lib/enum';

export interface AccountGroupDoc {
	id: string;
	currencyCode: string;
	title: string;
}

export interface AccountDoc {
	id: string;
	groupId: string;
	currencyCode: string;
	title: string;
	balance: number;
}

export interface CurrencyDoc {
	code: string;
	title: string;
}

export interface RateDoc {
	code: string;
	rate: number;
}

export interface CategoryDoc {
	id: string;
	title: string;
	subtitle?: string;
}

export interface EntryDoc {
	id: string;
	timestamp: number;
	accountId: string;
	categoryId?: string;
	transactionId: string;
	amount: number;
	total: number;
	comment: string;
	reconciled?: boolean;
}

export interface SettingsDoc {
	name: string;
	value: string;
}

export interface TransactionDoc {
	id: string;
	kind: TransactionKind;
	timestamp: number;
	accountId: string;
	entryId: string;
	amount: number;
	categoryId?: string;
	secondAccountId?: string;
	secondEntryId?: string;
	secondAmount?: number;
	comment: string;
	reconciled?: boolean;
}

export interface TransactionParams {
	kind: TransactionKind;
	timestamp: number;
	accountId: string;
	amount: number;
	categoryId?: string;
	secondAccountId?: string;
	secondAmount?: number;
	comment: string;
	reconciled?: boolean;
}

export interface AccDB extends DBSchema {
	accounts: {
		key: string;
		value: AccountDoc;
		indexes: {
			title: string;
		};
	};
	accountGroups: {
		key: string;
		value: AccountGroupDoc;
		indexes: {
			title: string;
		};
	};
	currencies: {
		key: string;
		value: CurrencyDoc;
	};
	rates: {
		key: string;
		value: RateDoc;
	};
	categories: {
		key: string;
		value: CategoryDoc;
		indexes: {
			title: [string, string];
		};
	};
	entries: {
		key: string;
		value: EntryDoc;
		indexes: {
			accountId: string;
		};
	};
	transactions: {
		key: string;
		value: TransactionDoc;
		indexes: {
			timestamp: number;
		};
	};
	settings: {
		key: string;
		value: SettingsDoc;
	};
}

export interface DBSnapshot {
	ver: string;
	currencies: CurrencyDoc[];
	accountGroups: AccountGroupDoc[];
	accounts: AccountDoc[];
	categories: CategoryDoc[];
	transactions: TransactionDoc[];
	entries: EntryDoc[];
	rates: RateDoc[];
	settings: SettingsDoc[];
}
