<script lang="ts">
	import { gameStore } from '$lib/stores/game';

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
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.control-button {
		flex: 1;
		min-width: 120px;
		padding: 0.75rem 1.5rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
		background-color: white;
		color: #374151;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.control-button:hover:not(:disabled) {
		background-color: #f9fafb;
		border-color: #d1d5db;
		transform: translateY(-1px);
	}

	.control-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.control-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.control-button.new-game:hover:not(:disabled) {
		border-color: #3b82f6;
		color: #3b82f6;
	}

	.control-button.undo:hover:not(:disabled) {
		border-color: #f59e0b;
		color: #f59e0b;
	}

	.control-button.copy-fen:hover:not(:disabled) {
		border-color: #10b981;
		color: #10b981;
	}

	.control-button.load-fen:hover:not(:disabled) {
		border-color: #8b5cf6;
		color: #8b5cf6;
	}
</style>
