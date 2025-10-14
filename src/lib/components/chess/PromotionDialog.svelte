<script lang="ts">
	import type { PieceSymbol } from '$lib/types/chess';

	let {
		color,
		onselect,
		oncancel
	}: {
		color: 'w' | 'b';
		onselect: (piece: PieceSymbol) => void;
		oncancel: () => void;
	} = $props();

	const pieces: { symbol: PieceSymbol; name: string; unicode: string }[] = [
		{ symbol: 'q', name: 'Queen', unicode: color === 'w' ? '♕' : '♛' },
		{ symbol: 'r', name: 'Rook', unicode: color === 'w' ? '♖' : '♜' },
		{ symbol: 'b', name: 'Bishop', unicode: color === 'w' ? '♗' : '♝' },
		{ symbol: 'n', name: 'Knight', unicode: color === 'w' ? '♘' : '♞' }
	];

	function handleSelect(piece: PieceSymbol) {
		onselect(piece);
	}

	function handleBackdropClick() {
		oncancel();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			oncancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="promotion-backdrop"
	onclick={handleBackdropClick}
	role="presentation"
>
	<div
		class="promotion-dialog"
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="promotion-title"
	>
		<h3 id="promotion-title" class="promotion-title">Promote Pawn</h3>
		<div class="promotion-grid">
			{#each pieces as piece}
				<button
					class="promotion-option"
					onclick={() => handleSelect(piece.symbol)}
					title={piece.name}
				>
					<span class="piece-icon">{piece.unicode}</span>
					<span class="piece-name">{piece.name}</span>
				</button>
			{/each}
		</div>
		<button class="promotion-cancel" onclick={oncancel}>
			Cancel
		</button>
	</div>
</div>

<style>
	.promotion-backdrop {
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

	.promotion-dialog {
		background-color: #2d2d2d;
		border: 2px solid #4a9eff;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		animation: slideUp 0.3s ease-out;
		max-width: 400px;
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

	.promotion-title {
		color: #e8e8e8;
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.promotion-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.promotion-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.5rem;
		background-color: #3d3d3d;
		border: 2px solid #404040;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.promotion-option:hover {
		background-color: #4d4d4d;
		border-color: #4a9eff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
	}

	.promotion-option:active {
		transform: translateY(0);
	}

	.piece-icon {
		font-size: 3rem;
		line-height: 1;
	}

	.piece-name {
		color: #e8e8e8;
		font-weight: 600;
		font-size: 1rem;
	}

	.promotion-cancel {
		width: 100%;
		padding: 0.75rem;
		background-color: #404040;
		border: 2px solid #505050;
		border-radius: 0.5rem;
		color: #e8e8e8;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.promotion-cancel:hover {
		background-color: #505050;
		border-color: #f87171;
		color: #f87171;
	}
</style>
