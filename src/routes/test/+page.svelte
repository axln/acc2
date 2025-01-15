<script lang="ts">
	import Header from '~/components/Header.svelte';
</script>

<Header title="Test" returnPath="#/" />

<div class="m-2.5 space-y-2.5">
	<div>
		<input class="h-[36px] w-full border px-[5px]" type="text" value="Option 1" />
	</div>

	<div>
		<select class="h-[36px] w-full border px-[1px]">
			<option>Option 1</option>
			<option>Option 2</option>
			<option>Option 3</option>
		</select>
	</div>
</div>
