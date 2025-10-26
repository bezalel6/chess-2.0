<script lang="ts">
	import { analysisStore } from '$lib/stores/analysis.svelte';
	import type { AIPlayerSide } from '$lib/stores/analysis.svelte';
	import { gameStore } from '$lib/stores/game.svelte';
	import { GameEngine } from '$lib/chess/engine/game';
	import { onMount } from 'svelte';

	const formatEvaluation = (cp: number | undefined, mate: number | undefined): string => {
		if (mate !== undefined) {
			return mate > 0 ? `+M${Math.abs(mate)}` : `-M${Math.abs(mate)}`;
		}
		if (cp === undefined) return '0.0';
		const pawns = (cp / 100).toFixed(1);
		return cp >= 0 ? `+${pawns}` : pawns;
	};

	// Convert UCI moves to SAN notation
	const convertUCIToSAN = (uciMove: string, fen: string): string | null => {
		try {
			// Clean the move string first
			const cleanMove = uciMove?.trim();

			// Validate UCI format: should be like e2e4 or e7e8q (with promotion)
			if (!cleanMove || cleanMove.length < 4 || cleanMove.length > 5) {
				return null;
			}

			// More lenient regex that accepts valid UCI moves
			if (!/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/.test(cleanMove)) {
				return null;
			}

			const engine = new GameEngine();
			engine.load(fen);

			// UCI format: e2e4, e7e5, e7e8q (promotion), etc.
			const from = cleanMove.substring(0, 2);
			const to = cleanMove.substring(2, 4);
			const promotion = cleanMove.length > 4 ? cleanMove[4].toLowerCase() : undefined;

			const move = engine.move(from as any, to as any, promotion);
			return move ? move.san : null;
		} catch {
			// Silently fail on invalid moves
			return null;
		}
	};

	// Convert array of UCI moves to SAN
	const convertPVToSAN = (pv: string[], fen: string): string[] => {
		const engine = new GameEngine();
		try {
			engine.load(fen);
		} catch {
			return [];
		}

		const sanMoves: string[] = [];
		for (const uciMove of pv) {
			// Validate UCI format
			if (!uciMove || uciMove.length < 4 || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uciMove)) {
				continue; // Skip invalid tokens
			}

			const from = uciMove.substring(0, 2);
			const to = uciMove.substring(2, 4);
			const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

			const move = engine.move(from as any, to as any, promotion);
			if (move) {
				sanMoves.push(move.san);
			} else {
				break; // Stop at first invalid move
			}
		}
		return sanMoves;
	};

	const toggleAnalysis = async () => {
		if (analysisStore.isEnabled) {
			await analysisStore.disable();
		} else {
			analysisStore.enable();
			const fen = gameStore.fen;
			await analysisStore.startContinuousAnalysis(fen);
		}
	};

	const setAIPlayer = async (side: AIPlayerSide) => {
		// Ensure callback is set before changing AI mode
		if (!analysisStore.hasCallback) {
			analysisStore.setOnBestMoveCallback(autoPlayBestMove);
		}
		await analysisStore.setAIPlayer(side, gameStore.fen);
	};

	const isWhiteToMove = (fen: string): boolean => {
		return fen.split(' ')[1] === 'w';
	};

	// Play the best move on the board
	const playBestMove = () => {
		const result = analysisStore.result;
		if (!result) return;

		// Get the best move from either bestMove or first pv move
		const uciMove = result.bestMove || (result.pv && result.pv[0]);
		if (!uciMove || uciMove.length < 4) return;

		// Extract from and to squares
		const from = uciMove.substring(0, 2);
		const to = uciMove.substring(2, 4);
		const promotion = uciMove.length > 4 ? uciMove[4].toLowerCase() : undefined;

		// Play the move
		gameStore.makeMove(from as any, to as any, promotion);
	};

	let engineInitialized = $state(false);

	// Auto-play best move when AI mode is enabled
	const autoPlayBestMove = (uciMove: string) => {
		// Validate UCI move format
		if (!uciMove || uciMove.length < 4 || uciMove.length > 5) {
			console.log('[AI Debug] Invalid move length:', uciMove);
			return;
		}

		// Validate it's actually a UCI move (not SAN)
		if (!/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/.test(uciMove)) {
			console.log('[AI Debug] Invalid UCI format:', uciMove);
			return;
		}

		// Check if the game is over (handles all draw types, checkmate, stalemate)
		if (gameStore.isGameOver) {
			console.log('[AI Debug] Game is over, not playing move');
			return;
		}

		// Extract from and to squares
		const from = uciMove.substring(0, 2);
		const to = uciMove.substring(2, 4);
		const promotion = uciMove.length > 4 ? uciMove[4].toLowerCase() : undefined;

		// Verify the move is legal in the current position
		const testEngine = new GameEngine();
		try {
			const currentFen = gameStore.fen;
			testEngine.load(currentFen);

			// Double-check it's the right turn
			const isWhiteToMove = currentFen.split(' ')[1] === 'w';
			const pieceAtFrom = testEngine.getSquare(from as any);
			if (!pieceAtFrom) {
				console.log('[AI Debug] No piece at from square:', from);
				return;
			}

			// Ensure we're not trying to move the opponent's piece
			if ((isWhiteToMove && pieceAtFrom.color !== 'w') ||
			    (!isWhiteToMove && pieceAtFrom.color !== 'b')) {
				console.log('[AI Debug] Wrong color piece at from square');
				return;
			}

			const testMove = testEngine.move(from as any, to as any, promotion);
			if (!testMove) {
				console.log('[AI Debug] Move validation failed:', uciMove);
				return;
			}
		} catch (error) {
			console.log('[AI Debug] Error validating move:', error);
			return;
		}

		// Play the move
		try {
			console.log('[AI Debug] Playing validated move:', uciMove);
			const success = gameStore.makeMove(from as any, to as any, promotion);
			if (!success) {
				console.error('[AI Debug] Failed to play AI move:', uciMove);
			} else {
				console.log('[AI Debug] Successfully played AI move:', uciMove);
			}
		} catch (error) {
			console.error('[AI Debug] Exception while playing AI move:', error);
		}
	};

	// Initialize engine on mount
	onMount(async () => {
		try {
			// Set up the callback for auto-playing moves
			analysisStore.setOnBestMoveCallback(autoPlayBestMove);

			await analysisStore.initialize();
			engineInitialized = true;
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
		// Only update position if engine is initialized and analysis is enabled
		if (engineInitialized && analysisStore.isEnabled) {
			const fen = gameStore.fen;

			// Stop analysis if game is over
			if (gameStore.isGameOver) {
				(async () => {
					await analysisStore.stopContinuousAnalysis();
				})();
				return;
			}

			// Use async IIFE to await the updatePosition call
			(async () => {
				await analysisStore.updatePosition(fen);
			})();
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

	<!-- AI Opponent Section - Always visible, more prominent -->
	<div class="ai-section bg-[#1e1e1e] rounded-lg p-3 mb-3 border border-[#404040]">
		<div class="flex items-center justify-between mb-2">
			<h4 class="text-xs font-semibold text-[#e8e8e8]">AI Opponent</h4>
			{#if analysisStore.isAIActive && analysisStore.isAnalyzing}
				<span class="text-xs text-[#4ade80] flex items-center gap-1">
					<span class="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse"></span>
					AI thinking...
				</span>
			{/if}
		</div>
		<div class="grid grid-cols-4 gap-1">
			<button
				onclick={() => setAIPlayer('off')}
				class="px-2 py-1.5 text-xs font-medium rounded transition-all
				       {analysisStore.aiPlaysAs === 'off'
				         ? 'bg-[#3d3d3d] text-[#e8e8e8] border border-[#505050]'
				         : 'bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#3d3d3d] hover:text-[#e8e8e8]'}"
			>
				Off
			</button>
			<button
				onclick={() => setAIPlayer('black')}
				class="px-2 py-1.5 text-xs font-medium rounded transition-all
				       {analysisStore.aiPlaysAs === 'black'
				         ? 'bg-[#3d3d3d] text-[#e8e8e8] border border-[#c084fc]'
				         : 'bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#3d3d3d] hover:text-[#e8e8e8]'}"
			>
				Black
			</button>
			<button
				onclick={() => setAIPlayer('white')}
				class="px-2 py-1.5 text-xs font-medium rounded transition-all
				       {analysisStore.aiPlaysAs === 'white'
				         ? 'bg-[#3d3d3d] text-[#e8e8e8] border border-[#c084fc]'
				         : 'bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#3d3d3d] hover:text-[#e8e8e8]'}"
			>
				White
			</button>
			<button
				onclick={() => setAIPlayer('both')}
				class="px-2 py-1.5 text-xs font-medium rounded transition-all
				       {analysisStore.aiPlaysAs === 'both'
				         ? 'bg-[#3d3d3d] text-[#e8e8e8] border border-[#c084fc]'
				         : 'bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#3d3d3d] hover:text-[#e8e8e8]'}"
			>
				Both
			</button>
		</div>
		{#if analysisStore.aiPlaysAs !== 'off'}
			<p class="text-xs text-[#a0a0a0] mt-2">
				{#if analysisStore.aiPlaysAs === 'both'}
					AI plays both sides (watch mode)
				{:else if analysisStore.aiPlaysAs === 'white'}
					You play as Black, AI plays White
				{:else}
					You play as White, AI plays Black
				{/if}
			</p>
		{/if}
	</div>

	{#if analysisStore.error}
		<div class="error bg-[#7f1d1d] text-[#fca5a5] p-2 rounded mb-2 text-xs">
			{analysisStore.error}
		</div>
	{/if}

	<!-- Content Container with Fixed Layout -->
	<div class="analysis-content min-h-[160px]">
		{#if analysisStore.result && analysisStore.isEnabled}
			{@const result = analysisStore.result}
			{@const whiteToMove = isWhiteToMove(gameStore.fen)}
			{@const whiteEval = whiteToMove ? result.evaluation : -result.evaluation}
			{@const whiteMate = whiteToMove ? result.mate : result.mate ? -result.mate : undefined}
			{@const bestMoveUCI = result.bestMove || (result.pv && result.pv[0])}
			{@const bestMoveSAN = (() => {
				if (!bestMoveUCI) return '—';
				const san = convertUCIToSAN(bestMoveUCI, gameStore.fen);
				return san || bestMoveUCI; // Fallback to UCI if conversion fails
			})()}

			<!-- Large Evaluation Display -->
			<div class="evaluation-display text-center mb-2 h-10 flex items-center justify-center">
				<div class="text-3xl font-bold text-[#e8e8e8] font-mono min-w-[100px]">
					{formatEvaluation(whiteEval, whiteMate)}
				</div>
			</div>

			<!-- Compact Stats -->
			<div class="stats grid grid-cols-3 gap-2 items-center mb-2">
				<span class="text-[#a0a0a0] text-left font-mono text-xs w-[35px]">
					D{result.depth || 0}
				</span>
				<button
					onclick={playBestMove}
					disabled={bestMoveSAN === '—'}
					class="{bestMoveSAN !== '—' && analysisStore.aiPlaysAs === 'off'
					         ? 'text-[#4ade80] hover:text-[#22c55e] hover:bg-[#3d3d3d]'
					         : 'text-[#4ade80]'}
					       font-bold text-center font-mono text-lg transition-all cursor-pointer
					       disabled:cursor-default disabled:text-[#505050] px-2 py-1 rounded active:bg-[#4d4d4d]"
					title={bestMoveSAN !== '—' ? 'Click to play this move' : ''}
				>
					{bestMoveSAN}
				</button>
				<span class="text-[#a0a0a0] text-right font-mono text-xs w-[50px]">
					{result.nodes ? `${Math.floor(result.nodes / 1000)}k` : '0k'}
				</span>
			</div>

			<!-- Best Line with SAN notation -->
			<div class="best-line h-[40px]">
				{#if result.pv && result.pv.length > 0}
					{@const sanMoves = convertPVToSAN(result.pv.slice(0, 10), gameStore.fen)}
					{#if sanMoves.length > 0}
						<div class="text-xs text-[#a0a0a0] mb-1">Best Line</div>
						<div class="moves-container overflow-x-auto">
							<div class="moves flex gap-1.5 whitespace-nowrap text-xs">
								{#each sanMoves as move}
									<span class="move text-[#e8e8e8] font-semibold flex-shrink-0">{move}</span>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{:else if analysisStore.isEnabled && !analysisStore.result}
			<!-- Loading state -->
			<div class="flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
				<div
					class="spinner h-6 w-6 border-3 border-[#4a9eff] border-t-transparent rounded-full animate-spin"
				></div>
				<p class="text-[#a0a0a0] text-xs">Analyzing...</p>
			</div>
		{:else}
			<!-- Disabled state - maintains layout -->
			<div class="disabled-state">
				<!-- Placeholder for evaluation -->
				<div class="text-center mb-2 h-10 flex items-center justify-center">
					<div class="text-3xl font-bold text-[#505050] font-mono">—</div>
				</div>

				<!-- Placeholder for stats -->
				<div class="grid grid-cols-3 gap-2 items-center mb-2">
					<span class="text-[#505050] text-left font-mono text-xs w-[35px]">—</span>
					<span class="text-[#505050] font-bold text-center font-mono text-lg">—</span>
					<span class="text-[#505050] text-right font-mono text-xs w-[50px]">—</span>
				</div>

				<!-- Placeholder for best line -->
				<div class="h-[40px] flex items-center justify-center">
					<p class="text-[#505050] text-xs">Analysis disabled</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
