<script lang="ts">
	import { goto } from '$app/navigation';
	import type { AccountInfo } from '~/components/AccountForm.svelte';
	import AccountForm from '~/components/AccountForm.svelte';
	import Header from '~/components/Header.svelte';
	import { createAccount } from '~/lib/db';

	let { data } = $props();

	function onsave({ title, groupId, currencyCode }: AccountInfo) {
		createAccount(title, groupId, currencyCode)
			.then(() => {
				goto('/');
			})
			.catch((err) => {
				console.error('Failed to create account:', err);
			});
	}
</script>

<Header title="New Account" returnPath="/#/" />

<AccountForm class="m-2.5" accountGroups={data.accountGroups} {onsave} />
