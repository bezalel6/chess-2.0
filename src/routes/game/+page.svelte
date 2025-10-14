<script lang="ts">
	import Board from '$lib/components/chess/Board.svelte';
	import MoveHistory from '$lib/components/chess/MoveHistory.svelte';
	import GameControls from '$lib/components/chess/GameControls.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { gameStore } from '$lib/stores/game';
</script>

<svelte:head>
	<title>Play Chess - Chess 2.0</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<Header />

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Game Status Banner -->
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Chess Game</h1>
			<div class="flex items-center justify-center gap-4">
				<span class="text-lg text-gray-600">
					Turn: <span class="font-semibold">{gameStore.turn === 'w' ? 'White' : 'Black'}</span>
				</span>
				{#if gameStore.status !== 'active'}
					<span class="px-3 py-1 rounded-full text-sm font-semibold
						{gameStore.status === 'check' ? 'bg-yellow-100 text-yellow-800' :
						 gameStore.status === 'checkmate' ? 'bg-red-100 text-red-800' :
						 'bg-gray-100 text-gray-800'}">
						{gameStore.status}
					</span>
				{/if}
			</div>
		</div>

		<!-- Game Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Board Column -->
			<div class="lg:col-span-2">
				<Board />
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Game Controls -->
				<GameControls />

				<!-- Move History -->
				<MoveHistory />

				<!-- Game Info -->
				<div class="bg-white rounded-lg p-6 shadow">
					<h3 class="text-xl font-bold mb-4 text-gray-900">Game Info</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Status:</span>
							<span class="font-semibold">{gameStore.status}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Moves:</span>
							<span class="font-semibold">{gameStore.history.length}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">FEN:</span>
							<span class="font-mono text-xs truncate max-w-[200px]" title={gameStore.fen}>
								{gameStore.fen}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Instructions -->
		<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
			<h3 class="text-lg font-bold text-blue-900 mb-2">How to Play</h3>
			<ul class="list-disc list-inside text-blue-800 space-y-1">
				<li>Drag and drop pieces to make moves</li>
				<li>Legal moves are highlighted when you select a piece</li>
				<li>Use the controls above to undo moves or start a new game</li>
				<li>Challenge mode coming soon! 🎯</li>
			</ul>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-white mt-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<p class="text-center text-gray-600 text-sm">
				© 2025 Chess 2.0 · Phase 1: Core Chess Game ✅
			</p>
		</div>
	</footer>
</div>
