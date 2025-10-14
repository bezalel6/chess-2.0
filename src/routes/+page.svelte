<script lang="ts">
	import Board from '$lib/components/chess/Board.svelte';
	import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
	import GameControls from '$lib/components/chess/GameControls.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
</script>

<svelte:head>
	<title>Chess 2.0</title>
</svelte:head>

<div class="min-h-screen bg-[#1e1e1e]">
	<header class="bg-[#2d2d2d] border-b border-[#404040]">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<h1 class="text-2xl font-bold text-[#e8e8e8]">Chess 2.0</h1>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 py-6">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Board -->
			<div class="lg:col-span-2">
				<Board />
			</div>

			<!-- Sidebar -->
			<div class="space-y-4">
				<!-- Turn Indicator -->
				<div class="bg-[#2d2d2d] rounded-lg p-4 shadow-lg border border-[#404040]">
					<div class="text-center">
						<span class="text-lg font-semibold text-[#e8e8e8]">
							{gameStore.turn === 'w' ? 'White' : 'Black'} to move
						</span>
						{#if gameStore.status !== 'active'}
							<span class="block mt-2 px-3 py-1 rounded-full text-sm font-semibold
								{gameStore.status === 'check' ? 'bg-[#facc15]/20 text-[#facc15]' :
								 gameStore.status === 'checkmate' ? 'bg-[#f87171]/20 text-[#f87171]' :
								 'bg-[#404040] text-[#a0a0a0]'}">
								{gameStore.status}
							</span>
						{/if}
					</div>
				</div>

				<!-- Controls -->
				<GameControls />

				<!-- Move History -->
				<MoveHistory />
			</div>
		</div>
	</main>
</div>
