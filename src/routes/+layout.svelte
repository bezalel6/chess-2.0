<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import EngineSettings from '$lib/components/ui/EngineSettings.svelte';
	import '../app.css';

	let { children } = $props();
	let showSettings = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-[#1e1e1e]">
	<header class="bg-[#2d2d2d] border-b border-[#404040]">
		<div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
			<a href="/" class="text-2xl font-bold text-[#e8e8e8] hover:text-[#4a9eff] transition-colors">
				Chess 2.0
			</a>

			<button
				onclick={() => showSettings = true}
				class="flex items-center gap-2 px-4 py-2 bg-[#3d3d3d] text-[#e8e8e8] rounded hover:bg-[#4d4d4d] transition font-medium"
				aria-label="Engine Settings"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
				</svg>
				<span class="hidden sm:inline">Settings</span>
			</button>
		</div>
	</header>

	{@render children?.()}
</div>

<EngineSettings bind:isOpen={showSettings} />
