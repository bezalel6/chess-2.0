<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Api } from 'chessground/api';
	import type { Color } from 'chessground/types';
	import { gameStore } from '$lib/stores/game.svelte';
	import { onMount } from 'svelte';

	// Board container element
	let boardElement: HTMLDivElement;
	let ground: Api | null = null;

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

		// Sync chessground with game state changes
		$effect(() => {
			if (ground) {
				ground.set({
					fen: gameStore.fen,
					turnColor: gameStore.turn === 'w' ? 'white' : 'black',
					movable: {
						color: gameStore.turn === 'w' ? 'white' : 'black',
						dests: gameStore.legalMoves
					},
					check: gameStore.isCheck
				});
			}
		});

		return () => {
			if (ground) {
				ground.destroy();
			}
		};
	});

	function handleMove(from: string, to: string) {
		// Check if move is a pawn promotion
		const piece = gameStore.getEngine().getSquare(from as any);
		const isPromotion = piece?.type === 'p' &&
			((piece.color === 'w' && to[1] === '8') ||
			 (piece.color === 'b' && to[1] === '1'));

		if (isPromotion) {
			// Show promotion dialog
			showPromotionDialog(from, to);
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

	function showPromotionDialog(from: string, to: string) {
		// For now, default to queen promotion
		// TODO: Add proper promotion UI
		const success = gameStore.makeMove(from as any, to as any, 'q');

		if (!success && ground) {
			ground.set({ fen: gameStore.fen });
		}
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

<style>
	.board-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
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
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.status-message.check {
		background-color: rgba(255, 193, 7, 0.95);
		color: #000;
	}

	.status-message.checkmate {
		background-color: rgba(244, 67, 54, 0.95);
		color: #fff;
	}

	.status-message.stalemate,
	.status-message.draw {
		background-color: rgba(96, 125, 139, 0.95);
		color: #fff;
	}
</style>
