<script lang="ts" module>
	export interface AccountInfo {
		title: string;
		groupId: string;
		currencyCode: string;
	}
</script>

<script lang="ts">
	import type { AccountDoc, AccountGroupDoc } from '~/type';
	import AccountGroupSelect from './AccountGroupSelect.svelte';
	import CurrencySelect from './CurrencySelect.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		class?: string;

		accountGroups: AccountGroupDoc[];
		account?: AccountDoc;
		onsave: (fields: AccountInfo) => void;
	}

	let { baseCurrencyCode } = useStore();

	let groupId: string | undefined = $state();
	let currencyCode: string = $state($baseCurrencyCode);
	let adding = $state(false);
	let title = $state('');

	let input: HTMLInputElement;

	let { class: className = '', accountGroups, account, onsave }: Props = $props();

	$effect(() => {
		input.focus();
	});

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		adding = true;
		console.log('submit');
	}
</script>

<form class="space-y-2.5 {className}" {onsubmit}>
	<div>
		<AccountGroupSelect {accountGroups} bind:groupId />
	</div>

	<div>
		<CurrencySelect bind:currencyCode />
	</div>

	<div>
		<input
			class="w-full rounded border border-solid border-[#ccc] p-[5px] text-[length:inherit]"
			type="text"
			bind:value={title}
			bind:this={input}
			placeholder="Title"
			disabled={adding}
		/>
	</div>

	<div>
		<button
			class="w-full rounded border border-solid border-[#ccc] bg-gray-100 p-[5px] text-[inherit] hover:bg-gray-200 active:bg-gray-300"
			type="submit"
			disabled={adding}
		>
			{#if account}
				Save
			{:else}
				Create
			{/if}
		</button>
	</div>
</form>
