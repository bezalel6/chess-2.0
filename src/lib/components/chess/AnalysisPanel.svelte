<script lang="ts">
	import { analysisStore } from '$lib/stores/analysis.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { GameEngine } from '$lib/chess/engine/game';
	import { onMount } from 'svelte';

	const formatEvaluation = (cp: number | undefined, mate: number | undefined): string => {
		if (mate !== undefined) {
			return mate > 0 ? `+M${mate}` : `-M${Math.abs(mate)}`;
		}
		if (cp === undefined) return '0.0';
		const pawns = (cp / 100).toFixed(1);
		return cp >= 0 ? `+${pawns}` : pawns;
	};

	// Convert UCI moves to SAN notation
	const convertPVToSAN = (pv: string[], fen: string): string[] => {
		try {
			const engine = new GameEngine();
			engine.load(fen);

			const sanMoves: string[] = [];
			for (const uciMove of pv) {
				// UCI format: e2e4, e7e5, etc.
				const from = uciMove.substring(0, 2);
				const to = uciMove.substring(2, 4);
				const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

				const move = engine.move(from as any, to as any, promotion);
				if (move) {
					sanMoves.push(move.san);
				} else {
					break; // Stop if we hit an invalid move
				}
			}
			return sanMoves;
		} catch {
			return [];
		}
	};

	const toggleAnalysis = async () => {
		if (analysisStore.isEnabled) {
			analysisStore.disable();
		} else {
			analysisStore.enable();
			const fen = gameStore.fen;
			await analysisStore.startContinuousAnalysis(fen);
		}
	};

	const isWhiteToMove = (fen: string): boolean => {
		return fen.split(' ')[1] === 'w';
	};

	// Initialize engine on mount
	onMount(async () => {
		try {
			await analysisStore.initialize();
			// If analysis was previously enabled, start it automatically
			if (analysisStore.isEnabled) {
				const fen = gameStore.fen;
				await analysisStore.startContinuousAnalysis(fen);
			}
		} catch (error) {
			console.error('Failed to initialize Stockfish:', error);
		}
	});

	// Watch for position changes and update analysis if enabled
	$effect(() => {
		if (analysisStore.isEnabled) {
			const fen = gameStore.fen;
			analysisStore.updatePosition(fen);
		}
	});
</script>

<div class="analysis-panel bg-[#2d2d2d] rounded-lg p-3 border border-[#404040]">
	<div class="header flex items-center justify-between mb-3">
		<h3 class="text-sm font-semibold text-[#e8e8e8]">Analysis</h3>

		<label class="flex items-center gap-2 cursor-pointer">
			<span class="text-xs text-[#a0a0a0]">{analysisStore.isEnabled ? 'On' : 'Off'}</span>
			<input
				type="checkbox"
				checked={analysisStore.isEnabled}
				onchange={toggleAnalysis}
				class="w-4 h-4 text-[#4a9eff] bg-[#1e1e1e] border-[#505050] rounded
					   focus:ring-2 focus:ring-[#4a9eff] focus:ring-offset-0"
			/>
		</label>
	</div>

	{#if analysisStore.error}
		<div class="error bg-[#7f1d1d] text-[#fca5a5] p-2 rounded mb-2 text-xs">
			{analysisStore.error}
		</div>
	{/if}

	{#if analysisStore.result}
		{@const result = analysisStore.result}
		{@const whiteToMove = isWhiteToMove(gameStore.fen)}
		{@const whiteEval = whiteToMove ? result.evaluation : -result.evaluation}
		{@const whiteMate = whiteToMove ? result.mate : result.mate ? -result.mate : undefined}
		{@const evalPercent = whiteMate !== undefined
			? whiteMate > 0
				? 100
				: 0
			: Math.max(0, Math.min(100, 50 + whiteEval / 10))}
		{@const bestMoveSAN = (() => {
			if (!result.bestMove) return '—';
			const sanArray = convertPVToSAN([result.bestMove], gameStore.fen);
			return sanArray.length > 0 ? sanArray[0] : result.bestMove;
		})()}

		<!-- Evaluation Bar -->
		<div class="eval-bar-wrapper relative h-6 bg-[#1e1e1e] rounded overflow-hidden mb-2">
			<div
				class="eval-bar-white bg-white absolute left-0 top-0 h-full transition-all duration-300"
				style="width: {evalPercent}%"
			></div>
			<div
				class="eval-text absolute inset-0 flex items-center justify-center text-xs font-bold z-10 mix-blend-difference text-white"
			>
				{formatEvaluation(whiteEval, whiteMate)}
			</div>
		</div>

		<!-- Compact Stats -->
		<div class="stats flex items-center justify-between text-xs mb-2">
			<span class="text-[#a0a0a0]">Depth {result.depth || 0}</span>
			<span class="text-[#4ade80] font-semibold">{bestMoveSAN}</span>
			<span class="text-[#a0a0a0]">{result.nodes?.toLocaleString() || 0} nodes</span>
		</div>

		<!-- Best Line with SAN notation -->
		{#if result.pv && result.pv.length > 0}
			{@const sanMoves = convertPVToSAN(result.pv.slice(0, 10), gameStore.fen)}
			{#if sanMoves.length > 0}
				<div class="best-line">
					<div class="text-xs text-[#a0a0a0] mb-1">Best Line</div>
					<div class="moves-container overflow-x-auto">
						<div class="moves flex gap-1.5 whitespace-nowrap text-xs">
							{#each sanMoves as move}
								<span class="move text-[#e8e8e8] font-semibold flex-shrink-0">{move}</span>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	{:else if analysisStore.isEnabled && !analysisStore.result}
		<div class="analyzing flex flex-col items-center justify-center py-6 gap-2">
			<div
				class="spinner h-6 w-6 border-3 border-[#4a9eff] border-t-transparent rounded-full animate-spin"
			></div>
			<p class="text-[#a0a0a0] text-xs">Starting...</p>
		</div>
	{:else if !analysisStore.isEnabled}
		<div class="empty text-center py-6 text-[#a0a0a0] text-xs">
			Enable to analyze
		</div>
	{/if}
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	.moves-container {
		scrollbar-width: thin;
		scrollbar-color: #404040 #2d2d2d;
	}

	.moves-container::-webkit-scrollbar {
		height: 4px;
	}

	.moves-container::-webkit-scrollbar-track {
		background: #2d2d2d;
	}

	.moves-container::-webkit-scrollbar-thumb {
		background: #404040;
		border-radius: 2px;
	}
</style>
