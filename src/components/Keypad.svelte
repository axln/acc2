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
	class="grid grid-cols-3 gap-2"
	onpointerdown={(e) => {
		e.preventDefault();
	}}
	onpointerup={(e) => {
		if (e.target instanceof HTMLSpanElement && e.target.dataset.key) {
			onkey(e.target.dataset.key);
		}
	}}
>
	{#each keys.flat() as key}
		<span
			class="flex h-14 cursor-pointer items-center justify-center rounded-xl bg-surface text-2xl font-medium text-fg shadow-sm ring-1 ring-line/70 transition-colors active:bg-primary-soft"
			data-key={key}
		>
			{#if key === '<'}
				<BackspaceIcon size={26} />
			{:else}
				{key}
			{/if}
		</span>
	{/each}
</div>
