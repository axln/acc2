<script lang="ts">
	import type { AccountDoc } from '~/type';
	import { formatAmount } from '~/lib/utils';
	import ChevronIcon from '~/components/icons/ChevronIcon.svelte';

	interface Props {
		account: AccountDoc;
		onaccount: (id: string) => void;
	}

	let { account, onaccount }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="list-row"
	data-role="account"
	onclick={() => {
		onaccount(account.id);
	}}
>
	<span class="min-w-0 flex-auto truncate font-medium">{account.title}</span>
	<span class="flex-none text-right tabular-nums">
		<span class={['font-semibold', account.balance < 0 && 'text-negative']}
			>{formatAmount(account.balance, true)}</span
		>
		<span class="text-sm text-muted">{account.currencyCode}</span>
	</span>
	<ChevronIcon class="-mr-1 flex-none text-muted/60" />
</div>
