<script lang="ts">
	import { base } from '$app/paths';
	import Header from '~/components/Header.svelte';
</script>

<svelte:head>
	<title>About - Acc</title>
</svelte:head>

<Header title="About" returnPath="#/" />

<div class="flex flex-col items-center px-6 pb-6 pt-10 text-center">
	<img class="size-24" src="{base}/favicon.svg" alt="" draggable={false} />
	<h2 class="mt-4 text-xl font-semibold">Acc</h2>
	<p class="mt-1 text-sm text-muted">Personal accounting</p>
</div>

<div class="section-label">App</div>
<div class="card mx-4">
	<div class="flex min-h-[56px] items-center gap-3 px-4 py-3">
		<span class="flex-auto">Version</span>
		<span class="tabular-nums text-muted">{__APP_VERSION__}</span>
	</div>
</div>
