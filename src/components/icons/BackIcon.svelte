<script lang="ts">
	let { size = 24 } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<line x1="19" y1="12" x2="5" y2="12" />
	<polyline points="12 19 5 12 12 5" />
</svg>
