import { TransactionKind } from './enum';

export const baseCurrencyName = 'baseCurrencyCode';
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const transactionKinds = [
	{
		value: TransactionKind.Expense,
		title: 'Expense'
	},
	{
		value: TransactionKind.Transfer,
		title: 'Transfer'
	},
	{
		value: TransactionKind.Income,
		title: 'Income'
	}
];
