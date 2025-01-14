<script lang="ts">
	import type { AccountGroupDoc } from '~/type';
	import Select from './controls/Select.svelte';

	interface Props {
		accountGroups: AccountGroupDoc[];
		groupId: string | undefined;
	}

	let { accountGroups, groupId = $bindable() }: Props = $props();
</script>

<Select class="w-full" bind:value={groupId} placeholder="Account Group" required>
	{#each accountGroups as g}
		<option value={g.id}>{g.title}</option>
	{/each}
</Select>
