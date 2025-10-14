<script lang="ts">
	import { gameStore } from '$lib/stores/game.svelte';

	// Get history from store
	let history = $derived(gameStore.history);
</script>

<div class="move-history">
	<h3 class="text-xl font-bold mb-4 text-gray-900">Move History</h3>

	{#if history.length === 0}
		<p class="text-gray-500 italic">No moves yet</p>
	{:else}
		<div class="moves-list">
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
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		border: 1px solid #404040;
		max-height: 500px;
		overflow-y: auto;
	}

	.move-history h3 {
		color: #e8e8e8;
	}

	.move-history p {
		color: #a0a0a0;
	}

	.moves-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.move-entry {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.move-entry:hover {
		background-color: #3d3d3d;
	}

	.move-number {
		font-weight: 600;
		color: #a0a0a0;
		min-width: 2rem;
	}

	.move {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 1rem;
		min-width: 4rem;
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
