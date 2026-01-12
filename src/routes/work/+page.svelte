<script lang="ts">
	import { onMount } from "svelte";
	import DigitalArchiveTunnel from "$lib/components/DigitalArchiveTunnel.svelte";

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Work — Digital Archive Tunnel</title>
	<meta
		name="description"
		content="Explore our portfolio in an immersive 3D experience"
	/>
</svelte:head>

{#if mounted}
	<DigitalArchiveTunnel />

	<!-- Awwwards-style Back Button -->
	<a
		href="/"
		class="fixed top-8 left-8 z-[9000] group flex items-center gap-3 mix-blend-difference text-white"
	>
		<div
			class="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-90 group-hover:border-white/60 bg-black/10 backdrop-blur-sm"
		>
			<div
				class="absolute inset-0 bg-white scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full origin-center"
			></div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5 transition-colors duration-500 group-hover:text-black relative z-10"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
				/>
			</svg>
		</div>
		<span
			class="font-mono text-xs tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out"
		>
			RETURN_HOME
		</span>
	</a>
{/if}

<style>
	:global(body) {
		background-color: #000000;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
