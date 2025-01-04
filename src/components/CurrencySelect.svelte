<script lang="ts">
	import Select from './controls/Select.svelte';
	import { useStore } from '~/lib/store';

	interface Props {
		currencyCode?: string;
		[k: string]: any;
	}

	const { currencies } = useStore();

	let { currencyCode = $bindable(), ...rest }: Props = $props();

	$inspect($currencies);
</script>

<Select
	{...rest}
	class={['w-full py-[7px] text-[length:inherit] invalid:text-[#aaa]', rest.class]}
	bind:value={currencyCode}
	required
>
	<option value="" disabled selected hidden>Currency</option>

	{#each $currencies as { code, title } (code)}}
		<option value={code}>{code} {title}</option>
	{/each}
</Select>
