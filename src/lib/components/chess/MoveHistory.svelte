<script lang="ts">
	import { gameStore } from '$lib/stores/game.svelte';

	// Get history from store
	let history = $derived(gameStore.history);

	// Reference to the scrollable container
	let movesListElement: HTMLDivElement;

	// Auto-scroll to bottom when history changes
	$effect(() => {
		if (movesListElement && history.length > 0) {
			movesListElement.scrollTop = movesListElement.scrollHeight;
		}
	});
</script>

<div class="move-history">
	<h3 class="title">Move History</h3>

	{#if history.length === 0}
		<p class="empty-message">No moves yet</p>
	{:else}
		<div class="moves-list" bind:this={movesListElement}>
			{#each history as entry, i (i)}
				<div class="move-entry">
					<span class="move-number">{entry.moveNumber}.</span>
					{#if entry.white}
						<span class="move white-move">{entry.white.san}</span>
					{/if}
					{#if entry.black}
						<span class="move black-move">{entry.black.san}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.move-history {
		background-color: #2d2d2d;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		border: 1px solid #404040;
		display: flex;
		flex-direction: column;
		height: 280px;
	}

	.title {
		color: #e8e8e8;
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}

	.empty-message {
		color: #a0a0a0;
		font-size: 0.875rem;
		font-style: italic;
	}

	.moves-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		overflow-y: auto;
		overflow-x: hidden;
		padding-right: 0.5rem;
		max-height: 200px;
	}

	/* Custom scrollbar styling */
	.moves-list::-webkit-scrollbar {
		width: 6px;
	}

	.moves-list::-webkit-scrollbar-track {
		background: #1e1e1e;
		border-radius: 3px;
	}

	.moves-list::-webkit-scrollbar-thumb {
		background: #4a9eff;
		border-radius: 3px;
	}

	.moves-list::-webkit-scrollbar-thumb:hover {
		background: #3b8fe0;
	}

	.move-entry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.move-entry:hover {
		background-color: #3d3d3d;
	}

	.move-number {
		font-weight: 600;
		color: #a0a0a0;
		min-width: 1.5rem;
		font-size: 0.875rem;
	}

	.move {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.875rem;
		min-width: 3.5rem;
		text-align: center;
	}

	.white-move {
		background-color: #e8e8e8;
		color: #1e1e1e;
		border: 1px solid #a0a0a0;
	}

	.black-move {
		background-color: #404040;
		color: #e8e8e8;
		border: 1px solid #505050;
	}
</style>
