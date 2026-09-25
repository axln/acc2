<script lang="ts">
	import type { CurrencyDoc } from '~/type';
	import InputBox from './controls/InputBox.svelte';
	import Button from './controls/Button.svelte';

	interface Props {
		currency?: CurrencyDoc;
		onsave(code: string, title: string): Promise<void>;
	}

	let { currency, onsave }: Props = $props();

	let code = $state(currency?.code || '');
	let title = $state(currency?.title || '');

	async function onsubmit(e: SubmitEvent) {
		if (code.trim() && title.trim()) {
			await onsave(code, title);
		} else {
			alert('Code and title must be specified.');
		}
	}
</script>

<form class="space-y-3 p-4" {onsubmit}>
	<div>
		<InputBox
			class="w-full"
			type="text"
			bind:value={code}
			placeholder="Code"
			disabled={currency !== undefined}
		/>
	</div>

	<div>
		<InputBox class="w-full" type="text" bind:value={title} placeholder="Title" />
	</div>

	<div class="pt-2">
		<Button class="w-full" type="submit">
			{#if currency}
				Save
			{:else}
				Add
			{/if}
		</Button>
	</div>
</form>
