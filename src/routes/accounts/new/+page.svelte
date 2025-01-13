<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountInfo } from '~/components/AccountForm.svelte';
	import AccountForm from '~/components/AccountForm.svelte';
	import Header from '~/components/Header.svelte';

	let { data } = $props();

	async function onsave({ title, groupId, currencyCode }: AccountInfo) {
		const { createAccount } = await import('~/lib/db');
		try {
			await createAccount(title, groupId, currencyCode);
			goto('/');
		} catch (err) {
			console.error('Failed to create account:', err);
		}
	}
</script>

<svelte:head>
	<title>New Account - Acc</title>
</svelte:head>

<Header title="New Account" returnPath="/#/" />

<AccountForm class="m-2.5" accountGroups={data.accountGroups} {onsave} />
