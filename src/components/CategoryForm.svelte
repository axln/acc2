<script lang="ts">
	import type { CategoryDoc } from '~/type';
	import InputBox from './controls/InputBox.svelte';
	import Button from './controls/Button.svelte';

	interface Props {
		category?: CategoryDoc;
		onsave(title: string, subtitle?: string): Promise<void>;
	}

	let { category, onsave }: Props = $props();

	let title = $state(category?.title || '');
	let subtitle = $state(category?.subtitle || '');
</script>

<form
	class="m-[10px] space-y-2.5"
	onsubmit={async (e) => {
		e.preventDefault();
		if (title.trim()) {
			onsave(title, subtitle);
		} else {
			alert('The title must be specified.');
		}
	}}
>
	<div>
		<InputBox class="w-full" type="text" bind:value={title} placeholder="Title" focus />
	</div>

	<div>
		<InputBox class="w-full" type="text" bind:value={subtitle} placeholder="Subtitle (optional)" />
	</div>

	<div>
		<Button class="w-full" type="submit">
			{#if category}
				Save
			{:else}
				Create
			{/if}
		</Button>
	</div>
</form>
