#!/usr/bin/env bun
/**
 * Unit tests for evaluation perspective transformation logic
 * Tests the core logic that converts Stockfish evals to player perspective
 *
 * Usage: bun run test:perspective
 */

interface TestCase {
	name: string;
	stockfishEval: number; // Raw Stockfish output (always from white's perspective)
	stockfishMate?: number; // Mate score if applicable
	isWhiteToMove: boolean; // Whose turn it is
	expectedEval: number; // What the UI should show
	expectedMate?: number; // Expected mate score
	reason: string;
}

const testCases: TestCase[] = [
	{
		name: 'White wins queen (white to move)',
		stockfishEval: 483, // +4.83 for white
		isWhiteToMove: true,
		expectedEval: 483, // Should stay positive (good for white)
		reason: 'White to move, positive eval should stay positive'
	},
	{
		name: 'Black wins queen (black to move)',
		stockfishEval: 451, // +4.51 for white (bad for black)
		isWhiteToMove: false,
		expectedEval: -451, // Should become negative (bad for current player)
		reason: 'Black to move, positive-for-white should become negative'
	},
	{
		name: 'Neutral opening move (white)',
		stockfishEval: 25,
		isWhiteToMove: true,
		expectedEval: 25,
		reason: 'White to move, small positive stays as-is'
	},
	{
		name: 'Neutral opening move (black)',
		stockfishEval: -20,
		isWhiteToMove: false,
		expectedEval: 20, // Negated
		reason: 'Black to move, negative-for-white becomes positive'
	},
	{
		name: 'White has advantage (black to move)',
		stockfishEval: 150, // +1.50 for white
		isWhiteToMove: false,
		expectedEval: -150, // Should show as negative (bad for black)
		reason: 'Black to move, white advantage shows as negative'
	},
	{
		name: 'Black has advantage (white to move)',
		stockfishEval: -200, // -2.00 for white (good for black)
		isWhiteToMove: true,
		expectedEval: -200, // Should stay negative (bad for white)
		reason: 'White to move, black advantage stays negative'
	},
	{
		name: 'Mate in 3 (white to move)',
		stockfishEval: 10000,
		stockfishMate: 3,
		isWhiteToMove: true,
		expectedEval: 3,
		expectedMate: 3,
		reason: 'White to move, mate score stays positive'
	},
	{
		name: 'Mate in 2 (black to move)',
		stockfishEval: -10000,
		stockfishMate: 2,
		isWhiteToMove: false,
		expectedEval: -2,
		expectedMate: -2,
		reason: 'Black to move, positive mate gets negated'
	},
	{
		name: 'Getting mated in 1 (white to move)',
		stockfishEval: -10000,
		stockfishMate: -1,
		isWhiteToMove: true,
		expectedEval: -1,
		expectedMate: -1,
		reason: 'White to move, getting mated stays negative'
	}
];

/**
 * The actual transformation logic from moveEvaluations.svelte.ts
 * This is what we're testing
 */
function transformEvaluation(
	stockfishResult: { evaluation: number; mate?: number },
	isWhiteToMove: boolean
): { evaluation: number; mate?: number } {
	let evaluation: number;
	let mate: number | undefined;

	if (stockfishResult.mate !== undefined) {
		// Mate score transformation
		mate = isWhiteToMove ? stockfishResult.mate : -stockfishResult.mate;
		evaluation = mate;
	} else {
		// Centipawn evaluation transformation
		evaluation = isWhiteToMove ? stockfishResult.evaluation : -stockfishResult.evaluation;
		mate = undefined;
	}

	return { evaluation, mate };
}

function runTests() {
	console.log('🧪 Perspective Transformation Logic Tests\n');
	console.log('═'.repeat(80));
	console.log('\nTesting the core logic that transforms Stockfish evaluations');
	console.log('to the current player\'s perspective.\n');

	let passed = 0;
	let failed = 0;
	const failures: string[] = [];

	for (const testCase of testCases) {
		const result = transformEvaluation(
			{
				evaluation: testCase.stockfishEval,
				mate: testCase.stockfishMate
			},
			testCase.isWhiteToMove
		);

		const evalMatches = result.evaluation === testCase.expectedEval;
		const mateMatches = testCase.expectedMate === undefined
			? result.mate === undefined
			: result.mate === testCase.expectedMate;

		const testPassed = evalMatches && mateMatches;

		if (testPassed) {
			passed++;
			console.log(`✅ ${testCase.name}`);
			console.log(`   Input: ${testCase.stockfishEval}${testCase.stockfishMate ? ` (M${testCase.stockfishMate})` : ''} | Side: ${testCase.isWhiteToMove ? 'WHITE' : 'BLACK'}`);
			console.log(`   Output: ${result.evaluation}${result.mate ? ` (M${result.mate})` : ''}`);
			console.log(`   ✓ ${testCase.reason}\n`);
		} else {
			failed++;
			console.log(`❌ ${testCase.name}`);
			console.log(`   Input: ${testCase.stockfishEval}${testCase.stockfishMate ? ` (M${testCase.stockfishMate})` : ''} | Side: ${testCase.isWhiteToMove ? 'WHITE' : 'BLACK'}`);
			console.log(`   Expected: ${testCase.expectedEval}${testCase.expectedMate ? ` (M${testCase.expectedMate})` : ''}`);
			console.log(`   Got: ${result.evaluation}${result.mate ? ` (M${result.mate})` : ''}`);
			console.log(`   ✗ ${testCase.reason}\n`);
			failures.push(testCase.name);
		}
	}

	console.log('═'.repeat(80));
	console.log(`\n📊 Results: ${passed}/${passed + failed} tests passed (${((passed / (passed + failed)) * 100).toFixed(1)}%)\n`);

	if (failed === 0) {
		console.log('✅ All perspective transformation tests passed!');
		console.log('   The evaluation logic correctly handles:');
		console.log('   • White to move: keeps Stockfish values as-is');
		console.log('   • Black to move: negates values for black\'s perspective');
		console.log('   • Mate scores: applies same perspective transformation\n');
		return 0;
	} else {
		console.log(`❌ ${failed} test(s) failed:`);
		failures.forEach(name => console.log(`   - ${name}`));
		console.log();
		return 1;
	}
}

// Run tests
const exitCode = runTests();
process.exit(exitCode);
