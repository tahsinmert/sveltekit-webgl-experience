<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	// Register ScrollTrigger plugin
	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	export let items: Array<{
		number: string;
		title: string;
		description: string;
		mediaSrc: string;
	}> = [];

	let sectionRef: HTMLElement;
	let trackRef: HTMLElement;
	let progressIndicatorRef: HTMLElement;
	let cardRefs: HTMLElement[] = [];
	let imageRefs: HTMLElement[] = [];
	let scrollTriggerInstance: ScrollTrigger | null = null;

	onMount(() => {
		if (!sectionRef || !trackRef) return;

		// Wait for next tick to ensure DOM is fully rendered
		setTimeout(() => {
			const cards = trackRef.querySelectorAll('.scroll-card');
			const totalWidth = trackRef.scrollWidth - window.innerWidth;

			// Create horizontal scroll animation
			const horizontalScroll = gsap.to(trackRef, {
				x: -totalWidth,
				ease: 'none',
				scrollTrigger: {
					trigger: sectionRef,
					start: 'top top',
					end: () => `+=${totalWidth}`,
					pin: true,
					scrub: 1,
					anticipatePin: 1,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						// Update progress indicator
						if (progressIndicatorRef) {
							const progress = self.progress;
							gsap.to(progressIndicatorRef, {
								width: `${progress * 100}%`,
								duration: 0.1,
								ease: 'none'
							});
						}

						// Enhanced parallax effect for images inside cards
						cards.forEach((card, index) => {
							const image = card.querySelector('.card-image');
							if (image) {
								// Calculate card's position in viewport
								const cardRect = card.getBoundingClientRect();
								const cardCenter = cardRect.left + cardRect.width / 2;
								const viewportCenter = window.innerWidth / 2;
								const distanceFromCenter = (cardCenter - viewportCenter) / window.innerWidth;
								
								// Parallax moves slower than scroll (50% speed)
								const parallaxOffset = distanceFromCenter * 30;
								
								gsap.set(image, {
									x: parallaxOffset,
									force3D: true
								});
							}
						});
					}
				}
			});

			scrollTriggerInstance = horizontalScroll.scrollTrigger || null;

			// Set initial card visibility with stagger
			gsap.set(cardRefs, {
				opacity: 0,
				y: 50
			});

			gsap.to(cardRefs, {
				opacity: 1,
				y: 0,
				duration: 1,
				stagger: 0.2,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: sectionRef,
					start: 'top 80%',
					toggleActions: 'play none none reverse'
				}
			});
		}, 100);

		return () => {
			if (scrollTriggerInstance) {
				scrollTriggerInstance.kill();
			}
			ScrollTrigger.getAll().forEach((st) => {
				if (st.vars && st.vars.trigger === sectionRef) {
					st.kill();
				}
			});
		};
	});

	onDestroy(() => {
		if (scrollTriggerInstance) {
			scrollTriggerInstance.kill();
		}
		ScrollTrigger.getAll().forEach((st) => {
			if (st.vars.trigger === sectionRef) {
				st.kill();
			}
		});
	});
</script>

<section
	bind:this={sectionRef}
	id="work"
	class="relative h-screen w-full overflow-hidden"
	style="background-color: #050505;"
>
	<!-- Horizontal Track Container -->
	<div
		bind:this={trackRef}
		class="flex whitespace-nowrap h-full items-center"
		style="will-change: transform;"
	>
		{#each items as item, index}
			<div
				bind:this={cardRefs[index]}
				class="scroll-card flex-shrink-0 relative flex items-center justify-center px-8 md:px-16 lg:px-24"
				style="width: 75vw;"
			>
				<!-- Card Container with Video Background -->
				<div
					class="relative w-full h-[80vh] rounded-2xl overflow-hidden"
					style="border: 1px solid rgba(255, 255, 255, 0.1);"
				>
					<!-- Video Background (Bottom Layer - z-0) -->
					<div
						bind:this={imageRefs[index]}
						class="card-image absolute inset-0 w-full h-full"
						style="will-change: transform;"
					>
						<video
							class="absolute inset-0 w-full h-full object-cover z-0"
							src={item.mediaSrc}
							autoplay
							muted
							loop
							playsinline
							style="filter: brightness(0.95) contrast(1.1);"
						></video>
					</div>

					<!-- Dark Overlay (Middle Layer - z-10) -->
					<div class="absolute inset-0 bg-black/60 z-10"></div>

					<!-- Background Giant Numeral (on overlay layer) -->
					<div
						class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
						style="opacity: 0.03;"
					>
						<span
							class="text-[30rem] md:text-[40rem] font-black text-white leading-none"
							style="font-family: 'Inter', system-ui, sans-serif; font-weight: 900; -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1); -webkit-text-fill-color: transparent;"
						>
							{item.number}
						</span>
					</div>

					<!-- Content Container (Top Layer - z-20) -->
					<div class="relative h-full flex flex-col md:flex-row items-center justify-between p-12 md:p-16 lg:p-24 z-20">
						<!-- Left Side: Text Content -->
						<div class="flex-1 flex flex-col justify-center mb-8 md:mb-0 md:pr-12">
							<!-- Title -->
							<h3
								class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase tracking-tight mb-6 md:mb-8 text-white"
								style="font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; line-height: 0.9;"
							>
								{item.title}
							</h3>

							<!-- Description -->
							<p
								class="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl leading-relaxed"
								style="font-family: 'Inter', system-ui, sans-serif;"
							>
								{item.description}
							</p>
						</div>

						<!-- Right Side: Empty space (video is now background) -->
						<div class="flex-shrink-0 w-full md:w-[45%] h-[40vh] md:h-[60vh]"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Progress Indicator -->
	<div
		class="fixed bottom-0 left-0 right-0 h-1 z-50"
		style="background: rgba(255, 255, 255, 0.05);"
	>
		<div
			bind:this={progressIndicatorRef}
			class="h-full"
			style="background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.3) 100%); width: 0%; transition: width 0.1s ease-out;"
		></div>
	</div>
</section>

<style>
	.scroll-card {
		will-change: transform, opacity;
	}

	/* Ensure smooth scrolling and prevent layout shift */
	:global(#what-we-offer) {
		position: relative;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Optimize video rendering */
	:global(#what-we-offer video) {
		object-fit: cover;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* Glassmorphism enhancement */
	.scroll-card > div {
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	}
</style>