<script lang="ts">
	import type { AccountDoc } from '~/type';
	import { formatAmount } from '~/lib/utils';

	interface Props {
		account: AccountDoc;
		onaccount: (id: string) => void;
	}

	let { account, onaccount }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="cursor-pointer border-b border-gray-300 p-2.5 hover:bg-[#e1effa] active:bg-[#d1e3f0]"
	data-role="account"
	onpointerdown={() => {
		onaccount(account.id);
	}}
>
	<div class="flex gap-[10px]">
		<span class="flex-auto">{account.title}</span>
		<span>{formatAmount(account.balance, true)} {account.currencyCode}</span>
	</div>
</div>
