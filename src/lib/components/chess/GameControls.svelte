<script lang="ts">
	import { gameStore } from '$lib/stores/game.svelte';

	function handleNewGame() {
		if (confirm('Start a new game? Current game will be lost.')) {
			gameStore.reset();
		}
	}

	function handleUndo() {
		gameStore.undo();
	}

	function handleCopyFen() {
		navigator.clipboard.writeText(gameStore.fen);
		alert('FEN copied to clipboard!');
	}

	function handleLoadFen() {
		const fen = prompt('Enter FEN string:');
		if (fen) {
			const success = gameStore.loadFen(fen);
			if (!success) {
				alert('Invalid FEN string');
			}
		}
	}
</script>

<div class="game-controls">
	<button
		onclick={handleNewGame}
		class="control-button new-game"
	>
		🔄 New Game
	</button>

	<button
		onclick={handleUndo}
		disabled={gameStore.history.length === 0}
		class="control-button undo"
	>
		↩️ Undo
	</button>

	<button
		onclick={handleCopyFen}
		class="control-button copy-fen"
	>
		📋 Copy FEN
	</button>

	<button
		onclick={handleLoadFen}
		class="control-button load-fen"
	>
		📂 Load FEN
	</button>
</div>

<style>
	.game-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 1rem;
		background-color: #2d2d2d;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		border: 1px solid #404040;
	}

	.control-button {
		flex: 1;
		min-width: 120px;
		padding: 0.75rem 1.5rem;
		border: 2px solid #404040;
		border-radius: 0.5rem;
		background-color: #2d2d2d;
		color: #e8e8e8;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.control-button:hover:not(:disabled) {
		background-color: #3d3d3d;
		border-color: #4a9eff;
		transform: translateY(-1px);
	}

	.control-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.control-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		color: #6b7280;
	}

	.control-button.new-game:hover:not(:disabled) {
		border-color: #4a9eff;
		color: #4a9eff;
	}

	.control-button.undo:hover:not(:disabled) {
		border-color: #facc15;
		color: #facc15;
	}

	.control-button.copy-fen:hover:not(:disabled) {
		border-color: #4ade80;
		color: #4ade80;
	}

	.control-button.load-fen:hover:not(:disabled) {
		border-color: #c084fc;
		color: #c084fc;
	}
</style>
