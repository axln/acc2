<script lang="ts">
	interface Props {
		accountId: string | undefined;
		placeholder: string;
	}

	let { accountId = $bindable(), placeholder = 'Account' }: Props = $props();
</script>

AccountSelect
