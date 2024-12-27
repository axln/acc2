<script lang="ts">
	import type { AccountGroupDoc } from '~/type';

	interface Props {
		accountGroups: AccountGroupDoc[];
		groupId: string | undefined;
	}

	let { accountGroups, groupId = $bindable() }: Props = $props();
</script>

<select
	class="w-full rounded border border-solid border-[#ccc] p-[5px] text-[length:inherit] invalid:text-[#aaa]"
	bind:value={groupId}
	required
>
	<option value="" disabled selected hidden>Account Group</option>

	{#each accountGroups as group}
		<option value={group.id}>{group.title}</option>
	{/each}
</select>
