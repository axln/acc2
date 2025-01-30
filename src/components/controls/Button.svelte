<script lang="ts">
	let { children, ...rest } = $props();
</script>

<button
	{...rest}
	class={[
		'h-[36px] cursor-pointer rounded-sm border border-gray-400 bg-gray-200 px-[5px] text-[length:inherit] hover:bg-gray-300 active:bg-gray-300',
		rest.class
	]}>{@render children()}</button
>
