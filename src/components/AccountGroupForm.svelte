<script lang="ts">
	import type { AccountGroupDoc } from '~/type';
	import CurrencySelect from '~/components/CurrencySelect.svelte';
	import InputBox from '~/components/controls/InputBox.svelte';
	import Button from '~/components/controls/Button.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		accountGroup?: AccountGroupDoc;
		onsave(params: { currencyCode: string; title: string }): Promise<void>;
	}

	const { baseCurrencyCode } = useStore();

	let { accountGroup, onsave }: Props = $props();

	let currencyCode = $state(accountGroup?.currencyCode || $baseCurrencyCode);
	let title = $state(accountGroup?.title || '');
	let adding = $state(false);
</script>

<form
	class="m-[10px] space-y-2.5"
	onsubmit={async (e) => {
		e.preventDefault();
		if (title.trim() && currencyCode) {
			try {
				adding = true;
				await onsave({
					title: title.trim(),
					currencyCode
				});
			} catch (e) {
				alert(`Failed to save group: ${e}`);
			} finally {
				adding = false;
			}
		} else {
			alert('All fields must be specified.');
		}
	}}
>
	<div>
		<CurrencySelect bind:currencyCode />
	</div>
	<div>
		<InputBox
			class="w-full"
			type="text"
			bind:value={title}
			placeholder="Title"
			disabled={adding}
			focus
		/>
	</div>
	<div>
		<Button class="w-full p-[5px]" type="submit" disabled={adding}>
			{#if accountGroup}
				Save
			{:else}
				Create
			{/if}
		</Button>
	</div>
</form>
