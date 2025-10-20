<script lang="ts">
	import Board from '$lib/components/chess/Board.svelte';
	import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
	import GameControls from '$lib/components/chess/GameControls.svelte';
	import AnalysisPanel from '$lib/components/chess/AnalysisPanel.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { analysisStore } from '$lib/stores/analysis.svelte';
	import { onDestroy } from 'svelte';

	// Cleanup engines on component destroy
	onDestroy(async () => {
		await analysisStore.cleanup();
	});
</script>

<svelte:head>
	<title>Play Chess - Chess 2.0</title>
</svelte:head>

<main class="max-w-[1800px] mx-auto px-4 py-6">
	<div class="flex flex-col lg:flex-row gap-6 justify-center">
		<!-- Left Sidebar: Turn Indicator and Analysis (vertically centered) -->
		<div class="w-full lg:w-[320px] order-1 lg:order-1 flex flex-col justify-center">
			<div class="space-y-4">
				<!-- Turn Indicator -->
				<div class="bg-[#2d2d2d] rounded-lg p-4 shadow-lg border border-[#404040]
					{gameStore.status === 'check' ? 'border-[#facc15]/50' :
					 gameStore.status === 'checkmate' ? 'border-[#f87171]' :
					 gameStore.isGameOver ? 'border-[#505050]' : ''}">
					<div class="text-center">
						{#if gameStore.status === 'checkmate'}
							<div class="text-lg font-semibold text-[#f87171]">
								Checkmate
							</div>
							<div class="text-sm text-[#a0a0a0] mt-1">
								{gameStore.turn === 'w' ? 'Black' : 'White'} wins
							</div>
						{:else if gameStore.status === 'stalemate'}
							<div class="text-lg font-semibold text-[#a0a0a0]">
								Stalemate
							</div>
							<div class="text-sm text-[#707070] mt-1">
								Game drawn
							</div>
						{:else if gameStore.status === 'insufficient-material'}
							<div class="text-lg font-semibold text-[#a0a0a0]">
								Draw
							</div>
							<div class="text-sm text-[#707070] mt-1">
								Insufficient material
							</div>
						{:else if gameStore.status === 'threefold-repetition'}
							<div class="text-lg font-semibold text-[#a0a0a0]">
								Draw
							</div>
							<div class="text-sm text-[#707070] mt-1">
								Threefold repetition
							</div>
						{:else if gameStore.status === 'draw'}
							<div class="text-lg font-semibold text-[#a0a0a0]">
								Draw
							</div>
							<div class="text-sm text-[#707070] mt-1">
								By agreement
							</div>
						{:else}
							<div class="text-lg font-semibold {gameStore.status === 'check' ? 'text-[#facc15]' : 'text-[#e8e8e8]'}">
								{gameStore.turn === 'w' ? 'White' : 'Black'} to move
								{#if gameStore.status === 'check'}
									<span class="text-sm font-normal text-[#facc15] ml-2">• Check</span>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<!-- Engine Analysis -->
				<AnalysisPanel />
			</div>
		</div>

		<!-- Center: Board and Controls -->
		<div class="w-full lg:w-auto flex-shrink-0 order-2 lg:order-2 flex flex-col gap-4">
			<!-- Board -->
			<Board />

			<!-- Game Controls (under the board) -->
			<GameControls />
		</div>

		<!-- Right Sidebar: Move History (vertically centered) -->
		<div class="w-full lg:w-[280px] order-3 lg:order-3 flex flex-col justify-center">
			<MoveHistory />
		</div>
	</div>
</main>
