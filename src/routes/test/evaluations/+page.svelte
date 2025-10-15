<script lang="ts">
	import EvaluationTestRunner from '$lib/components/test/EvaluationTestRunner.svelte';
</script>

<svelte:head>
	<title>Evaluation Tests - Chess 2.0</title>
</svelte:head>

<div class="min-h-screen p-8">
	<div class="max-w-4xl mx-auto">
		<div class="mb-6">
			<a
				href="/"
				class="text-[#4a9eff] hover:text-[#3b82f6] transition text-sm flex items-center gap-2"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
						clip-rule="evenodd"
					/>
				</svg>
				Back to Game
			</a>
		</div>

		<EvaluationTestRunner />

		<div class="mt-8 p-6 bg-[#2d2d2d] rounded-lg border border-[#404040]">
			<h3 class="text-lg font-semibold text-[#e8e8e8] mb-4">What These Tests Check</h3>
			<ul class="space-y-2 text-sm text-[#a0a0a0]">
				<li class="flex items-start gap-2">
					<span class="text-[#4a9eff]">•</span>
					<span><strong class="text-[#e8e8e8]">Perspective Correctness:</strong> Evaluations show from the current player's perspective</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-[#4a9eff]">•</span>
					<span><strong class="text-[#e8e8e8]">Material Wins:</strong> Winning material (like a queen) shows as highly positive/negative</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-[#4a9eff]">•</span>
					<span><strong class="text-[#e8e8e8]">Sign Consistency:</strong> White's good moves = positive, Black's good moves = negative (from white's perspective)</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-[#4a9eff]">•</span>
					<span><strong class="text-[#e8e8e8]">Neutral Moves:</strong> Equal trades and quiet moves show near-zero evaluations</span>
				</li>
			</ul>

			<div class="mt-4 p-3 bg-[#3d3d3d] rounded border border-[#505050]">
				<p class="text-xs text-[#a0a0a0]">
					<strong class="text-[#e8e8e8]">Note:</strong> Tests analyze positions at depth 20, which may take a few seconds per test case.
					Check the browser console for detailed evaluation logs.
				</p>
			</div>
		</div>
	</div>
</div>
