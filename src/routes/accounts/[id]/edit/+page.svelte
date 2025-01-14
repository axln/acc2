<script lang="ts">
	import { goto } from '$app/navigation';
	import AccountForm, { type AccountInfo } from '~/components/AccountForm.svelte';
	import Header from '~/components/Header.svelte';

	let { data } = $props();

	async function onsave(fields: AccountInfo) {
		const { updateAccount } = await import('~/lib/db');
		await updateAccount({
			...data.account,
			...fields
		});
		goto(`#/accounts/${data.account.id}`);
	}
</script>

<Header title={data.account.title} returnPath="#/accounts/{data.account.id}" />

<AccountForm class="m-2.5" accountGroups={data.accountGroups} account={data.account} {onsave} />
