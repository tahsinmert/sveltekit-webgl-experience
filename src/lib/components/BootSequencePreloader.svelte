<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';

	let progress = 0;
	let isLoaded = false;
	let preloaderRef: HTMLElement;
	let percentageRef: HTMLElement;
	let progressBarRef: HTMLElement;
	let curtainLeftRef: HTMLElement;
	let curtainRightRef: HTMLElement;
	let microDataRefs: Record<number, HTMLElement> = {};

	const microDataMessages = [
		'INITIALIZING CORE...',
		'LOADING ASSETS...',
		'CONNECTING TO MAINFRAME...',
		'PARSING DATA STREAMS...',
		'SYNCHRONIZING SYSTEMS...',
		'ESTABLISHING CONNECTION...',
		'VERIFYING INTEGRITY...',
		'OPTIMIZING PERFORMANCE...'
	];

	const positions = [
		{ top: '5%', left: '5%' },
		{ top: '5%', right: '5%' },
		{ bottom: '5%', left: '5%' },
		{ bottom: '5%', right: '5%' }
	];

	let activeMicroData: string[] = [];

	// Track asset loading
	const loadAssets = () => {
		return new Promise<void>((resolve) => {
			if (!browser) {
				resolve();
				return;
			}
			const images = document.querySelectorAll('img');
			const videos = document.querySelectorAll('video');
			const totalAssets = images.length + videos.length;

			if (totalAssets === 0) {
				// If no assets, simulate loading
				simulateLoading(resolve);
				return;
			}

			let loadedCount = 0;
			let progressInterval: ReturnType<typeof setInterval>;

			const updateProgress = () => {
				loadedCount++;
				progress = Math.min(95, Math.floor((loadedCount / totalAssets) * 100));
				// Smoothly animate progress bar
				if (progressBarRef) {
					gsap.to(progressBarRef, {
						width: `${progress}%`,
						duration: 0.3,
						ease: 'power1.out'
					});
				}
			};

			const checkComplete = () => {
				if (loadedCount >= totalAssets) {
					clearInterval(progressInterval);
					progress = 100;
					if (progressBarRef) {
						gsap.to(progressBarRef, {
							width: '100%',
							duration: 0.3,
							ease: 'power1.out'
						});
					}
					setTimeout(resolve, 300);
				}
			};

			// Track images
			images.forEach((img) => {
				if (img.complete) {
					updateProgress();
					checkComplete();
				} else {
					img.addEventListener('load', () => {
						updateProgress();
						checkComplete();
					});
					img.addEventListener('error', () => {
						updateProgress();
						checkComplete();
					});
				}
			});

			// Track videos
			videos.forEach((video) => {
				if (video.readyState >= 3) {
					updateProgress();
					checkComplete();
				} else {
					video.addEventListener('loadeddata', () => {
						updateProgress();
						checkComplete();
					});
					video.addEventListener('error', () => {
						updateProgress();
						checkComplete();
					});
				}
			});

			// Fallback: ensure we reach 100% even if some assets fail
			progressInterval = setInterval(() => {
				if (progress < 95) {
					progress = Math.min(95, progress + 2);
					// Update progress bar width
					if (progressBarRef) {
						gsap.to(progressBarRef, {
							width: `${progress}%`,
							duration: 0.3,
							ease: 'power1.out'
						});
					}
				}
			}, 100);

			// Minimum loading time for visual effect
			setTimeout(() => {
				if (progress < 100) {
					progress = 100;
					if (progressBarRef) {
						gsap.to(progressBarRef, {
							width: '100%',
							duration: 0.3,
							ease: 'power1.out'
						});
					}
					clearInterval(progressInterval);
					resolve();
				}
			}, 2000);
		});
	};

	const simulateLoading = (resolve: () => void) => {
		let currentProgress = 0;
		const interval = setInterval(() => {
			currentProgress += Math.random() * 15 + 5;
			progress = Math.min(95, Math.floor(currentProgress));
			
			// Smoothly animate progress bar
			if (progressBarRef) {
				gsap.to(progressBarRef, {
					width: `${progress}%`,
					duration: 0.3,
					ease: 'power1.out'
				});
			}

			if (progress >= 95) {
				clearInterval(interval);
				setTimeout(() => {
					progress = 100;
					if (progressBarRef) {
						gsap.to(progressBarRef, {
							width: '100%',
							duration: 0.3,
							ease: 'power1.out'
						});
					}
					resolve();
				}, 300);
			}
		}, 150);
	};

	const rotateMicroData = () => {
		const shuffled = [...microDataMessages].sort(() => Math.random() - 0.5);
		activeMicroData = shuffled.slice(0, 4);

		const interval = setInterval(() => {
			if (!isLoaded) {
				const shuffled = [...microDataMessages].sort(() => Math.random() - 0.5);
				activeMicroData = shuffled.slice(0, 4);
				
				// Animate micro-data appearance
				Object.values(microDataRefs).forEach((ref, idx) => {
					if (ref) {
						gsap.fromTo(
							ref,
							{ opacity: 0 },
							{ opacity: 0.7, duration: 0.3, delay: idx * 0.1 }
						);
					}
				});
			} else {
				clearInterval(interval);
			}
		}, 600);

		return () => clearInterval(interval);
	};

	const revealCurtain = () => {
		if (!browser || !preloaderRef || !curtainLeftRef || !curtainRightRef) return;

		isLoaded = true;

		// Animate percentage fade out
		gsap.to(percentageRef, {
			opacity: 0,
			duration: 0.3,
			ease: 'power2.in'
		});

		// Animate micro-data fade out
		Object.values(microDataRefs).forEach((ref) => {
			if (ref) {
				gsap.to(ref, {
					opacity: 0,
					duration: 0.3,
					ease: 'power2.in'
				});
			}
		});

		// Animate progress bar fade out
		gsap.to(progressBarRef, {
			opacity: 0,
			duration: 0.3,
			ease: 'power2.in'
		});

		// Curtain reveal - vertical split (blind effect)
		const tl = gsap.timeline({
			onComplete: () => {
				// Dispatch event to trigger Hero animations
				if (browser) {
					window.dispatchEvent(new CustomEvent('preloader-complete'));
				}
				// Hide preloader
				gsap.set(preloaderRef, { display: 'none' });
			}
		});

		tl.to(curtainLeftRef, {
			x: '-100%',
			duration: 1.2,
			ease: 'power3.inOut'
		})
			.to(
				curtainRightRef,
				{
					x: '100%',
					duration: 1.2,
					ease: 'power3.inOut'
				},
				'-=1.2'
			);
	};

	onMount(() => {
		let cleanupMicroData: (() => void) | null = null;

		(async () => {
			// Animate initial micro-data appearance
			activeMicroData = [...microDataMessages].slice(0, 4);
			await new Promise<void>((resolve) => setTimeout(resolve, 50));

			// Start micro-data rotation
			cleanupMicroData = rotateMicroData();

			// Animate progress bar initial appearance
			if (progressBarRef) {
				gsap.fromTo(
					progressBarRef,
					{ width: '0%' },
					{ width: `${progress}%`, duration: 0.5, ease: 'power2.out' }
				);
			}

			// Wait for DOM to be ready
			await new Promise<void>((resolve) => setTimeout(resolve, 100));

			// Load assets
			await loadAssets();

			// Small delay at 100%
			await new Promise<void>((resolve) => setTimeout(resolve, 400));

			// Reveal curtain
			revealCurtain();
		})();

		return () => {
			if (cleanupMicroData) {
				cleanupMicroData();
			}
		};
	});
</script>

<div bind:this={preloaderRef} class="boot-sequence-preloader fixed inset-0 z-[9999] bg-black">
	<!-- Progress Bar -->
	<div
		bind:this={progressBarRef}
		class="absolute top-0 left-0 h-px bg-white"
		style="width: 0%"
	></div>

	<!-- Percentage Counter (Center) -->
	<div
		bind:this={percentageRef}
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-white text-6xl md:text-8xl font-light tracking-wider"
	>
		{progress}%
	</div>

	<!-- Micro-Data Messages (Corners) -->
	{#each positions as pos, index}
		{#if activeMicroData[index]}
			<div
				bind:this={microDataRefs[index]}
				class="absolute font-mono text-white text-xs md:text-sm opacity-70 tracking-wider"
				style="top: {pos.top || 'auto'}; left: {pos.left || 'auto'}; right: {pos.right || 'auto'}; bottom: {pos.bottom || 'auto'};"
			>
				{activeMicroData[index]}
			</div>
		{/if}
	{/each}

	<!-- Curtain Left -->
	<div
		bind:this={curtainLeftRef}
		class="absolute top-0 left-0 w-1/2 h-full bg-black"
		style="transform: translateX(0%)"
	></div>

	<!-- Curtain Right -->
	<div
		bind:this={curtainRightRef}
		class="absolute top-0 right-0 w-1/2 h-full bg-black"
		style="transform: translateX(0%)"
	></div>
</div>

<style>
	.boot-sequence-preloader {
		overflow: hidden;
	}

	/* Ensure smooth rendering */
	:global(.boot-sequence-preloader *) {
		will-change: transform, opacity;
	}
</style>
