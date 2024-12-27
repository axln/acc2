<script lang="ts">
	import BackspaceIcon from './icons/BackspaceIcon.svelte';

	interface Props {
		onkey: (key: string) => void;
	}

	let { onkey }: Props = $props();

	const keys = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		['<', '0', '.']
	];
</script>

<div
	class="space-y-[5px]"
	onpointerdown={(e) => {
		e.preventDefault();
	}}
	onpointerup={(e) => {
		if (e.target instanceof HTMLSpanElement && e.target.dataset.key) {
			onkey(e.target.dataset.key);
		}
	}}
>
	{#each keys as row}
		<div class="flex gap-[5px]">
			{#each row as key}
				<span
					class="flex flex-1 cursor-pointer items-center justify-center rounded bg-gray-200 p-[5px] text-[26px] text-gray-700"
					data-key={key}
				>
					{#if key === '<'}
						<BackspaceIcon size={24} />
					{:else}
						{key}
					{/if}
				</span>
			{/each}
		</div>
	{/each}
</div>
