<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onconfirm,
		confirmText = 'Confirm?',
		class: className = '',
		children
	}: {
		onconfirm: () => void;
		confirmText?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	let confirming = $state(false);

	function handleClick() {
		confirming = true;
	}

	function handleConfirm() {
		confirming = false;
		onconfirm();
	}

	function handleCancel() {
		confirming = false;
	}
</script>

{#if confirming}
	<div class="confirm-wrapper">
		<span class="confirm-text">{confirmText}</span>
		<button type="button" onclick={handleConfirm} class="confirm-yes">
			✓ Yes
		</button>
		<button type="button" onclick={handleCancel} class="confirm-no">
			✗ No
		</button>
	</div>
{:else}
	<button type="button" onclick={handleClick} class={className}>
		{@render children?.()}
	</button>
{/if}

<style>
	.confirm-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 120px;
		padding: 0.5rem 1rem;
		background-color: #2d2d2d;
		border: 2px solid #facc15;
		border-radius: 0.5rem;
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.confirm-text {
		color: #facc15;
		font-weight: 600;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.confirm-yes,
	.confirm-no {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.confirm-yes {
		background-color: #4ade80;
		color: #1e1e1e;
	}

	.confirm-yes:hover {
		background-color: #22c55e;
		transform: translateY(-1px);
	}

	.confirm-no {
		background-color: #404040;
		color: #e8e8e8;
	}

	.confirm-no:hover {
		background-color: #505050;
		transform: translateY(-1px);
	}
</style>
