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
		'h-12 rounded-xl border border-line bg-surface px-3.5 text-base text-fg outline-none transition-colors placeholder:text-muted/80 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-fg/[0.03] disabled:text-muted',
		rest.class
	]}
	use:focus={rest.focus}
/>
