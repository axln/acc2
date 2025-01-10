<script lang="ts">
	import type { AccountDoc, AccountGroupDoc } from '~/type';
	import Select from './controls/Select.svelte';

	interface Props {
		accountId: string | undefined;
		accounts: AccountDoc[];
		accountGroups: AccountGroupDoc[];
		placeholder: string;
	}

	interface AccountByGroupItem {
		title: string;
		accounts: AccountDoc[];
	}

	let {
		accountId = $bindable(),
		accounts,
		accountGroups,
		placeholder = 'Account'
	}: Props = $props();

	let accountsByGroup = $derived(
		accountGroups.reduce((acc, ac) => {
			acc.push({
				title: ac.title,
				accounts: accounts.filter((a) => a.groupId === ac.id)
			});
			return acc;
		}, [] as AccountByGroupItem[])
	);
</script>

<Select class="w-full" bind:value={accountId} {placeholder} required>
	{#each accountsByGroup as g}
		<optgroup label={g.title}>
			{#each g.accounts as a}
				<option value={a.id}>{a.title}</option>
			{/each}
		</optgroup>
	{/each}
</Select>
