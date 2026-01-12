<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';

	export let title: string;
	export let description: string;
	export let icon: string;
	export let gradient: 'design' | 'strategy' | 'development' = 'design';
	export let isWide: boolean = false;

	let cardRef: HTMLDivElement | undefined;
	let backgroundRef: HTMLDivElement | undefined;
	let glowRef: HTMLDivElement | undefined;
	let arrowRef: SVGSVGElement | undefined;
	let mouseX = 0;
	let mouseY = 0;
	let isHovered = false;
	let animationFrame: number | null = null;

	const gradients = {
		design: {
			primary: 'radial-gradient(circle at 30% 40%, rgba(236, 72, 153, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
			accent: 'rgba(236, 72, 153, 0.3)'
		},
		strategy: {
			primary: 'radial-gradient(circle at 40% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.3) 0%, transparent 50%), linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%)',
			accent: 'rgba(59, 130, 246, 0.3)'
		},
		development: {
			primary: 'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
			accent: 'rgba(0, 217, 255, 0.3)'
		}
	};

	const currentGradient = gradients[gradient];

	const handleMouseMove = (e: MouseEvent) => {
		if (!cardRef || !isHovered) return;

		const rect = cardRef.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;

		// Parallax effect on background
		if (backgroundRef) {
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const deltaX = (mouseX - centerX) * 0.03;
			const deltaY = (mouseY - centerY) * 0.03;

			gsap.to(backgroundRef, {
				x: deltaX,
				y: deltaY,
				scale: 1.05,
				duration: 0.8,
				ease: 'power2.out'
			});
		}

		// Update glow position
		if (glowRef) {
			glowRef.style.background = `radial-gradient(circle 300px at ${mouseX}px ${mouseY}px, ${currentGradient.accent} 0%, transparent 70%)`;
		}
	};

	const handleMouseEnter = () => {
		isHovered = true;

		if (!cardRef || !glowRef || !arrowRef) return;

		// Intensify glow
		gsap.to(glowRef, {
			opacity: 1,
			duration: 0.4,
			ease: 'power2.out'
		});

		// Animate arrow
		gsap.to(arrowRef, {
			x: 8,
			duration: 0.4,
			ease: 'power2.out'
		});

		// Subtle scale up card
		gsap.to(cardRef, {
			scale: 1.02,
			duration: 0.5,
			ease: 'power2.out'
		});
	};

	const handleMouseLeave = () => {
		isHovered = false;

		if (!cardRef || !backgroundRef || !glowRef || !arrowRef) return;

		// Reset background
		gsap.to(backgroundRef, {
			x: 0,
			y: 0,
			scale: 1,
			duration: 0.6,
			ease: 'power2.out'
		});

		// Reset glow
		gsap.to(glowRef, {
			opacity: 0.5,
			duration: 0.4,
			ease: 'power2.out'
		});

		// Reset arrow
		gsap.to(arrowRef, {
			x: 0,
			duration: 0.4,
			ease: 'power2.out'
		});

		// Reset card scale
		gsap.to(cardRef, {
			scale: 1,
			duration: 0.5,
			ease: 'power2.out'
		});
	};

	onMount(() => {
		if (cardRef) {
			cardRef.addEventListener('mousemove', handleMouseMove);
			cardRef.addEventListener('mouseenter', handleMouseEnter);
			cardRef.addEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			if (cardRef) {
				cardRef.removeEventListener('mousemove', handleMouseMove);
				cardRef.removeEventListener('mouseenter', handleMouseEnter);
				cardRef.removeEventListener('mouseleave', handleMouseLeave);
			}
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

<div
	bind:this={cardRef}
	data-service-card
	class="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 {isWide
		? 'md:col-span-2'
		: 'md:col-span-1'}"
	style="min-height: 400px; transform-origin: center; will-change: transform;"
>
	<!-- Abstract 3D Background -->
	<div
		bind:this={backgroundRef}
		class="absolute inset-0 opacity-60"
		style="background: {currentGradient.primary}; transform-origin: center; will-change: transform;"
	>
		<!-- Additional depth layers -->
		<div
			class="absolute inset-0 opacity-30"
			style="background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);"
		></div>
	</div>

	<!-- Glassmorphism Overlay -->
	<div
		class="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-white/5 via-white/10 to-black/20 border border-white/10"
		style="box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 20px 60px -15px rgba(0, 0, 0, 0.5);"
	></div>

	<!-- Dynamic Glow Effect -->
	<div
		bind:this={glowRef}
		class="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-50"
		style="background: radial-gradient(circle 300px at 50% 50%, ${currentGradient.accent} 0%, transparent 70%); filter: blur(40px);"
	></div>

	<!-- Content -->
	<div class="relative z-20 p-8 md:p-10 lg:p-12 h-full flex flex-col justify-between">
		<div>
			<!-- Icon -->
			<div class="mb-6 text-5xl md:text-6xl lg:text-7xl transform transition-transform duration-300 group-hover:scale-110">
				{icon}
			</div>

			<!-- Title -->
			<h3 class="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-signal">
				{title}
			</h3>

			<!-- Description -->
			<p class="text-signal/70 text-base md:text-lg leading-relaxed max-w-xl">
				{description}
			</p>
		</div>

		<!-- Arrow Link -->
		<div class="mt-8 flex items-center">
			<svg
				bind:this={arrowRef}
				class="w-6 h-6 text-signal/60 group-hover:text-signal transition-colors duration-300"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
				style="transform-origin: center; will-change: transform;"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M17 8l4 4m0 0l-4 4m4-4H3"
				></path>
			</svg>
		</div>
	</div>

	<!-- Deep Shadow for Depth -->
	<div
		class="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
		style="background: radial-gradient(circle at center, ${currentGradient.accent} 0%, transparent 70%); filter: blur(20px);"
	></div>
</div>

<style>
	/* Enhanced glassmorphism */
	:global([data-service-card]) {
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}
</style>
