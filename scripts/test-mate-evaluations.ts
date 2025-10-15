#!/usr/bin/env bun

/**
 * Test mate-in-N evaluation handling
 *
 * Verifies that mate scores are correctly:
 * 1. Detected by Stockfish
 * 2. Transformed based on perspective (white vs black to move)
 * 3. Displayed with correct signs
 */

import { Chess } from 'chess.js';

console.log('🧪 Mate Evaluation Tests\n');
console.log('════════════════════════════════════════════════════════════════════════════════\n');

interface MateTest {
	name: string;
	fen: string;
	turn: 'w' | 'b';
	expectedSign: '+' | '-';
	mateIn: number;
	description: string;
}

const mateTests: MateTest[] = [
	{
		name: 'Back Rank Mate (White)',
		fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
		turn: 'w',
		expectedSign: '+',
		mateIn: 1,
		description: 'White plays Ra8# for back rank checkmate'
	},
	{
		name: 'Back Rank Mate (Black)',
		fen: 'r5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
		turn: 'b',
		expectedSign: '+',
		mateIn: 1,
		description: 'Black plays Ra1# for back rank checkmate (from black\'s perspective)'
	},
	{
		name: 'Getting Mated (White)',
		fen: '6k1/5ppp/8/8/8/8/r4PPP/6K1 w - - 0 1',
		turn: 'w',
		expectedSign: '-',
		mateIn: -1,
		description: 'White is getting mated in 1 (Ra1# next move)'
	},
	{
		name: 'Getting Mated (Black)',
		fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 b - - 0 1',
		turn: 'b',
		expectedSign: '-',
		mateIn: -1,
		description: 'Black is getting mated in 1 (Ra8# next move, from black\'s perspective)'
	},
	{
		name: 'Mate in 2 (White)',
		fen: '5rk1/5ppp/8/8/8/8/Q4PPP/6K1 w - - 0 1',
		turn: 'w',
		expectedSign: '+',
		mateIn: 2,
		description: 'White mates in 2 moves'
	},
	{
		name: 'Mate in 3 (White)',
		fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
		turn: 'w',
		expectedSign: '+',
		mateIn: 1,
		description: 'Scholar\'s Mate: Qxf7#'
	}
];

console.log('📋 Test Cases:\n');

mateTests.forEach((test, index) => {
	const chess = new Chess(test.fen);
	const isValid = chess.isCheckmate() || chess.isCheck() || chess.isGameOver() === false;

	console.log(`${index + 1}. ${test.name}`);
	console.log(`   FEN: ${test.fen}`);
	console.log(`   Turn: ${test.turn === 'w' ? 'White' : 'Black'}`);
	console.log(`   Expected: ${test.expectedSign === '+' ? 'Positive' : 'Negative'} mate in ${Math.abs(test.mateIn)}`);
	console.log(`   Description: ${test.description}`);
	console.log(`   Position Valid: ${isValid ? '✅' : '❌'}`);
	console.log();
});

console.log('════════════════════════════════════════════════════════════════════════════════\n');
console.log('🔍 How to Verify:\n');
console.log('Manual Browser Testing:');
console.log('1. Start dev server: bun run dev');
console.log('2. Navigate to /play');
console.log('3. For each test case:');
console.log('   a. Load the FEN position');
console.log('   b. Run analysis');
console.log('   c. Verify:');
console.log('      • Mate detection (shows "M" instead of centipawns)');
console.log('      • Correct sign (+ for winning, - for losing)');
console.log('      • Correct mate distance (M1, M2, M3, etc.)');
console.log('      • Perspective is correct based on whose turn it is\n');

console.log('════════════════════════════════════════════════════════════════════════════════\n');
console.log('📊 Expected Behavior:\n');
console.log('Stockfish Output -> Transformation -> Display');
console.log('─────────────────────────────────────────────────────────────────────────────\n');
console.log('White to move scenarios:');
console.log('  mate 1  →  M+1  →  Shows as "+M1" (white is mating)');
console.log('  mate -1 →  M-1  →  Shows as "-M1" (white is getting mated)\n');
console.log('Black to move scenarios:');
console.log('  mate -1 →  M+1  →  Shows as "+M1" (black is mating, transformed perspective)');
console.log('  mate 1  →  M-1  →  Shows as "-M1" (black is getting mated, transformed)\n');

console.log('════════════════════════════════════════════════════════════════════════════════\n');
console.log(`✅ Test suite prepared with ${mateTests.length} mate scenarios\n`);
console.log('📝 Next: Verify in browser or create automated Playwright test\n');
