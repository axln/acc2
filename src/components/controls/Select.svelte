<script lang="ts">
	let { value = $bindable(), children, ...rest } = $props();
</script>

<select
	bind:value
	{...rest}
	class={['rounded-sm border border-gray-500 text-[length:inherit]', rest.class]}
>
	{@render children()}
</select>
