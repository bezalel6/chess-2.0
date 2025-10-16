<script lang="ts">
	import Board from '$lib/components/chess/Board.svelte';
	import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
	import GameControls from '$lib/components/chess/GameControls.svelte';
	import AnalysisPanel from '$lib/components/chess/AnalysisPanel.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { analysisStore } from '$lib/stores/analysis.svelte';
	import { onDestroy } from 'svelte';

	// Cleanup engines on component destroy
	onDestroy(() => {
		analysisStore.cleanup();
	});
</script>

<svelte:head>
	<title>Play Chess - Chess 2.0</title>
</svelte:head>

<main class="max-w-[1800px] mx-auto px-4 py-6">
	<div class="flex flex-col lg:flex-row gap-6 lg:items-start justify-center">
		<!-- Left Sidebar: Analysis, Controls and Turn Indicator -->
		<div class="w-full lg:w-[320px] space-y-4 order-1 lg:order-1">
			<!-- Engine Analysis -->
			<AnalysisPanel />

			<!-- Turn Indicator -->
			<div class="bg-[#2d2d2d] rounded-lg p-4 shadow-lg border border-[#404040]">
				<div class="text-center">
					<span class="text-lg font-semibold text-[#e8e8e8]">
						{gameStore.turn === 'w' ? 'White' : 'Black'} to move
					</span>
					{#if gameStore.status !== 'active'}
						<span
							class="block mt-2 px-3 py-1 rounded-full text-sm font-semibold
								{gameStore.status === 'check'
								? 'bg-[#facc15]/20 text-[#facc15]'
								: gameStore.status === 'checkmate'
									? 'bg-[#f87171]/20 text-[#f87171]'
									: 'bg-[#404040] text-[#a0a0a0]'}"
						>
							{gameStore.status}
						</span>
					{/if}
				</div>
			</div>

			<!-- Game Controls -->
			<GameControls />
		</div>

		<!-- Center: Board -->
		<div class="w-full lg:w-auto flex-shrink-0 order-2 lg:order-2">
			<Board />
		</div>

		<!-- Right Sidebar: Move History -->
		<div class="w-full lg:w-[280px] order-3 lg:order-3 space-y-4">
			<MoveHistory />
		</div>
	</div>
</main>
