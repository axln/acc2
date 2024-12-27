<script lang="ts">
	let { class: className = '', children, ...props } = $props();
</script>

<button class="cursor-pointer border-none bg-transparent p-0 text-inherit {className}" {...props}>
	{@render children()}
</button>
