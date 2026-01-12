<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let titleRef: HTMLElement | undefined;
	let footerRef: HTMLElement | undefined;

	const socialLinks = [
		{ name: 'LinkedIn', url: 'https://linkedin.com', icon: '↗' },
		{ name: 'Twitter', url: 'https://twitter.com', icon: '↗' },
		{ name: 'GitHub', url: 'https://github.com', icon: '↗' },
		{ name: 'Email', url: 'mailto:hello@example.com', icon: '↗' }
	];

	const currentYear = new Date().getFullYear();

	onMount(() => {
		// Animate title on mount
		if (titleRef) {
			gsap.from(titleRef, {
				opacity: 0,
				y: 50,
				duration: 1.2,
				ease: 'power3.out',
				delay: 0.2
			});
		}
	});
</script>

<footer
	bind:this={footerRef}
	id="contact"
	class="relative w-full min-h-screen bg-void flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 py-32 overflow-hidden"
	data-footer-hover
>
	<!-- Main Title Section -->
	<div class="flex flex-col items-center justify-center flex-grow w-full max-w-7xl mx-auto">
		<h1
			bind:this={titleRef}
			class="text-6xl md:text-8xl lg:text-9xl xl:text-[12rem] font-display font-bold text-signal text-center leading-none tracking-tight cursor-none select-none"
			data-footer-title
		>
			LET'S WORK<br />TOGETHER
		</h1>
	</div>

	<!-- Bottom Section: Social Links & Copyright -->
	<div class="w-full max-w-7xl mx-auto mt-auto pt-16 pb-8">
		<!-- Social Links -->
		<nav class="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12" aria-label="Social links">
			{#each socialLinks as link}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-signal text-sm md:text-base font-medium hover:text-electric transition-colors duration-300 flex items-center gap-2 group"
					data-hover
				>
					<span class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
						{link.name}
					</span>
					<span class="text-electric opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						{link.icon}
					</span>
				</a>
			{/each}
		</nav>

		<!-- Copyright -->
		<div class="text-center">
			<p class="text-signal-dim text-xs md:text-sm">
				© {currentYear} Anonymous. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	footer {
		position: relative;
		z-index: 1;
	}

	/* Ensure footer takes full viewport height */
	footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.6) 100%
		);
		pointer-events: none;
		z-index: -1;
	}

	/* Smooth text rendering */
	h1 {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
	}
</style>
