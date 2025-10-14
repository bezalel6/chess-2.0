<script lang="ts">
	import Board from '$lib/components/chess/Board.svelte';
	import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
	import GameControls from '$lib/components/chess/GameControls.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
</script>

<svelte:head>
	<title>Chess 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<h1 class="text-2xl font-bold text-gray-900">Chess 2.0</h1>
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
				<div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
					<div class="text-center">
						<span class="text-lg font-semibold text-gray-900">
							{gameStore.turn === 'w' ? 'White' : 'Black'} to move
						</span>
						{#if gameStore.status !== 'active'}
							<span class="block mt-2 px-3 py-1 rounded-full text-sm font-semibold
								{gameStore.status === 'check' ? 'bg-yellow-100 text-yellow-800' :
								 gameStore.status === 'checkmate' ? 'bg-red-100 text-red-800' :
								 'bg-gray-100 text-gray-800'}">
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
