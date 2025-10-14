<script lang="ts">
	import { gameStore } from '$lib/stores/game.svelte';
	import ConfirmButton from '$lib/components/ui/ConfirmButton.svelte';

	let showFenInput = $state(false);
	let fenInput = $state('');
	let fenError = $state('');
	let showCopiedMessage = $state(false);

	function handleNewGame() {
		gameStore.reset();
	}

	function handleUndo() {
		gameStore.undo();
	}

	function handleCopyFen() {
		navigator.clipboard.writeText(gameStore.fen);
		showCopiedMessage = true;
		setTimeout(() => {
			showCopiedMessage = false;
		}, 2000);
	}

	function handleLoadFenClick() {
		showFenInput = true;
		fenInput = '';
		fenError = '';
	}

	function handleLoadFenSubmit() {
		const success = gameStore.loadFen(fenInput);
		if (success) {
			showFenInput = false;
			fenInput = '';
			fenError = '';
		} else {
			fenError = 'Invalid FEN string';
		}
	}

	function handleLoadFenCancel() {
		showFenInput = false;
		fenInput = '';
		fenError = '';
	}
</script>

<div class="game-controls">
	<ConfirmButton
		onconfirm={handleNewGame}
		class="control-button new-game"
	>
		🔄 New Game
	</ConfirmButton>

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
		class:copied={showCopiedMessage}
	>
		{showCopiedMessage ? '✓ Copied!' : '📋 Copy FEN'}
	</button>

	<button
		onclick={handleLoadFenClick}
		class="control-button load-fen"
	>
		📂 Load FEN
	</button>
</div>

{#if showFenInput}
	<div class="fen-input-modal">
		<div class="fen-input-content">
			<h3 class="fen-input-title">Load Position from FEN</h3>
			<input
				type="text"
				bind:value={fenInput}
				placeholder="Enter FEN string..."
				class="fen-input-field"
				class:error={fenError}
			/>
			{#if fenError}
				<p class="fen-error">{fenError}</p>
			{/if}
			<div class="fen-input-actions">
				<button onclick={handleLoadFenSubmit} class="fen-submit">
					Load
				</button>
				<button onclick={handleLoadFenCancel} class="fen-cancel">
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

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

	/* Use :global() to allow styles to penetrate child components like ConfirmButton */
	.game-controls :global(.control-button) {
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

	.game-controls :global(.control-button:hover:not(:disabled)) {
		background-color: #3d3d3d;
		border-color: #4a9eff;
		transform: translateY(-1px);
	}

	.game-controls :global(.control-button:active:not(:disabled)) {
		transform: translateY(0);
	}

	.game-controls :global(.control-button:disabled) {
		opacity: 0.3;
		cursor: not-allowed;
		color: #6b7280;
	}

	.game-controls :global(.control-button.undo:hover:not(:disabled)) {
		border-color: #facc15;
		color: #facc15;
	}

	.game-controls :global(.control-button.copy-fen:hover:not(:disabled)) {
		border-color: #4ade80;
		color: #4ade80;
	}

	.game-controls :global(.control-button.load-fen:hover:not(:disabled)) {
		border-color: #c084fc;
		color: #c084fc;
	}

	.game-controls :global(.control-button.copied) {
		background-color: #4ade80;
		color: #1e1e1e;
		border-color: #4ade80;
		animation: pulse 0.3s ease-out;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	/* FEN Input Modal */
	.fen-input-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.fen-input-content {
		background-color: #2d2d2d;
		border: 2px solid #4a9eff;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		animation: slideUp 0.3s ease-out;
		max-width: 500px;
		width: 90%;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.fen-input-title {
		color: #e8e8e8;
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0 0 1rem 0;
	}

	.fen-input-field {
		width: 100%;
		padding: 0.75rem;
		background-color: #3d3d3d;
		border: 2px solid #404040;
		border-radius: 0.5rem;
		color: #e8e8e8;
		font-family: monospace;
		font-size: 0.875rem;
		margin-bottom: 1rem;
		transition: border-color 0.2s;
	}

	.fen-input-field:focus {
		outline: none;
		border-color: #4a9eff;
	}

	.fen-input-field.error {
		border-color: #f87171;
	}

	.fen-error {
		color: #f87171;
		font-size: 0.875rem;
		margin: -0.5rem 0 1rem 0;
	}

	.fen-input-actions {
		display: flex;
		gap: 0.75rem;
	}

	.fen-submit,
	.fen-cancel {
		flex: 1;
		padding: 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.fen-submit {
		background-color: #4a9eff;
		color: #1e1e1e;
	}

	.fen-submit:hover {
		background-color: #3b8fe0;
		transform: translateY(-1px);
	}

	.fen-cancel {
		background-color: #404040;
		color: #e8e8e8;
	}

	.fen-cancel:hover {
		background-color: #505050;
		border: 2px solid #f87171;
		color: #f87171;
	}
</style>
