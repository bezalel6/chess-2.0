<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Api } from 'chessground/api';
	import type { Color } from 'chessground/types';
	import { gameStore } from '$lib/stores/game.svelte';
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

	// Props
	let {
		orientation = 'white' as Color
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
			}
		});

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
</script>

<div class="board-container">
	<div bind:this={boardElement} class="chessground-board"></div>

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
