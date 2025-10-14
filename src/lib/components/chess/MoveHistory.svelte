<script lang="ts">
	import { gameStore } from '$lib/stores/game';

	// Get history from store
	let history = $derived(gameStore.history);
</script>

<div class="move-history">
	<h3 class="text-xl font-bold mb-4 text-gray-900">Move History</h3>

	{#if history.length === 0}
		<p class="text-gray-500 italic">No moves yet</p>
	{:else}
		<div class="moves-list">
			{#each history as entry (entry.moveNumber)}
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
		background-color: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		max-height: 500px;
		overflow-y: auto;
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
		background-color: #f3f4f6;
	}

	.move-number {
		font-weight: 600;
		color: #6b7280;
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
		background-color: #f9fafb;
		color: #111827;
		border: 1px solid #e5e7eb;
	}

	.black-move {
		background-color: #1f2937;
		color: #f9fafb;
		border: 1px solid #374151;
	}
</style>
