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
		<button onclick={handleConfirm} class="confirm-yes">
			✓ Yes
		</button>
		<button onclick={handleCancel} class="confirm-no">
			✗ No
		</button>
	</div>
{:else}
	<button onclick={handleClick} class="idle-button {className}">
		{@render children?.()}
	</button>
{/if}

<style>
	.idle-button {
		color: inherit;
	}
	.confirm-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
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
