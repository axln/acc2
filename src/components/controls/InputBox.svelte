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
	class={['rounded-sm border border-gray-500 p-[5px] text-[length:inherit]', rest.class]}
	use:focus={rest.focus}
/>
