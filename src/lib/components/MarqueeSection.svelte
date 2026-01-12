<script>
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';

	export let text = 'CREATIVITY — INNOVATION — PERFORMANCE — EXCELLENCE — VISION';
	
	let marqueeRef;
	let marqueeContentRef;
	let scrollVelocity = 0;
	let lastScrollY = 0;
	let lastTime = Date.now();
	let animationId;
	let scrollHandler;
	let currentTween = null;

	onMount(() => {
		// Wait for DOM to be ready
		setTimeout(() => {
			if (!marqueeContentRef || !marqueeRef) return;

			// Duplicate content multiple times for seamless infinite loop
			const cloned1 = marqueeContentRef.cloneNode(true);
			const cloned2 = marqueeContentRef.cloneNode(true);
			marqueeRef.appendChild(cloned1);
			marqueeRef.appendChild(cloned2);

			// Track scroll velocity
			scrollHandler = () => {
				const currentTime = Date.now();
				const currentScrollY = window.scrollY;
				const deltaTime = currentTime - lastTime;
				const deltaScroll = Math.abs(currentScrollY - lastScrollY);
				
				if (deltaTime > 0) {
					scrollVelocity = deltaScroll / deltaTime; // pixels per millisecond
					scrollVelocity = Math.min(scrollVelocity, 1.5); // Cap at max speed
				}
				
				lastScrollY = currentScrollY;
				lastTime = currentTime;
			};

			window.addEventListener('scroll', scrollHandler, { passive: true });

			// GSAP infinite scroll animation with velocity
			const startAnimation = () => {
				if (!marqueeRef || !marqueeContentRef) return;

				const contentWidth = marqueeContentRef.offsetWidth;
				
				// Set initial position
				gsap.set(marqueeRef, { x: 0 });
				
				// Create infinite scroll animation
				const animate = () => {
					if (!marqueeRef) return;
					
					const baseSpeed = 80; // Base pixels per second
					const velocityMultiplier = scrollVelocity * 150; // Adjust multiplier
					const currentSpeed = baseSpeed + velocityMultiplier;
					
					// Kill existing animation
					gsap.killTweensOf(marqueeRef);
					
					// Get current position
					const currentX = gsap.getProperty(marqueeRef, 'x') || 0;
					const targetX = currentX - contentWidth;
					
					// Animate to next position
					currentTween = gsap.to(marqueeRef, {
						x: targetX,
						duration: contentWidth / currentSpeed,
						ease: 'none',
						onComplete: () => {
							// Reset position when one cycle completes
							gsap.set(marqueeRef, { x: 0 });
							animate(); // Continue animation
						}
					});
				};
				
				// Start animation
				animate();
				
				// Update animation speed based on scroll velocity (throttled)
				let lastUpdate = 0;
				const velocityUpdate = () => {
					const now = Date.now();
					if (now - lastUpdate > 200) { // Update every 200ms
						if (currentTween && currentTween.isActive()) {
							const baseSpeed = 80;
							const velocityMultiplier = scrollVelocity * 150;
							const currentSpeed = baseSpeed + velocityMultiplier;
							const contentWidth = marqueeContentRef.offsetWidth;
							const progress = currentTween.progress();
							const remaining = contentWidth * (1 - progress);
							
							currentTween.timeScale(1); // Reset time scale
							currentTween.duration(remaining / currentSpeed);
						}
						lastUpdate = now;
					}
					animationId = requestAnimationFrame(velocityUpdate);
				};
				
				velocityUpdate();
			};

			// Start animation
			startAnimation();
		}, 100);

		return () => {
			window.removeEventListener('scroll', scrollHandler);
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			gsap.killTweensOf(marqueeRef);
		};
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (marqueeRef) {
			gsap.killTweensOf(marqueeRef);
		}
	});
</script>

<section
	id="marquee-section"
	class="relative py-20 md:py-24 bg-black overflow-hidden"
	data-marquee-hover
>
	<div
		bind:this={marqueeRef}
		class="flex whitespace-nowrap will-change-transform"
		style="transform: translateX(0);"
	>
		<div
			bind:this={marqueeContentRef}
			class="inline-flex items-center"
		>
			<span
				class="text-7xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter px-8 md:px-12"
				style="font-family: 'Inter', system-ui, sans-serif; font-weight: 900; -webkit-font-smoothing: antialiased;"
			>
				{text}
			</span>
		</div>
	</div>
</section>

<style>
	#marquee-section {
		/* Enable mix-blend-mode for cursor interaction */
		isolation: isolate;
	}

	/* Ensure smooth scrolling */
	:global([data-marquee-hover]) {
		position: relative;
		z-index: 10;
	}
</style>
