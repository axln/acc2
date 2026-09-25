<script lang="ts">
	let { value = $bindable(), children, placeholder = '', ...rest } = $props();
</script>

<select
	bind:value
	{...rest}
	class={[
		'h-12 rounded-xl border border-line bg-surface px-3 text-base text-fg outline-none transition-colors invalid:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25',
		rest.class
	]}
>
	{#if placeholder}
		<option value="" disabled selected hidden>{placeholder}</option>
	{/if}
	{@render children()}
</select>
