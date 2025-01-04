<script lang="ts">
	import type { AccountGroupDoc } from '~/type';
	import Select from './controls/Select.svelte';

	interface Props {
		accountGroups: AccountGroupDoc[];
		groupId: string | undefined;
	}

	let { accountGroups, groupId = $bindable() }: Props = $props();
</script>

<Select class="w-full p-[5px] invalid:text-[#aaa]" bind:value={groupId} required>
	<option value="" disabled selected hidden>Account Group</option>

	{#each accountGroups as group}
		<option value={group.id}>{group.title}</option>
	{/each}
</Select>
