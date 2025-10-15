<script lang="ts">
	import { moveEvaluationsStore } from '$lib/stores/moveEvaluations.svelte';
	import { evaluationTestCases, validateEvaluation } from '$lib/test-data/evaluationTests';
	import type { EvaluationTestCase } from '$lib/test-data/evaluationTests';
	import { onMount } from 'svelte';

	interface TestResult {
		testId: string;
		testName: string;
		moveName: string;
		expectedSign: string;
		actualEval: number;
		passed: boolean;
		message: string;
		reason: string;
	}

	let testResults = $state<TestResult[]>([]);
	let isRunning = $state(false);
	let currentTest = $state<string>('');

	async function runTest(testCase: EvaluationTestCase): Promise<TestResult[]> {
		const results: TestResult[] = [];

		currentTest = testCase.name;

		// Trigger evaluation
		await moveEvaluationsStore.evaluateMovesFromSquare(
			testCase.testSquare,
			testCase.fen
		);

		// Wait a bit for evaluations to complete
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Check each expected move
		for (const expectedMove of testCase.expectedMoves) {
			const evaluation = moveEvaluationsStore.getEvaluation(
				expectedMove.from,
				expectedMove.to
			);

			if (!evaluation) {
				results.push({
					testId: testCase.id,
					testName: testCase.name,
					moveName: expectedMove.move,
					expectedSign: expectedMove.expectedSign,
					actualEval: 0,
					passed: false,
					message: '✗ Evaluation not found',
					reason: expectedMove.reason
				});
				continue;
			}

			if (evaluation.isCalculating) {
				results.push({
					testId: testCase.id,
					testName: testCase.name,
					moveName: expectedMove.move,
					expectedSign: expectedMove.expectedSign,
					actualEval: 0,
					passed: false,
					message: '⏳ Still calculating',
					reason: expectedMove.reason
				});
				continue;
			}

			const validation = validateEvaluation(evaluation.evaluation, expectedMove.expectedSign);

			results.push({
				testId: testCase.id,
				testName: testCase.name,
				moveName: expectedMove.move,
				expectedSign: expectedMove.expectedSign,
				actualEval: evaluation.evaluation,
				passed: validation.passed,
				message: validation.message,
				reason: expectedMove.reason
			});
		}

		return results;
	}

	async function runAllTests() {
		isRunning = true;
		testResults = [];

		for (const testCase of evaluationTestCases) {
			const results = await runTest(testCase);
			testResults = [...testResults, ...results];

			// Clear evaluations between tests
			moveEvaluationsStore.clear();
			await new Promise(resolve => setTimeout(resolve, 500));
		}

		currentTest = '';
		isRunning = false;
	}

	const passedCount = $derived(testResults.filter(r => r.passed).length);
	const totalCount = $derived(testResults.length);
	const passRate = $derived(totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0);

	onMount(() => {
		moveEvaluationsStore.initialize();
	});
</script>

<div class="test-runner bg-[#2d2d2d] rounded-lg p-6 border border-[#404040]">
	<div class="header mb-6">
		<h2 class="text-2xl font-bold text-[#e8e8e8] mb-2">Evaluation Tests</h2>
		<p class="text-[#a0a0a0] text-sm">
			Tests to verify move evaluation correctness and perspective handling
		</p>
	</div>

	<div class="controls mb-6">
		<button
			onclick={runAllTests}
			disabled={isRunning}
			class="px-4 py-2 bg-[#4a9eff] text-white rounded hover:bg-[#3b82f6] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isRunning ? 'Running Tests...' : 'Run All Tests'}
		</button>

		{#if isRunning && currentTest}
			<span class="ml-4 text-[#a0a0a0] text-sm">
				Currently testing: <span class="text-[#e8e8e8]">{currentTest}</span>
			</span>
		{/if}
	</div>

	{#if testResults.length > 0}
		<div class="summary mb-6 p-4 bg-[#3d3d3d] rounded border border-[#505050]">
			<div class="flex items-center justify-between">
				<span class="text-[#e8e8e8] font-semibold">
					Test Results: {passedCount} / {totalCount} passed
				</span>
				<span
					class="text-lg font-bold"
					class:text-[#4ade80]={parseFloat(passRate) >= 80}
					class:text-[#facc15]={parseFloat(passRate) >= 50 && parseFloat(passRate) < 80}
					class:text-[#f87171]={parseFloat(passRate) < 50}
				>
					{passRate}%
				</span>
			</div>
		</div>

		<div class="results space-y-4">
			{#each evaluationTestCases as testCase}
				{@const testCaseResults = testResults.filter(r => r.testId === testCase.id)}
				{#if testCaseResults.length > 0}
					<div class="test-case bg-[#3d3d3d] rounded p-4 border border-[#505050]">
						<h3 class="text-lg font-semibold text-[#e8e8e8] mb-2">{testCase.name}</h3>
						<p class="text-xs text-[#a0a0a0] mb-3 font-mono">{testCase.fen}</p>

						<div class="moves space-y-2">
							{#each testCaseResults as result}
								<div
									class="move-result p-3 rounded border"
									class:bg-[#1a3a1a]={result.passed}
									class:border-[#4ade80]={result.passed}
									class:bg-[#3a1a1a]={!result.passed}
									class:border-[#f87171]={!result.passed}
								>
									<div class="flex items-start justify-between mb-2">
										<span class="font-mono text-sm text-[#e8e8e8] font-semibold">
											{result.moveName}
										</span>
										<span
											class="text-xs px-2 py-1 rounded"
											class:bg-[#4ade80]={result.passed}
											class:text-[#1e1e1e]={result.passed}
											class:bg-[#f87171]={!result.passed}
											class:text-white={!result.passed}
										>
											{result.passed ? 'PASS' : 'FAIL'}
										</span>
									</div>
									<p class="text-xs text-[#a0a0a0] mb-1">{result.reason}</p>
									<p class="text-sm font-mono" class:text-[#4ade80]={result.passed} class:text-[#f87171]={!result.passed}>
										{result.message}
									</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{:else if !isRunning}
		<div class="empty text-center py-8 text-[#a0a0a0]">
			Click "Run All Tests" to start testing move evaluations
		</div>
	{/if}
</div>
