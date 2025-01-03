<script lang="ts">
	import type { CurrencyDoc } from '~/type';
	import InputBox from './controls/InputBox.svelte';
	import Button from './controls/Button.svelte';

	interface Props {
		currencyDoc?: CurrencyDoc;
		onsave(code: string, title: string): Promise<void>;
	}

	let { currencyDoc, onsave }: Props = $props();

	let code = $state(currencyDoc?.code || '');
	let title = $state(currencyDoc?.title || '');

	async function onsubmit(e: SubmitEvent) {
		if (code.trim() && title.trim()) {
			await onsave(code, title);
		} else {
			alert('Code and title must be specified.');
		}
	}
</script>

<form {onsubmit}>
	<div class="m-[10px]">
		<InputBox
			class="w-full"
			type="text"
			bind:value={code}
			placeholder="Code"
			disabled={currencyDoc !== undefined}
		/>
	</div>

	<div class="m-[10px]">
		<InputBox class="w-full" type="text" bind:value={title} placeholder="Title" />
	</div>

	<div class="m-[10px]">
		<Button class="w-full p-[5px]" type="submit">
			{#if currencyDoc}
				Save
			{:else}
				Add
			{/if}
		</Button>
	</div>
</form>
