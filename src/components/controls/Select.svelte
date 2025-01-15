<script lang="ts">
	let { value = $bindable(), children, placeholder = '', ...rest } = $props();
</script>

<select
	bind:value
	{...rest}
	class={[
		'h-[36px] rounded-sm border border-gray-400 px-[1px] text-[length:inherit] invalid:text-gray-400',
		rest.class
	]}
>
	{#if placeholder}
		<option value="" disabled selected hidden>{placeholder}</option>
	{/if}
	{@render children()}
</select>
