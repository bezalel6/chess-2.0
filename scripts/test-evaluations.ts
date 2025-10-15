#!/usr/bin/env bun
/**
 * Automated evaluation testing script
 * Tests move evaluation correctness from command line
 *
 * Usage: bun run test:eval
 */

import { spawn, type ChildProcess } from 'child_process';
import { Chess } from 'chess.js';
import type { Square } from '../src/lib/types/chess';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test cases interface
interface EvaluationTestCase {
	id: string;
	name: string;
	fen: string;
	testSquare: Square;
	expectedMoves: {
		move: string;
		from: Square;
		to: Square;
		expectedSign: 'positive' | 'negative' | 'neutral';
		reason: string;
	}[];
}

// Stockfish UCI wrapper for Node
class StockfishNode {
	private process: ChildProcess | null = null;
	private ready = false;
	private outputBuffer: string[] = [];

	async initialize(depth = 20, threads = 2, hash = 128): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Path to stockfish JS file from node_modules
				// Use node to run the stockfish file directly (cross-platform)
				const stockfishPath = join(__dirname, '../node_modules/stockfish/src/stockfish-17.1-lite-51f59da.js');

				this.process = spawn('node', [stockfishPath], {
					stdio: ['pipe', 'pipe', 'pipe']
				});

				this.process.stdout?.on('data', (data) => {
					const lines = data.toString().split('\n');
					for (const line of lines) {
						if (line.trim()) {
							this.outputBuffer.push(line.trim());

							if (line.includes('uciok')) {
								this.ready = true;
								// Configure engine
								this.send(`setoption name Threads value ${threads}`);
								this.send(`setoption name Hash value ${hash}`);
								this.send('isready');
								resolve();
							}
						}
					}
				});

				this.process.stderr?.on('data', (data) => {
					console.error('Stockfish error:', data.toString());
				});

				this.process.on('error', (error) => {
					reject(error);
				});

				// Initialize UCI
				this.send('uci');
			} catch (error) {
				reject(error);
			}
		});
	}

	private send(command: string): void {
		if (!this.process || !this.process.stdin) {
			throw new Error('Stockfish process not initialized');
		}
		this.process.stdin.write(command + '\n');
	}

	async analyze(fen: string, depth = 20): Promise<{
		evaluation: number;
		mate?: number;
		depth: number;
		bestMove: string;
	}> {
		if (!this.ready) {
			throw new Error('Engine not ready');
		}

		return new Promise((resolve, reject) => {
			this.outputBuffer = [];
			let result = {
				evaluation: 0,
				mate: undefined as number | undefined,
				depth: 0,
				bestMove: ''
			};

			const checkOutput = () => {
				const output = this.outputBuffer.join('\n');

				// Parse info lines for evaluation
				const infoLines = output.split('\n').filter(line => line.startsWith('info'));
				for (const line of infoLines) {
					// Depth
					const depthMatch = line.match(/depth (\d+)/);
					if (depthMatch) result.depth = parseInt(depthMatch[1]);

					// Centipawn evaluation
					const cpMatch = line.match(/cp (-?\d+)/);
					if (cpMatch) {
						result.evaluation = parseInt(cpMatch[1]);
						result.mate = undefined;
					}

					// Mate score
					const mateMatch = line.match(/mate (-?\d+)/);
					if (mateMatch) {
						result.mate = parseInt(mateMatch[1]);
						result.evaluation = result.mate > 0 ? 10000 : -10000;
					}
				}

				// Check for bestmove
				const bestmoveMatch = output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
				if (bestmoveMatch) {
					result.bestMove = bestmoveMatch[1];
					clearInterval(checkInterval);
					resolve(result);
				}
			};

			const checkInterval = setInterval(checkOutput, 100);

			// Timeout after 30 seconds
			setTimeout(() => {
				clearInterval(checkInterval);
				reject(new Error('Analysis timeout'));
			}, 30000);

			// Send analysis commands
			this.send(`position fen ${fen}`);
			this.send(`go depth ${depth}`);
		});
	}

	quit(): void {
		if (this.process) {
			this.send('quit');
			this.process.kill();
			this.process = null;
		}
	}
}

// Test cases
const evaluationTestCases: EvaluationTestCase[] = [
	{
		id: 'white-wins-queen',
		name: 'White Wins Queen (Bxd8)',
		fen: 'rnbqk2r/1ppp1ppp/7n/2b1p1BQ/p1B1P3/3P4/PPP2PPP/RN2K1NR w KQkq - 2 6',
		testSquare: 'g5',
		expectedMoves: [
			{
				move: 'g5→d8',
				from: 'g5',
				to: 'd8',
				expectedSign: 'positive',
				reason: 'Bxd8 wins black queen - should be highly positive for white'
			},
			{
				move: 'g5→e7',
				from: 'g5',
				to: 'e7',
				expectedSign: 'neutral',
				reason: 'Bishop to e7 is a neutral move - small eval'
			}
		]
	},
	{
		id: 'black-wins-queen',
		name: 'Black Wins Queen (Qxe5)',
		fen: 'rnb1kbnr/ppp1pp1p/3q2p1/4Q3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 2 4',
		testSquare: 'd6',
		expectedMoves: [
			{
				move: 'd6→e5',
				from: 'd6',
				to: 'e5',
				expectedSign: 'negative',
				reason: 'Qxe5 wins white queen - should be highly negative (good for black)'
			},
			{
				move: 'd6→d7',
				from: 'd6',
				to: 'd7',
				expectedSign: 'positive',
				reason: 'Queen retreat - white keeps material advantage, positive for white'
			}
		]
	},
	{
		id: 'starting-position-white',
		name: 'Starting Position - e2 Pawn Moves',
		fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		testSquare: 'e2',
		expectedMoves: [
			{
				move: 'e2→e4',
				from: 'e2',
				to: 'e4',
				expectedSign: 'neutral',
				reason: 'Standard opening move - evaluation should be close to 0'
			}
		]
	}
];

function validateEvaluation(
	actualEval: number,
	expectedSign: 'positive' | 'negative' | 'neutral'
): { passed: boolean; message: string } {
	const NEUTRAL_THRESHOLD = 50;

	switch (expectedSign) {
		case 'positive':
			if (actualEval > NEUTRAL_THRESHOLD) {
				return { passed: true, message: `✓ Correctly positive: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected positive, got ${actualEval} (should be > ${NEUTRAL_THRESHOLD})`
			};

		case 'negative':
			if (actualEval < -NEUTRAL_THRESHOLD) {
				return { passed: true, message: `✓ Correctly negative: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected negative, got ${actualEval} (should be < -${NEUTRAL_THRESHOLD})`
			};

		case 'neutral':
			if (Math.abs(actualEval) <= NEUTRAL_THRESHOLD * 2) {
				return { passed: true, message: `✓ Correctly neutral: ${actualEval}` };
			}
			return {
				passed: false,
				message: `✗ Expected neutral, got ${actualEval} (should be within ±${NEUTRAL_THRESHOLD * 2})`
			};
	}
}

async function runTests() {
	console.log('🧪 Starting Evaluation Tests\n');
	console.log('═'.repeat(80));

	const engine = new StockfishNode();

	try {
		console.log('🚀 Initializing Stockfish engine...');
		await engine.initialize(20, 2, 128);
		console.log('✅ Engine ready\n');
	} catch (error) {
		console.error('❌ Failed to initialize Stockfish engine:', error);
		process.exit(1);
	}

	let totalTests = 0;
	let passedTests = 0;
	const failedTests: string[] = [];

	for (const testCase of evaluationTestCases) {
		console.log(`\n📋 ${testCase.name}`);
		console.log(`   FEN: ${testCase.fen}`);
		console.log(`   Testing square: ${testCase.testSquare}`);

		const chess = new Chess(testCase.fen);
		const turnToMove = chess.turn();
		const isWhiteToMove = turnToMove === 'w';

		console.log(`   Side to move: ${isWhiteToMove ? 'WHITE' : 'BLACK'}\n`);

		for (const expectedMove of testCase.expectedMoves) {
			totalTests++;

			try {
				// Make the move to get resulting position
				const move = chess.move({ from: expectedMove.from, to: expectedMove.to });

				if (!move) {
					console.log(`   ❌ ${expectedMove.move}: Illegal move`);
					failedTests.push(`${testCase.name} - ${expectedMove.move}: Illegal move`);
					continue;
				}

				const resultingFen = chess.fen();

				// Analyze resulting position
				console.log(`   ⏳ Analyzing ${expectedMove.move}...`);
				const result = await engine.analyze(resultingFen, 20);

				// Apply perspective transformation (UCI standard: positive = good for white)
				let evaluation: number;
				if (result.mate !== undefined) {
					evaluation = isWhiteToMove ? result.mate : -result.mate;
				} else {
					evaluation = isWhiteToMove ? result.evaluation : -result.evaluation;
				}

				console.log(`   📊 Raw: ${result.evaluation} | Transformed: ${evaluation} (depth ${result.depth})`);

				// Validate
				const validation = validateEvaluation(evaluation, expectedMove.expectedSign);

				if (validation.passed) {
					passedTests++;
					console.log(`   ${validation.message}`);
					console.log(`      ✓ ${expectedMove.reason}`);
				} else {
					console.log(`   ${validation.message}`);
					console.log(`      ✗ ${expectedMove.reason}`);
					failedTests.push(`${testCase.name} - ${expectedMove.move}: ${validation.message}`);
				}

				// Undo move for next test
				chess.undo();

			} catch (error) {
				console.log(`   ❌ ${expectedMove.move}: Error during evaluation`);
				console.error(`      ${error}`);
				failedTests.push(`${testCase.name} - ${expectedMove.move}: ${error}`);
			}
		}
	}

	engine.quit();

	console.log('\n' + '═'.repeat(80));
	console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);

	if (passedTests === totalTests) {
		console.log('✅ All tests passed!\n');
		process.exit(0);
	} else {
		console.log(`\n❌ ${totalTests - passedTests} test(s) failed:`);
		failedTests.forEach(test => console.log(`   - ${test}`));
		console.log();
		process.exit(1);
	}
}

// Run tests
runTests().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
