<script lang="ts">
	let { size = 20, ...rest } = $props();
</script>

<svg
	class={rest.class}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<polyline points="9 18 15 12 9 6" />
</svg>
