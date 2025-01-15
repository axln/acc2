import type { AccountDoc } from '~/type';
import { weekDays } from './const';

export function formatAmount(value: number, sep?: boolean, plus?: boolean) {
	value = Math.round(value);
	const wholePart = value < 0 ? Math.ceil(value / 100) : Math.floor(value / 100);
	const decimalPart = Math.abs(value % 100);

	return (
		(plus && value > 0 ? '+' : '') +
		`${sep ? numberWithSep(wholePart) : wholePart}.${String(decimalPart).padStart(2, '0')}`
	);
}

function numberWithSep(x: number, sep = ' ') {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

export function getCurrencyRate(
	fromCode: string,
	toCode: string,
	rates: Record<string, number>,
	baseCurrencyCode: string
) {
	const baseRate = rates[fromCode] ? rates[fromCode] : 1;

	if (toCode === baseCurrencyCode) {
		return baseRate;
	} else {
		return rates[toCode] ? baseRate / rates[toCode] : 1;
	}
}

export function getGroupBalance(
	groupAccounts: AccountDoc[],
	currencyCode: string,
	rates: Record<string, number>,
	baseCurrencyCode: string
) {
	return groupAccounts.reduce((balance: number, acc: AccountDoc) => {
		if (acc.currencyCode === currencyCode) {
			balance += acc.balance;
		} else {
			balance +=
				acc.balance * getCurrencyRate(acc.currencyCode, currencyCode, rates, baseCurrencyCode);
		}

		return balance;
	}, 0);
}

export function formatDate(timestamp: number) {
	const date = new Date(timestamp);
	const offset = date.getTimezoneOffset() * 60000; // Convert to milliseconds
	const localTime = new Date(date.getTime() - offset);

	const year = localTime.getUTCFullYear();
	const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
	const day = String(localTime.getUTCDate()).padStart(2, '0');
	const weekDay = weekDays[localTime.getUTCDay()];

	return `${year}-${month}-${day} ${weekDay}`;
}

export function formatTime(timestamp: number) {
	const date = new Date(timestamp);
	const offset = date.getTimezoneOffset() * 60000; // Convert to milliseconds
	const localTime = new Date(date.getTime() - offset);

	const hours = String(localTime.getUTCHours()).padStart(2, '0');
	const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

	return `${hours}:${minutes}`;
}

export function getLocalCustomISODateString(date: Date) {
	const offset = date.getTimezoneOffset() * 60000; // Convert to milliseconds
	const localTime = new Date(date.getTime() - offset);

	const year = localTime.getFullYear();
	const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
	const day = String(localTime.getUTCDate()).padStart(2, '0');
	const hours = String(localTime.getUTCHours()).padStart(2, '0');
	const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function validateAmount(value: string) {
	return /^[1-9]\d*([.,](\d{1,2})?)?$/.test(value);
}

export function parseAmount(value: string): number {
	if (/[.,]/.test(value)) {
		let [whole, decimal] = value.split(/[.,]/);
		if (decimal.trim() === '') {
			return parseInt(whole) * 100;
		} else {
			if (decimal.length === 1) {
				decimal = decimal + '0';
			}
			return parseInt(whole + decimal);
		}
	} else {
		return parseInt(value) * 100;
	}
}

export function validateRate(value: string) {
	return /^([1-9]\d*|[0])([.,]\d+)?$/.test(value);
}

export function parseRate(value: string): number {
	return parseFloat(value.replace(',', '.'));
}

export function formatTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	const offset = date.getTimezoneOffset() * 60000; // Convert to milliseconds
	const localTime = new Date(date.getTime() - offset);

	const year = localTime.getFullYear();
	const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
	const day = String(localTime.getUTCDate()).padStart(2, '0');
	const hours = String(localTime.getUTCHours()).padStart(2, '0');
	const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function downloadJSON(data: object, fileName: string) {
	const dataBlob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json'
	});
	const url = URL.createObjectURL(dataBlob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(url);
}

export function chooseTextFile(onChoose: (text: string) => void) {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'application/json';
	fileInput.multiple = false;

	fileInput.onchange = () => {
		const file = fileInput!.files![0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function () {
				onChoose(reader.result as string);
			};
			reader.readAsText(file);
		}
	};

	fileInput.click();
}

export function safeJSONParse(text: string) {
	try {
		return JSON.parse(text);
	} catch (_) {
		console.warn('JSON parsing failed.');
		return null;
	}
}

export function highlightElement(element: HTMLElement, className: string) {
	if (element.classList.contains(className)) {
		element.classList.remove(className);
		// hack with reflow triggering
		void element.offsetWidth;
		element.classList.add(className);
		return;
	}

	element.addEventListener(
		'animationend',
		() => {
			element.classList.remove(className);
		},
		{ once: true }
	);
	element.classList.add(className);
}
