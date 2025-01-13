<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '~/components/Header.svelte';
	import AccountGroupForm from '~/components/AccountGroupForm.svelte';

	let { data } = $props();

	async function onsave(params: { title: string; currencyCode: string }) {
		const { updateAccountGroup } = await import('~/lib/db');
		await updateAccountGroup({
			id: data.accountGroup.id,
			...params
		});
		goto('/#/groups');
	}
</script>

<svelte:head>
	<title>Account Group - Acc</title>
</svelte:head>

<Header title="Account Group" returnPath="/#/groups" />

<AccountGroupForm accountGroup={data.accountGroup} {onsave} />
