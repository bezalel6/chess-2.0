<script lang="ts">
	import { analysisStore } from '$lib/stores/analysis.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { onMount } from 'svelte';

	const formatEvaluation = (cp: number | undefined, mate: number | undefined): string => {
		if (mate !== undefined) {
			return mate > 0 ? `+M${mate}` : `M${Math.abs(mate)}`;
		}
		if (cp === undefined) return '0.00';
		const pawns = (cp / 100).toFixed(2);
		return cp >= 0 ? `+${pawns}` : pawns;
	};

	const formatNPS = (nps: number | undefined): string => {
		if (!nps) return '0';
		if (nps >= 1_000_000) return `${(nps / 1_000_000).toFixed(1)}M`;
		if (nps >= 1_000) return `${(nps / 1_000).toFixed(0)}k`;
		return `${nps}`;
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
	onMount(() => {
		analysisStore.initialize().catch((error) => {
			console.error('Failed to initialize Stockfish:', error);
		});
	});

	// Watch for position changes and update analysis if enabled
	$effect(() => {
		if (analysisStore.isEnabled) {
			const fen = gameStore.fen;
			analysisStore.updatePosition(fen);
		}
	});
</script>

<div class="analysis-panel bg-[#2d2d2d] rounded-lg p-4 border border-[#404040]">
	<div class="header flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-[#e8e8e8]">Engine Analysis</h3>

		<label class="flex items-center gap-2 cursor-pointer">
			<span class="text-sm text-[#a0a0a0]">{analysisStore.isEnabled ? 'On' : 'Off'}</span>
			<input
				type="checkbox"
				checked={analysisStore.isEnabled}
				onchange={toggleAnalysis}
				class="w-5 h-5 text-[#4a9eff] bg-[#1e1e1e] border-[#505050] rounded
					   focus:ring-2 focus:ring-[#4a9eff] focus:ring-offset-0
					   focus:ring-offset-[#2d2d2d]"
			/>
		</label>
	</div>

	{#if analysisStore.error}
		<div class="error bg-[#7f1d1d] text-[#fca5a5] p-3 rounded mb-4 text-sm">
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

		<div class="evaluation-bar-container mb-4">
			<div class="eval-bar-wrapper relative h-8 bg-[#1e1e1e] rounded overflow-hidden">
				<div
					class="eval-bar-white bg-white absolute left-0 top-0 h-full transition-all duration-300"
					style="width: {evalPercent}%"
				></div>
				<div
					class="eval-text absolute inset-0 flex items-center justify-center text-sm font-bold z-10 mix-blend-difference text-white"
				>
					{formatEvaluation(whiteEval, whiteMate)}
				</div>
			</div>
		</div>

		<div class="stats grid grid-cols-2 gap-3 mb-4 text-sm">
			<div class="stat-item">
				<div class="label text-[#a0a0a0]">Depth</div>
				<div class="value text-[#e8e8e8] font-semibold">{result.depth || 0}</div>
			</div>

			<div class="stat-item">
				<div class="label text-[#a0a0a0]">Speed</div>
				<div class="value text-[#e8e8e8] font-semibold">{formatNPS(result.nps)} n/s</div>
			</div>

			<div class="stat-item">
				<div class="label text-[#a0a0a0]">Nodes</div>
				<div class="value text-[#e8e8e8] font-semibold">
					{result.nodes?.toLocaleString() || 0}
				</div>
			</div>

			<div class="stat-item">
				<div class="label text-[#a0a0a0]">Best Move</div>
				<div class="value text-[#4ade80] font-semibold">{result.bestMove || '—'}</div>
			</div>
		</div>

		{#if result.pv && result.pv.length > 0}
			{@const validMoves = result.pv.filter(move => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))}
			{#if validMoves.length > 0}
				<div class="principal-variation">
					<div class="label text-[#a0a0a0] text-sm mb-2">Best Line</div>
					<div class="moves flex flex-wrap gap-2">
						{#each validMoves.slice(0, 10) as move, i}
							<span class="move bg-[#3d3d3d] text-[#e8e8e8] px-2 py-1 rounded text-sm font-mono">
								{#if i % 2 === 0}{Math.floor(i / 2) + 1}.{/if}
								{move}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	{:else if analysisStore.isEnabled && !analysisStore.result}
		<div class="analyzing flex flex-col items-center justify-center py-8 gap-3">
			<div
				class="spinner h-8 w-8 border-4 border-[#4a9eff] border-t-transparent rounded-full animate-spin"
			></div>
			<p class="text-[#a0a0a0] text-sm">Starting analysis...</p>
		</div>
	{:else if !analysisStore.isEnabled}
		<div class="empty text-center py-8 text-[#a0a0a0] text-sm">
			Enable analysis to see engine evaluation
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
</style>
