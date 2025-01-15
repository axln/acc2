<script lang="ts">
	import { focus } from '~/lib/actions/focus';

	interface Props {
		value?: string;
		focus?: boolean;
		[key: string]: any;
	}

	let { value = $bindable(), ...rest }: Props = $props();
</script>

<input
	bind:value
	{...rest}
	class={[
		'h-[36px] rounded-sm border border-gray-400 px-[5px] text-[length:inherit] disabled:border-gray-300 disabled:text-gray-400',
		rest.class
	]}
	use:focus={rest.focus}
/>
