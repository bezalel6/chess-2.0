<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Api } from 'chessground/api';
	import type { Color } from 'chessground/types';
	import { gameStore } from '$lib/stores/game.svelte';
	import { moveEvaluationsStore } from '$lib/stores/moveEvaluations.svelte';
	import PromotionDialog from './PromotionDialog.svelte';
	import type { PieceSymbol, Square } from '$lib/types/chess';
	import { onMount } from 'svelte';

	// Board container element
	let boardElement: HTMLDivElement;
	let ground: Api | null = null;

	// Promotion state
	let showPromotion = $state(false);
	let promotionFrom = $state<Square | null>(null);
	let promotionTo = $state<Square | null>(null);
	let promotionColor = $state<'w' | 'b'>('w');

	// Selected square for move evaluation
	let selectedSquare = $state<Square | null>(null);

	// Props
	let {
		orientation = 'white' as Color,
		showEvaluations = false
	} = $props();

	onMount(() => {
		// Initialize chessground
		ground = Chessground(boardElement, {
			fen: gameStore.fen,
			orientation,
			movable: {
				free: false,
				color: gameStore.turn === 'w' ? 'white' : 'black',
				dests: gameStore.legalMoves,
				showDests: true,
				events: {
					after: (orig, dest) => {
						handleMove(orig, dest);
					}
				}
			},
			draggable: {
				enabled: true,
				showGhost: true
			},
			highlight: {
				lastMove: true,
				check: true
			},
			animation: {
				enabled: true,
				duration: 200
			},
			events: {
				select: (key) => {
					// Hook into chessground's selection to show evaluations
					if (showEvaluations) {
						handleSquareSelect(key);
					}
				}
			}
		});

		// Initialize move evaluations engine
		if (showEvaluations) {
			moveEvaluationsStore.initialize().catch((error) => {
				console.error('Failed to initialize move evaluations:', error);
			});
		}

		return () => {
			if (ground) {
				ground.destroy();
			}
		};
	});

	// Sync chessground with game state changes (must be at top level for reactivity)
	$effect(() => {
		if (ground) {
			const fen = gameStore.fen;
			const turn = gameStore.turn;
			const legalMoves = gameStore.legalMoves;
			const isCheck = gameStore.isCheck;

			ground.set({
				fen,
				turnColor: turn === 'w' ? 'white' : 'black',
				movable: {
					color: turn === 'w' ? 'white' : 'black',
					dests: legalMoves
				},
				check: isCheck
			});
		}
	});


	function handleMove(from: string, to: string) {
		// Check if move is a pawn promotion
		const piece = gameStore.getEngine().getSquare(from as any);
		const isPromotion = piece?.type === 'p' &&
			((piece.color === 'w' && to[1] === '8') ||
			 (piece.color === 'b' && to[1] === '1'));

		if (isPromotion && piece) {
			// Show promotion dialog
			showPromotion = true;
			promotionFrom = from as Square;
			promotionTo = to as Square;
			promotionColor = piece.color;
		} else {
			// Make the move
			const success = gameStore.makeMove(from as any, to as any);

			if (!success) {
				// Invalid move - reset board
				if (ground) {
					ground.set({ fen: gameStore.fen });
				}
			}
		}
	}

	function handlePromotionSelect(piece: PieceSymbol) {
		if (promotionFrom && promotionTo) {
			const success = gameStore.makeMove(promotionFrom, promotionTo, piece);

			if (!success && ground) {
				ground.set({ fen: gameStore.fen });
			}
		}

		showPromotion = false;
		promotionFrom = null;
		promotionTo = null;
	}

	function handlePromotionCancel() {
		// Reset board to previous position
		if (ground) {
			ground.set({ fen: gameStore.fen });
		}

		showPromotion = false;
		promotionFrom = null;
		promotionTo = null;
	}

	async function handleSquareSelect(key: string | undefined) {
		// If undefined is passed (deselection), clear evaluations
		if (!key) {
			selectedSquare = null;
			moveEvaluationsStore.clear();
			return;
		}

		// If clicking the same square again (deselecting), clear evaluations
		if (key === selectedSquare) {
			selectedSquare = null;
			moveEvaluationsStore.clear();
			return;
		}

		// Check if there's a piece on the selected square
		const piece = gameStore.getEngine().getSquare(key as Square);

		// Only evaluate if it's the current player's piece and it has legal moves
		const legalMoves = gameStore.legalMoves.get(key as Square);

		if (piece && piece.color === gameStore.turn && legalMoves && legalMoves.length > 0) {
			selectedSquare = key as Square;
			// Trigger evaluation for all moves from this square
			await moveEvaluationsStore.evaluateMovesFromSquare(
				key as Square,
				gameStore.fen
			);
		} else {
			// Clear evaluations if not a valid piece or no legal moves
			selectedSquare = null;
			moveEvaluationsStore.clear();
		}
	}

	function formatEvaluation(cp: number | undefined, mate: number | undefined): string {
		if (mate !== undefined) {
			return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`;
		}
		if (cp === undefined) return '0.0';
		const pawns = (cp / 100).toFixed(1);
		return cp >= 0 ? `+${pawns}` : pawns;
	}

	function getEvaluationColor(cp: number | undefined, mate: number | undefined): string {
		if (mate !== undefined) {
			// Mate moves - bright colors
			return mate > 0 ? '#4ade80' : '#f87171';
		}
		if (cp === undefined) cp = 0;

		// Gradual color based on evaluation
		if (cp >= 200) return '#4ade80'; // Very good - bright green
		if (cp >= 100) return '#86efac'; // Good - green
		if (cp >= 50) return '#bbf7d0'; // Slightly better - light green
		if (cp >= -50) return '#9ca3af'; // Equal - gray
		if (cp >= -100) return '#fecaca'; // Slightly worse - light red
		if (cp >= -200) return '#fca5a5'; // Bad - red
		return '#f87171'; // Very bad - bright red
	}

	function getSquarePosition(square: Square): { left: string; top: string } {
		const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7 (a-h)
		const rank = parseInt(square[1]) - 1; // 0-7 (1-8)

		// Calculate position as percentage (12.5% per square)
		const leftPercent = orientation === 'white' ? file * 12.5 : (7 - file) * 12.5;
		const topPercent = orientation === 'white' ? (7 - rank) * 12.5 : rank * 12.5;

		return {
			left: `${leftPercent}%`,
			top: `${topPercent}%`
		};
	}
</script>

<div class="board-container">
	<div bind:this={boardElement} class="chessground-board" data-turn={gameStore.turn}></div>

	{#if showEvaluations && selectedSquare}
		{#each Array.from(moveEvaluationsStore.evaluations.values()) as evalData}
			{@const position = getSquarePosition(evalData.to)}
			{@const evalText = formatEvaluation(evalData.evaluation, evalData.mate)}
			{@const evalColor = getEvaluationColor(evalData.evaluation, evalData.mate)}
			<div
				class="eval-overlay"
				style="left: {position.left}; top: {position.top};"
			>
				{#if evalData.isCalculating}
					<span class="eval-spinner">⋯</span>
				{:else}
					<span class="eval-text" style="color: {evalColor};">{evalText}</span>
				{/if}
			</div>
		{/each}
	{/if}

	{#if gameStore.isCheck && !gameStore.isCheckmate}
		<div class="status-message check">
			Check!
		</div>
	{/if}

	{#if gameStore.isCheckmate}
		<div class="status-message checkmate">
			Checkmate! {gameStore.turn === 'w' ? 'Black' : 'White'} wins!
		</div>
	{/if}

	{#if gameStore.isStalemate}
		<div class="status-message stalemate">
			Stalemate! Game is drawn.
		</div>
	{/if}

	{#if gameStore.isDraw && !gameStore.isStalemate}
		<div class="status-message draw">
			Draw!
		</div>
	{/if}
</div>

{#if showPromotion}
	<PromotionDialog
		color={promotionColor}
		onselect={handlePromotionSelect}
		oncancel={handlePromotionCancel}
	/>
{/if}

<style>
	.board-container {
		position: relative;
		width: 600px;
		max-width: 100%;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
	}

	.chessground-board {
		width: 100%;
		aspect-ratio: 1;
	}

	.eval-overlay {
		position: absolute;
		width: 12.5%;
		height: 12.5%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 5;
		border-radius: 4px;
	}

	.eval-text {
		font-size: 0.875rem;
		font-weight: 800;
		text-shadow:
			0 0 3px rgba(0, 0, 0, 0.8),
			0 0 6px rgba(0, 0, 0, 0.6),
			1px 1px 2px rgba(0, 0, 0, 0.9);
		user-select: none;
		letter-spacing: -0.02em;
		pointer-events: none;
	}

	.eval-spinner {
		color: #9ca3af;
		font-size: 1rem;
		font-weight: bold;
		animation: pulse 1s ease-in-out infinite;
		text-shadow:
			0 0 3px rgba(0, 0, 0, 0.8),
			0 0 6px rgba(0, 0, 0, 0.6);
		pointer-events: none;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}

	.status-message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		font-size: 1.5rem;
		font-weight: bold;
		text-align: center;
		pointer-events: none;
		z-index: 10;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
		border: 2px solid;
	}

	.status-message.check {
		background-color: rgba(250, 204, 21, 0.95);
		color: #1e1e1e;
		border-color: #facc15;
	}

	.status-message.checkmate {
		background-color: rgba(248, 113, 113, 0.95);
		color: #1e1e1e;
		border-color: #f87171;
	}

	.status-message.stalemate,
	.status-message.draw {
		background-color: rgba(74, 158, 255, 0.95);
		color: #1e1e1e;
		border-color: #4a9eff;
	}
</style>
