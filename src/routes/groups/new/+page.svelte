<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import AccountGroupForm from '~/components/AccountGroupForm.svelte';

	async function onsave(params: { title: string; currencyCode: string }) {
		const { createAccountGroup } = await import('~/lib/db');
		await createAccountGroup(params.title, params.currencyCode);
		goto('/#/groups');
	}
</script>

<Header title="New Account Group" returnPath="/#/groups" />

<AccountGroupForm {onsave} />
