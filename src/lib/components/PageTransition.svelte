<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gsap } from 'gsap';
	import { pageTransition, completePageTransition } from '$lib/stores/pageTransitionStore';

	let overlayRef: HTMLElement;
	let shutterRef: HTMLElement;
	let isVisible = false;

	// Subscribe to page transition store
	let transitionState = { isTransitioning: false, targetRoute: null };
	
	const unsubscribe = pageTransition.subscribe((state) => {
		transitionState = state;
		if (state.isTransitioning && state.targetRoute) {
			startTransition(state.targetRoute);
		}
	});

	function startTransition(targetRoute: string) {
		if (!overlayRef || !shutterRef) return;

		isVisible = true;

		// Set initial state - overlay invisible, shutter at top
		gsap.set(overlayRef, { 
			opacity: 0, 
			display: 'block',
			pointerEvents: 'auto'
		});
		gsap.set(shutterRef, {
			y: '-100%',
			scaleY: 1
		});

		// Animate overlay fade in
		gsap.to(overlayRef, {
			opacity: 1,
			duration: 0.2,
			ease: 'power2.in',
			onComplete: () => {
				// Shutter wipe down - covers the entire screen
				gsap.to(shutterRef, {
					y: '0%',
					duration: 0.6,
					ease: 'power2.inOut',
					onComplete: () => {
						// Navigate to target route
						goto(targetRoute).then(() => {
							// After navigation, reverse the animation
							setTimeout(() => {
								// Shutter wipe up - reveals new page
								gsap.to(shutterRef, {
									y: '-100%',
									duration: 0.6,
									ease: 'power2.inOut',
									onComplete: () => {
										// Fade out overlay
										gsap.to(overlayRef, {
											opacity: 0,
											duration: 0.2,
											ease: 'power2.out',
											onComplete: () => {
												gsap.set(overlayRef, { 
													display: 'none',
													pointerEvents: 'none'
												});
												isVisible = false;
												completePageTransition();
											}
										});
									}
								});
							}, 50); // Small delay to ensure page has loaded
						});
					}
				});
			}
		});
	}

	onMount(() => {
		return () => {
			unsubscribe();
		};
	});
</script>

<!-- Page Transition Overlay -->
<div
	bind:this={overlayRef}
	class="page-transition-overlay"
	style="display: none; opacity: 0; pointer-events: none;"
	aria-hidden="true"
>
	<!-- Black Shutter -->
	<div
		bind:this={shutterRef}
		class="page-transition-shutter"
	></div>
</div>

<style>
	.page-transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		pointer-events: none;
		overflow: hidden;
	}

	.page-transition-shutter {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #000000;
		transform-origin: top center;
		will-change: transform;
	}
</style>