<script module>
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
	import InputBox from './controls/InputBox.svelte';
	import Button from './controls/Button.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		class?: any;
		accountGroups: AccountGroupDoc[];
		account?: AccountDoc;
		onsave: (fields: AccountInfo) => Promise<void>;
	}

	let { accountGroups, account, onsave, ...rest }: Props = $props();

	let { baseCurrencyCode } = useStore();

	let groupId = $state(account?.groupId || undefined);
	let currencyCode = $state(account?.currencyCode || $baseCurrencyCode);
	let title = $state(account?.title || '');

	let adding = $state(false);
</script>

<form
	class={['space-y-2.5', rest.class]}
	onsubmit={async (e) => {
		e.preventDefault();

		if (groupId && title.trim() && currencyCode) {
			adding = true;
			try {
				await onsave({ title, groupId, currencyCode });
			} finally {
				adding = false;
			}
		} else {
			alert('All fields are required.');
		}
	}}
>
	<div>
		<AccountGroupSelect {accountGroups} bind:groupId />
	</div>

	<div>
		<CurrencySelect bind:currencyCode />
	</div>

	<div>
		<InputBox
			class="w-full text-[length:inherit]"
			type="text"
			bind:value={title}
			focus
			placeholder="Title"
			disabled={adding}
		/>
	</div>

	<div>
		<Button class="w-full" type="submit" disabled={adding}>
			{#if account}
				Save
			{:else}
				Create
			{/if}
		</Button>
	</div>
</form>
