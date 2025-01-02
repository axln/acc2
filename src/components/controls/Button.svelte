<script lang="ts">
	let { children, ...rest } = $props();
</script>

<button
	{...rest}
	class={[
		'cursor-pointer rounded-sm border border-gray-500 bg-gray-200  text-[length:inherit]',
		rest.class
	]}>{@render children()}</button
>
