<script lang="ts">
	let { children, ...rest } = $props();
</script>

<button
	{...rest}
	class={['cursor-pointer rounded-sm border border-gray-500 bg-gray-200', rest.class]}
	>{@render children()}</button
>
