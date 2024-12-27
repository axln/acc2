<script lang="ts">
	let { value = $bindable(), ...rest } = $props();
</script>

<input
	
	bind:value
	{...rest}
	class={['rounded-sm border p-[5px] border-gray-500 text-[length:inherit]', rest.class]}
/>
