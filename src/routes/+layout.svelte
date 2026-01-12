<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { navigating } from "$app/stores";
	import { page } from "$app/stores";
	import { gsap } from "gsap";
	import {
		isInitialLoad,
		completeInitialLoad,
	} from "$lib/stores/initialLoadStore";
	import Navbar from "$lib/components/Navbar.svelte";
	import DeveloperSignature from "$lib/components/DeveloperSignature.svelte";
	import IdentityCheck from "$lib/components/IdentityCheck.svelte";
	import { isIdentityVerified } from "$lib/stores/userStore";
	import "../app.css";

	// Accept any props that SvelteKit might pass (including params)
	export let params = {};
	export let data = {};

	// Boot Sequence Refs
	let bootSequenceRef: HTMLElement;
	let percentageRef: HTMLElement;
	let curtainLeftRef: HTMLElement;
	let curtainRightRef: HTMLElement;
	let microDataRefs: Record<number, HTMLElement> = {};
	let progress = 0;
	let bootComplete = false;
	let bootSequenceStarted = false;

	// Cybernetic Shutter Refs
	let shutterOverlayRef: HTMLElement;
	let shutterRef: HTMLElement;
	let routeNameRef: HTMLElement;
	let isTransitioning = false;
	let previousRoute = "";

	// Technical messages for boot sequence
	const microDataMessages = [
		"MOMO_SYSTEMS v2.1 // INITIALIZING KERNEL...",
		"ESTABLISHING UPLINK...",
		"PARSING DATA STREAMS...",
		"SYNCHRONIZING SYSTEMS...",
		"VERIFYING INTEGRITY...",
		"OPTIMIZING PERFORMANCE...",
		"LOADING ASSETS...",
		"CONNECTING TO MAINFRAME...",
	];

	const positions = [
		{ top: "5%", left: "5%" },
		{ top: "5%", right: "5%" },
		{ bottom: "5%", left: "5%" },
		{ bottom: "5%", right: "5%" },
	];

	// Initialize with first 4 messages so they're visible immediately
	let activeMicroData: string[] = [...microDataMessages].slice(0, 4);
	let microDataInterval: ReturnType<typeof setInterval> | null = null;

	// ============================================
	// PART 1: CINEMATIC BOOT SEQUENCE PRELOADER
	// ============================================

	const startBootSequence = () => {
		if (!browser || !bootSequenceRef || bootSequenceStarted) {
			return;
		}

		bootSequenceStarted = true;

		// Ensure percentage counter is visible
		if (percentageRef) {
			gsap.set(percentageRef, { opacity: 1, display: "block" });
		}

		// Initialize micro-data messages
		activeMicroData = [...microDataMessages].slice(0, 4);

		// Wait for next tick to ensure DOM is ready
		setTimeout(() => {
			// Animate micro-data appearance
			Object.values(microDataRefs).forEach((ref, idx) => {
				if (ref) {
					gsap.fromTo(
						ref,
						{ opacity: 0 },
						{
							opacity: 0.7,
							duration: 0.4,
							delay: idx * 0.1,
							ease: "power2.out",
						},
					);
				}
			});

			// Rotate micro-data messages
			microDataInterval = setInterval(() => {
				if (!bootComplete) {
					const shuffled = [...microDataMessages].sort(
						() => Math.random() - 0.5,
					);
					// Create new array to trigger reactivity
					activeMicroData = [...shuffled.slice(0, 4)];

					// Wait for DOM update, then animate
					setTimeout(() => {
						Object.values(microDataRefs).forEach((ref, idx) => {
							if (ref && activeMicroData[idx]) {
								// Update text content
								ref.textContent = activeMicroData[idx];
								// Animate
								gsap.fromTo(
									ref,
									{ opacity: 0 },
									{
										opacity: 0.7,
										duration: 0.4,
										delay: idx * 0.05,
										ease: "power2.out",
									},
								);
							}
						});
					}, 100);
				} else {
					if (microDataInterval) {
						clearInterval(microDataInterval);
						microDataInterval = null;
					}
				}
			}, 1000);

			// Animate percentage counter from 00% to 100%
			const counterTimeline = gsap.timeline({
				onUpdate: () => {
					const currentProgress = Math.floor(
						counterTimeline.progress() * 100,
					);
					progress = currentProgress;
				},
				onComplete: () => {
					progress = 100;
					if (microDataInterval) {
						clearInterval(microDataInterval);
						microDataInterval = null;
					}
					completeBootSequence();
				},
			});

			// Rapid counter animation (2.2 seconds total for better visibility)
			counterTimeline.to(
				{},
				{
					duration: 2.2,
					ease: "power2.inOut",
				},
			);
		}, 100);
	};

	// Identity Check Ref
	let showIdentityCheck = false;

	const completeBootSequence = () => {
		if (!browser || !bootSequenceRef || !curtainLeftRef || !curtainRightRef)
			return;

		// NEW: Check Identity verification
		// Check local store first (but store is reactive, so we check the value)
		let verified = false;
		const unsub = isIdentityVerified.subscribe((v) => (verified = v));
		unsub();

		if (!verified) {
			// Show identity check INSTEAD of finishing the animation
			gsap.to([percentageRef, ...Object.values(microDataRefs)], {
				opacity: 0,
				duration: 0.5,
				onComplete: () => {
					showIdentityCheck = true;
					// Wait for user to verify, then `IdentityCheck.svelte` calls its onComplete
				},
			});
			return;
		}

		resumeBootCompletion();
	};

	const resumeBootCompletion = () => {
		bootComplete = true;
		showIdentityCheck = false;

		// Fade out percentage counter and micro-data (if not already fade out)
		gsap.to(percentageRef, {
			opacity: 0,
			duration: 0.3,
			ease: "power2.in",
		});

		Object.values(microDataRefs).forEach((ref) => {
			if (ref) {
				gsap.to(ref, {
					opacity: 0,
					duration: 0.3,
					ease: "power2.in",
				});
			}
		});

		// Aggressive vertical split exit - hangar doors opening
		const exitTimeline = gsap.timeline({
			onComplete: () => {
				gsap.set(bootSequenceRef, { display: "none" });
				completeInitialLoad();
				// Dispatch event for other components
				if (browser) {
					window.dispatchEvent(
						new CustomEvent("boot-sequence-complete"),
					);
				}
			},
		});

		exitTimeline
			.to(curtainLeftRef, {
				x: "-100%",
				duration: 0.8,
				ease: "power3.inOut",
			})
			.to(
				curtainRightRef,
				{
					x: "100%",
					duration: 0.8,
					ease: "power3.inOut",
				},
				"-=0.8", // Start simultaneously
			);
	};

	// ============================================
	// PART 2: CYBERNETIC SHUTTER PAGE TRANSITION
	// ============================================

	const getRouteName = (pathname: string): string => {
		if (pathname === "/") return "HOME";
		const route = pathname.split("/").filter(Boolean).pop() || "HOME";
		return route.toUpperCase().replace(/-/g, " ");
	};

	// Archive Transition Refs
	let archiveOverlayRef: HTMLElement;
	import GrainOverlay from "$lib/components/GrainOverlay.svelte";

	const startArchiveTransition = (targetRoute: string, isEntry: boolean) => {
		if (!archiveOverlayRef) return;

		isTransitioning = true;

		gsap.set(archiveOverlayRef, {
			display: "flex",
			opacity: 1,
			pointerEvents: "auto",
		});

		const tl = gsap.timeline({
			onComplete: () => {
				if (isEntry) {
					// Navigating TO archive -> fade out overlay after load simulates
					gsap.to(archiveOverlayRef, {
						yPercent: -100,
						duration: 0.8,
						ease: "power3.inOut",
						onComplete: () => {
							gsap.set(archiveOverlayRef, {
								display: "none",
								yPercent: 0,
							});
							isTransitioning = false;
						},
					});
				} else {
					// Navigating FROM archive home -> simple fade out
					gsap.to(archiveOverlayRef, {
						opacity: 0,
						duration: 0.5,
						onComplete: () => {
							gsap.set(archiveOverlayRef, { display: "none" });
							isTransitioning = false;
						},
					});
				}
			},
		});

		// Entry Animation sequence
		const title = archiveOverlayRef.querySelector(".archive-title");
		const subtitle = archiveOverlayRef.querySelector(".archive-subtitle");

		tl.set([title, subtitle], { opacity: 0, y: 50 })
			.to(title, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
			.to(
				subtitle,
				{ opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
				"-=0.3",
			)
			.to({}, { duration: 0.5 }); // Hold
	};

	const startShutterTransition = (targetRoute: string | null) => {
		if (
			!browser ||
			!shutterOverlayRef ||
			!shutterRef ||
			!routeNameRef ||
			isTransitioning
		)
			return;
		if (!targetRoute) return;

		// Check for Archive Route
		if (targetRoute === "/archive") {
			startArchiveTransition(targetRoute, true);
			return;
		}

		isTransitioning = true;
		const routeName = getRouteName(targetRoute);

		// Set initial state
		gsap.set(shutterOverlayRef, {
			display: "block",
			opacity: 0,
			pointerEvents: "auto",
			zIndex: 9999,
		});
		gsap.set(shutterRef, {
			y: "-100%",
		});
		gsap.set(routeNameRef, {
			opacity: 0,
			scale: 0.8,
		});

		// Fade in overlay
		gsap.to(shutterOverlayRef, {
			opacity: 1,
			duration: 0.1,
			ease: "power2.in",
			onComplete: () => {
				// Shutter slides down rapidly (0.4s easeInExpo)
				gsap.to(shutterRef, {
					y: "0%",
					duration: 0.4,
					ease: "expo.in",
					onComplete: () => {
						// Flash route name
						gsap.set(routeNameRef, {
							textContent: `>>> NAVIGATING: /${routeName}`,
						});
						gsap.to(routeNameRef, {
							opacity: 1,
							scale: 1,
							duration: 0.2,
							ease: "power2.out",
							onComplete: () => {
								gsap.to(routeNameRef, {
									opacity: 0,
									scale: 0.9,
									duration: 0.15,
									ease: "power2.in",
									delay: 0.3,
								});
							},
						});
					},
				});
			},
		});
	};

	const completeShutterTransition = () => {
		if (!browser || !shutterOverlayRef || !shutterRef) return;

		// Shutter slides up rapidly
		gsap.to(shutterRef, {
			y: "-100%",
			duration: 0.4,
			ease: "expo.out",
			onComplete: () => {
				// Fade out overlay
				gsap.to(shutterOverlayRef, {
					opacity: 0,
					duration: 0.2,
					ease: "power2.out",
					onComplete: () => {
						gsap.set(shutterOverlayRef, {
							display: "none",
							pointerEvents: "none",
							zIndex: 9998,
						});
						isTransitioning = false;

						// Trigger staggered entrance animation for new page content
						triggerStaggeredEntrance();
					},
				});
			},
		});
	};

	const triggerStaggeredEntrance = () => {
		if (!browser) return;

		// Small delay to ensure DOM is ready
		setTimeout(() => {
			// Animate main content elements with stagger
			const mainContent = document.querySelector("main");
			if (mainContent) {
				// Get all direct children sections and components
				const elements = Array.from(mainContent.children).filter(
					(el) =>
						el.tagName === "SECTION" ||
						el.tagName === "ARTICLE" ||
						el.classList.contains("stagger-item"),
				);

				if (elements.length > 0) {
					gsap.fromTo(
						elements,
						{
							opacity: 0,
							y: 40,
							scale: 0.98,
						},
						{
							opacity: 1,
							y: 0,
							scale: 1,
							duration: 0.7,
							stagger: 0.1,
							ease: "power3.out",
							delay: 0.15,
						},
					);
				}
			}

			// Also animate any elements with the stagger-item class globally
			const staggerItems = document.querySelectorAll(".stagger-item");
			if (staggerItems.length > 0) {
				gsap.fromTo(
					staggerItems,
					{
						opacity: 0,
						y: 30,
					},
					{
						opacity: 1,
						y: 0,
						duration: 0.6,
						stagger: 0.08,
						ease: "power2.out",
						delay: 0.2,
					},
				);
			}
		}, 100);
	};

	// Watch for navigation changes
	$: {
		if (browser) {
			if ($navigating && $navigating.to) {
				// Navigation started
				const targetRoute = $navigating.to.url.pathname;
				if (
					targetRoute &&
					targetRoute !== previousRoute &&
					!isTransitioning
				) {
					previousRoute = targetRoute;
					startShutterTransition(targetRoute);
				}
			} else if (!$navigating && isTransitioning) {
				// Navigation completed
				// Small delay to ensure page is rendered
				setTimeout(() => {
					completeShutterTransition();
				}, 100);
			}
		}
	}

	// Track current page for route name
	$: {
		if (browser && $page && $page.url) {
			const currentPath = $page.url.pathname;
			if (currentPath !== previousRoute && !isTransitioning) {
				previousRoute = currentPath;
			}
		}
	}

	onMount(() => {
		if (!browser) return;

		// Ensure initial load store is true on mount
		// This handles cases where store might have been reset
		if (!$isInitialLoad) {
			isInitialLoad.set(true);
		}

		// Console Easter Egg - Developer Signature
		const asciiArt = `
%c
╔═══════════════════════════════════════╗
║                                       ║
║    ████████╗ █████╗ ██╗  ██╗          ║
║    ╚══██╔══╝██╔══██╗██║  ██║          ║
║       ██║   ███████║███████║          ║
║       ██║   ██╔══██║██╔══██║          ║
║       ██║   ██║  ██║██║  ██║          ║
║       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝          ║
║                                       ║
║    ███╗   ███╗███████╗██████╗         ║
║    ████╗ ████║██╔════╝██╔══██╗        ║
║    ██╔████╔██║█████╗  ██████╔╝        ║
║    ██║╚██╔╝██║██╔══╝  ██╔══██╗        ║
║    ██║ ╚═╝ ██║███████╗██║  ██║        ║
║    ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝        ║
║                                       ║
║       ███╗   ███╗██╗   ██╗████████╗   ║
║       ████╗ ████║██║   ██║╚══██╔══╝   ║
║       ██╔████╔██║██║   ██║   ██║      ║
║       ██║╚██╔╝██║██║   ██║   ██║      ║
║       ██║ ╚═╝ ██║╚██████╔╝   ██║      ║
║       ╚═╝     ╚═╝ ╚═════╝    ╚═╝      ║
║                                       ║
║     ENGINEERED WITH PRECISION          ║
╚═══════════════════════════════════════╝
		`;

		console.log(
			asciiArt,
			'color: #00d9ff; font-family: "JetBrains Mono", monospace; font-size: 9px; line-height: 1.2; letter-spacing: 0.3px;',
		);
		console.log(
			"%c Code by Tahsin Mert Mutlu",
			'background: #000000; color: #00d9ff; padding: 8px 16px; border: 1px solid #00d9ff; font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: bold; text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);',
		);

		// Start boot sequence if initial load
		let unsubscribeInitialLoad: (() => void) | null = null;

		unsubscribeInitialLoad = isInitialLoad.subscribe((shouldLoad) => {
			if (shouldLoad && !bootComplete) {
				// Wait for DOM to be fully ready
				setTimeout(() => {
					if (bootSequenceRef && percentageRef) {
						startBootSequence();
					} else {
						// Retry if refs aren't ready yet
						setTimeout(() => {
							if (bootSequenceRef && percentageRef) {
								startBootSequence();
							}
						}, 300);
					}
				}, 300);
			}
		});

		return () => {
			if (unsubscribeInitialLoad) {
				unsubscribeInitialLoad();
			}
			if (microDataInterval) {
				clearInterval(microDataInterval);
				microDataInterval = null;
			}
		};
	});
</script>

<!-- Boot Sequence Preloader (runs once on initial mount) -->
{#if $isInitialLoad}
	<div
		bind:this={bootSequenceRef}
		class="boot-sequence-preloader fixed inset-0 z-[9999] bg-black"
		aria-hidden="true"
	>
		<!-- Percentage Counter (Center) -->
		<div
			bind:this={percentageRef}
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-white text-7xl md:text-9xl font-light tracking-wider opacity-100 z-20"
		>
			{String(progress).padStart(2, "0")}%
		</div>

		<!-- Technical Text (Corners) -->
		{#each positions as pos, index}
			<div
				bind:this={microDataRefs[index]}
				class="absolute font-mono text-white text-xs md:text-sm opacity-0 tracking-wider pointer-events-none z-20"
				style="top: {pos.top || 'auto'}; left: {pos.left ||
					'auto'}; right: {pos.right ||
					'auto'}; bottom: {pos.bottom || 'auto'};"
			>
				{activeMicroData[index] || ""}
			</div>
		{/each}

		<!-- Curtain Left (Vertical Split) -->
		<div
			bind:this={curtainLeftRef}
			class="absolute top-0 left-0 w-1/2 h-full bg-black z-10"
			style="transform: translateX(0%)"
		></div>

		<!-- Curtain Right (Vertical Split) -->
		<div
			bind:this={curtainRightRef}
			class="absolute top-0 right-0 w-1/2 h-full bg-black z-10"
			style="transform: translateX(0%)"
		></div>
	</div>

	<!-- Identity Verification Step -->
	{#if showIdentityCheck}
		<IdentityCheck
			onComplete={() => {
				isIdentityVerified.set(true);
				resumeBootCompletion();
			}}
		/>
	{/if}
{/if}

<!-- Cybernetic Shutter Page Transition (runs on navigation) -->
<div
	bind:this={shutterOverlayRef}
	class="cybernetic-shutter-overlay fixed inset-0 bg-black"
	style="display: none; opacity: 0; pointer-events: none; z-index: 9998;"
	aria-hidden="true"
>
	<!-- Black Shutter -->
	<div
		bind:this={shutterRef}
		class="cybernetic-shutter absolute top-0 left-0 w-full h-full bg-black"
		style="transform: translateY(-100%)"
	></div>

	<div
		bind:this={routeNameRef}
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-white text-4xl md:text-6xl font-light tracking-wider opacity-0"
		style="transform: translate(-50%, -50%) scale(0.8);"
	>
		>>> NAVIGATING: /HOME
	</div>
</div>

<!-- Special Archive Preloader Overlay -->
<div
	bind:this={archiveOverlayRef}
	class="fixed inset-0 bg-black z-[10000] flex items-center justify-center overflow-hidden"
	style="display: none; opacity: 0; pointer-events: none;"
>
	<div class="relative z-10 text-center">
		<h1
			class="archive-title text-9xl md:text-[12rem] font-display font-bold text-white leading-none tracking-tighter opacity-0"
			style="transform: translateY(100px);"
		>
			ARCHIVE
		</h1>
		<div
			class="archive-subtitle font-mono text-sm md:text-base text-zinc-500 mt-4 tracking-[0.5em] uppercase opacity-0"
		>
			Loading Classified Data
		</div>
	</div>

	<!-- Animated grid lines background -->
	<div class="absolute inset-0 z-0 opacity-20">
		<div class="absolute top-0 left-1/4 w-px h-full bg-white/20"></div>
		<div class="absolute top-0 left-2/4 w-px h-full bg-white/20"></div>
		<div class="absolute top-0 left-3/4 w-px h-full bg-white/20"></div>
		<div class="absolute top-1/4 left-0 w-full h-px bg-white/20"></div>
		<div class="absolute top-2/4 left-0 w-full h-px bg-white/20"></div>
		<div class="absolute top-3/4 left-0 w-full h-px bg-white/20"></div>
	</div>
</div>

<GrainOverlay />

{#if $page.url.pathname !== "/work"}
	<Navbar />
{/if}

<slot />

<!-- Developer Signature - Fixed bottom-right corner -->
<DeveloperSignature />

<style>
	/* Boot Sequence Styles */
	.boot-sequence-preloader {
		overflow: hidden;
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		right: 0 !important;
		bottom: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background-color: #000000 !important;
		z-index: 9999 !important;
		display: block !important;
		visibility: visible !important;
	}

	.boot-sequence-preloader * {
		will-change: transform, opacity;
	}

	/* Ensure percentage counter is visible and on top */
	.boot-sequence-preloader > div:first-child {
		opacity: 1 !important;
		z-index: 20 !important;
		position: relative;
	}

	/* Cybernetic Shutter Styles */
	.cybernetic-shutter-overlay {
		overflow: hidden;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
	}

	.cybernetic-shutter {
		transform-origin: top center;
		will-change: transform;
	}

	/* Ensure smooth animations */
	:global(main section),
	:global(main article) {
		will-change: transform, opacity;
	}
</style>
