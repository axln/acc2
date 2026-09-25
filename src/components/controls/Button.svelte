<script lang="ts">
	let { children, variant = 'primary', ...rest } = $props();
</script>

<button
	{...rest}
	class={[
		'inline-flex h-12 cursor-pointer items-center justify-center rounded-xl px-4 text-base font-semibold transition-colors disabled:cursor-default disabled:opacity-50',
		variant === 'primary'
			? 'bg-primary text-primary-fg shadow-sm hover:bg-primary/90 active:bg-primary/80'
			: 'bg-fg/[0.06] text-fg hover:bg-fg/10 active:bg-fg/[0.14]',
		rest.class
	]}>{@render children()}</button
>
