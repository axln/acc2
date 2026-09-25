<script lang="ts">
	import PlusIcon from './icons/PlusIcon.svelte';

	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<a
	class="sticky bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[4] mb-5 mr-5 mt-auto flex size-14 flex-none items-center justify-center self-end rounded-2xl bg-primary text-primary-fg shadow-lg shadow-primary/30 transition-transform active:scale-95"
	{href}
	aria-label={label}
>
	<PlusIcon size={28} />
</a>
