<script lang="ts">
	import { engineConfigStore } from '$lib/stores/engineConfig.svelte';
	import { onMount } from 'svelte';

	let { isOpen = $bindable(false) } = $props();

	let depth = $state(engineConfigStore.depth);
	let threads = $state(engineConfigStore.threads);
	let hash = $state(engineConfigStore.hash);

	const maxThreads = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;

	function handleSave() {
		engineConfigStore.setDepth(depth);
		engineConfigStore.setThreads(threads);
		engineConfigStore.setHash(hash);
		isOpen = false;
	}

	function handleReset() {
		engineConfigStore.resetToDefaults();
		depth = engineConfigStore.depth;
		threads = engineConfigStore.threads;
		hash = engineConfigStore.hash;
	}

	function handleCancel() {
		// Reset to current store values
		depth = engineConfigStore.depth;
		threads = engineConfigStore.threads;
		hash = engineConfigStore.hash;
		isOpen = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	}

	// Load from localStorage on mount
	onMount(() => {
		engineConfigStore.loadFromLocalStorage();
		depth = engineConfigStore.depth;
		threads = engineConfigStore.threads;
		hash = engineConfigStore.hash;
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={handleBackdropClick}
		role="button"
		tabindex="-1"
	>
		<div
			class="bg-[#2d2d2d] rounded-lg border border-[#404040] w-full max-w-md p-6"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="settings-title"
		>
			<h2 id="settings-title" class="text-2xl font-bold text-[#e8e8e8] mb-6">
				Engine Settings
			</h2>

			<div class="space-y-6">
				<!-- Depth Setting -->
				<div>
					<label for="depth" class="block text-sm font-medium text-[#e8e8e8] mb-2">
						Search Depth: {depth}
					</label>
					<input
						id="depth"
						type="range"
						min="10"
						max="30"
						step="1"
						bind:value={depth}
						class="w-full h-2 bg-[#3d3d3d] rounded-lg appearance-none cursor-pointer accent-[#4a9eff]"
					/>
					<p class="text-xs text-[#a0a0a0] mt-1">
						Higher depth = more accurate, but slower (10-30)
					</p>
				</div>

				<!-- Threads Setting -->
				<div>
					<label for="threads" class="block text-sm font-medium text-[#e8e8e8] mb-2">
						Threads: {threads}
					</label>
					<input
						id="threads"
						type="range"
						min="1"
						max={Math.min(maxThreads, 4)}
						step="1"
						bind:value={threads}
						class="w-full h-2 bg-[#3d3d3d] rounded-lg appearance-none cursor-pointer accent-[#4a9eff]"
					/>
					<p class="text-xs text-[#a0a0a0] mt-1">
						CPU cores to use (max {Math.min(maxThreads, 4)} on your device)
					</p>
				</div>

				<!-- Hash Size Setting -->
				<div>
					<label for="hash" class="block text-sm font-medium text-[#e8e8e8] mb-2">
						Hash Size: {hash} MB
					</label>
					<input
						id="hash"
						type="range"
						min="16"
						max="512"
						step="16"
						bind:value={hash}
						class="w-full h-2 bg-[#3d3d3d] rounded-lg appearance-none cursor-pointer accent-[#4a9eff]"
					/>
					<p class="text-xs text-[#a0a0a0] mt-1">
						Memory for position cache (16-512 MB)
					</p>
				</div>

				<!-- Info Box -->
				<div class="bg-[#3d3d3d] border border-[#505050] rounded p-3">
					<p class="text-xs text-[#a0a0a0] leading-relaxed">
						<strong class="text-[#e8e8e8]">Note:</strong> These settings apply to both move
						evaluations and position analysis. Changes take effect immediately and are saved to your
						browser.
					</p>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 mt-6">
				<button
					onclick={handleReset}
					class="flex-1 px-4 py-2 bg-[#3d3d3d] text-[#e8e8e8] rounded hover:bg-[#4d4d4d] transition font-medium"
				>
					Reset to Defaults
				</button>
				<button
					onclick={handleCancel}
					class="flex-1 px-4 py-2 bg-[#3d3d3d] text-[#e8e8e8] rounded hover:bg-[#4d4d4d] transition font-medium"
				>
					Cancel
				</button>
				<button
					onclick={handleSave}
					class="flex-1 px-4 py-2 bg-[#4a9eff] text-white rounded hover:bg-[#3b82f6] transition font-medium"
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
