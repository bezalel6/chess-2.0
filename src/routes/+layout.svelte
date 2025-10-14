<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-[#1e1e1e]">
	<header class="bg-[#2d2d2d] border-b border-[#404040]">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<a href="/" class="text-2xl font-bold text-[#e8e8e8] hover:text-[#4a9eff] transition-colors">
				Chess 2.0
			</a>
		</div>
	</header>

	{@render children?.()}
</div>
