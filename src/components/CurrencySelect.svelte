<script lang="ts">
	import Select from './controls/Select.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		currencyCode?: string;
		[k: string]: any;
	}

	const { currencies } = useStore();

	let { currencyCode = $bindable(), ...rest }: Props = $props();
</script>

<Select {...rest} class={['w-full', rest.class]} bind:value={currencyCode} required>
	{#each $currencies as { code, title } (code)}}
		<option value={code}>{code} {title}</option>
	{/each}
</Select>
