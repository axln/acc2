<script lang="ts">
	import type { Snippet } from 'svelte';
	import { autoClose } from '~/lib/actions/autoClose';

	interface Props {
		class?: any;
		toggle?: boolean;
		caption: Snippet;
		children: Snippet;
	}

	let { caption, toggle = true, children, ...rest }: Props = $props();

	let dropdown: HTMLDivElement;

	export function close() {
		dropdown.toggleAttribute('data-opened', false);
	}

	export function show() {
		dropdown.toggleAttribute('data-opened', true);
	}

	function ontoggle() {
		dropdown.toggleAttribute('data-opened');
	}
</script>

<div class={['group relative', rest.class]} bind:this={dropdown} use:autoClose={'data-opened'}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cursor-pointer select-none" data-role="caption" onclick={toggle ? ontoggle : null}>
		{@render caption()}
	</div>
	<!--  py-[5px] -->
	<div
		class="absolute right-0 hidden select-none bg-white shadow group-data-[opened]:block"
		data-role="popover"
	>
		{@render children()}
	</div>
</div>
