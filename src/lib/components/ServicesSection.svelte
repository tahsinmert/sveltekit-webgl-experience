<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Service = {
		title: string;
		description: string;
		mediaSrc: string;
		mediaType: 'video' | 'image';
	};

	const services: Service[] = [
		{
			title: 'STRATEGY',
			description: 'Data-driven insights and strategic planning to elevate your digital presence.',
			mediaSrc: '/videos/card-engineering-mech.mp4',
			mediaType: 'video'
		},
		{
			title: 'DESIGN',
			description: 'Crafting visually stunning interfaces that blend aesthetics with functionality.',
			mediaSrc: '/videos/card-architecture-holo.mp4',
			mediaType: 'video'
		},
		{
			title: 'DEVELOPMENT',
			description: 'Building scalable, high-performance applications with cutting-edge technologies.',
			mediaSrc: '/videos/card-software-flow.mp4',
			mediaType: 'video'
		}
	];

	let sectionRef: HTMLElement;
	let leftColumnRef: HTMLElement;
	let rightColumnRef: HTMLElement;
	let videoStageRef: HTMLElement;
	let serviceItems: HTMLElement[] = [];
	let currentActiveIndex: number | null = null;
	let isMobile = false;

	// Video elements for smooth transitions
	let currentVideoRef: HTMLVideoElement | null = null;
	let nextVideoRef: HTMLVideoElement | null = null;
	let defaultVideoRef: HTMLVideoElement | null = null;

	// GSAP timelines for transitions
	let revealTimeline: gsap.core.Timeline | null = null;
	let exitTimeline: gsap.core.Timeline | null = null;

	onMount(() => {
		// Check if mobile
		isMobile = window.innerWidth < 768;

		// Handle window resize
		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};
		window.addEventListener('resize', handleResize);

		// Initialize default video
		if (defaultVideoRef && !isMobile) {
			defaultVideoRef.play().catch(() => {
				// Handle autoplay restrictions
			});
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			if (revealTimeline) {
				revealTimeline.kill();
			}
			if (exitTimeline) {
				exitTimeline.kill();
			}
		};
	});

	function handleServiceMouseEnter(index: number) {
		if (isMobile || currentActiveIndex === index) return;

		const service = services[index];
		
		// If there's already an active service, transition out first
		if (currentActiveIndex !== null && exitTimeline) {
			exitTimeline.kill();
		}

		// Kill any ongoing reveal animation
		if (revealTimeline) {
			revealTimeline.kill();
		}

		// Set up video transition
		if (videoStageRef) {
			// Create next video element
			const nextVideo = document.createElement('video');
			nextVideo.className = 'video-reveal w-full h-full';
			nextVideo.muted = true;
			nextVideo.loop = true;
			nextVideo.playsInline = true;
			nextVideo.src = service.mediaSrc;
			nextVideo.style.position = 'absolute';
			nextVideo.style.top = '0';
			nextVideo.style.left = '0';
			nextVideo.style.width = '100%';
			nextVideo.style.height = '100%';
			nextVideo.style.objectFit = 'cover';
			nextVideo.style.clipPath = 'inset(100% 0% 0% 0%)';
			nextVideo.style.opacity = '0';
			nextVideo.style.transform = 'scale(1.15)';
			videoStageRef.appendChild(nextVideo);
			nextVideoRef = nextVideo;

			// Load and prepare video
			nextVideo.load();
			
			// Wait for video to be ready
			const handleCanPlay = () => {
				nextVideo.removeEventListener('canplay', handleCanPlay);
				
				// Hide default video if showing
				if (defaultVideoRef && currentActiveIndex === null) {
					gsap.to(defaultVideoRef, {
						opacity: 0,
						duration: 0.8,
						ease: 'power2.inOut'
					});
				}

				// Hide current video if switching
				if (currentVideoRef && currentActiveIndex !== null) {
					exitTimeline = gsap.timeline();
					exitTimeline.to(currentVideoRef, {
						clipPath: 'inset(0% 0% 100% 0%)',
						opacity: 0,
						scale: 1.15,
						duration: 0.8,
						ease: 'power2.inOut'
					});
					exitTimeline.call(() => {
						if (currentVideoRef && currentVideoRef.parentNode) {
							currentVideoRef.pause();
							currentVideoRef.currentTime = 0;
							currentVideoRef.remove();
						}
					});
				}

				// Reveal new video with cinematic transition
				revealTimeline = gsap.timeline({
					onComplete: () => {
						// Swap references
						if (currentVideoRef && currentActiveIndex !== null && currentVideoRef.parentNode) {
							currentVideoRef.remove();
						}
						currentVideoRef = nextVideoRef;
						nextVideoRef = null;
						currentActiveIndex = index;
					}
				});

				// Start playing video (hidden)
				nextVideo.play().catch(() => {
					// Handle autoplay restrictions
				});

				// Reveal animation: bottom-to-top clip-path wipe + fade + scale
				revealTimeline.to(nextVideo, {
					clipPath: 'inset(0% 0% 0% 0%)',
					opacity: 1,
					scale: 1,
					duration: 0.8,
					ease: 'power2.inOut'
				}, currentActiveIndex !== null ? 0.2 : 0);
			};

			nextVideo.addEventListener('canplay', handleCanPlay);
			
			// Fallback if video is already loaded
			if (nextVideo.readyState >= 3) {
				handleCanPlay();
			}
		}

		// Animate service text
		const serviceItem = serviceItems[index];
		if (serviceItem) {
			const textElement = serviceItem.querySelector('.service-text');
			const arrowElement = serviceItem.querySelector('.service-arrow');

			if (textElement) {
				gsap.to(textElement, {
					color: '#FFFFFF',
					'-webkit-text-fill-color': '#FFFFFF',
					'-webkit-text-stroke-color': 'transparent',
					'-webkit-text-stroke-width': '0px',
					filter: 'blur(0.5px)',
					x: 20,
					duration: 0.6,
					ease: 'power2.out'
				});
			}

			if (arrowElement) {
				gsap.to(arrowElement, {
					opacity: 1,
					x: 0,
					duration: 0.6,
					ease: 'power2.out'
				});
			}
		}

		// Reset previous service text
		if (currentActiveIndex !== null && serviceItems[currentActiveIndex]) {
			const prevItem = serviceItems[currentActiveIndex];
			const prevText = prevItem.querySelector('.service-text');
			const prevArrow = prevItem.querySelector('.service-arrow');

			if (prevText) {
				gsap.to(prevText, {
					color: 'transparent',
					'-webkit-text-fill-color': 'transparent',
					'-webkit-text-stroke-color': 'rgba(255, 255, 255, 0.4)',
					'-webkit-text-stroke-width': '1px',
					filter: 'blur(0px)',
					x: 0,
					duration: 0.5,
					ease: 'power2.out'
				});
			}

			if (prevArrow) {
				gsap.to(prevArrow, {
					opacity: 0,
					x: -10,
					duration: 0.5,
					ease: 'power2.out'
				});
			}
		}
	}

	function handleServiceMouseLeave(index: number) {
		if (isMobile || currentActiveIndex !== index) return;

		// Keep video visible on mouse leave - only reset text styling
		// This creates a more persistent, cinematic experience
		const serviceItem = serviceItems[index];
		if (serviceItem) {
			const textElement = serviceItem.querySelector('.service-text');
			const arrowElement = serviceItem.querySelector('.service-arrow');

			if (textElement) {
				gsap.to(textElement, {
					color: 'transparent',
					'-webkit-text-fill-color': 'transparent',
					'-webkit-text-stroke-color': 'rgba(255, 255, 255, 0.4)',
					'-webkit-text-stroke-width': '1px',
					filter: 'blur(0px)',
					x: 0,
					duration: 0.5,
					ease: 'power2.out'
				});
			}

			if (arrowElement) {
				gsap.to(arrowElement, {
					opacity: 0,
					x: -10,
					duration: 0.5,
					ease: 'power2.out'
				});
			}
		}

		// Optional: Show default video again after a delay
		// Uncomment below if you want videos to fade back to default on mouse leave
		/*
		if (defaultVideoRef && currentVideoRef) {
			exitTimeline = gsap.timeline({ delay: 1.5 });
			exitTimeline.to(currentVideoRef, {
				clipPath: 'inset(0% 0% 100% 0%)',
				opacity: 0,
				scale: 1.15,
				duration: 0.75,
				ease: 'power2.inOut'
			});
			exitTimeline.to(defaultVideoRef, {
				opacity: 1,
				duration: 0.7,
				ease: 'power2.inOut'
			}, '-=0.3');
			exitTimeline.call(() => {
				if (currentVideoRef && currentVideoRef.parentNode) {
					currentVideoRef.pause();
					currentVideoRef.currentTime = 0;
					currentVideoRef.remove();
				}
				currentVideoRef = null;
				currentActiveIndex = null;
			});
		}
		*/
	}
</script>

<section
	bind:this={sectionRef}
	id="services"
	class="relative h-screen w-full overflow-hidden pt-32 lg:pt-40"
	style="background-color: #050505;"
>
	<!-- Split-Screen Grid Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-2 h-full w-full bg-black">
		<!-- Left Column: Interactive Service List -->
		<div
			bind:this={leftColumnRef}
			class="relative flex flex-col justify-center px-12 lg:px-24 py-16 md:py-0 z-10"
		>
			<!-- Section Header (Mobile Only) -->
			<div class="mb-12 md:hidden">
				<h2
					class="text-3xl font-sans font-light tracking-widest text-white/40 uppercase mb-4"
					style="font-family: 'Inter', 'Helvetica Now', sans-serif; letter-spacing: 0.2em;"
				>
					Services
				</h2>
				<div class="h-px w-24 bg-white/20"></div>
			</div>

			<!-- Services List -->
			<div class="space-y-4 md:space-y-6 lg:space-y-8">
				{#each services as service, index}
					<div
						bind:this={serviceItems[index]}
						class="service-item relative cursor-pointer group"
						on:mouseenter={() => handleServiceMouseEnter(index)}
						on:mouseleave={() => handleServiceMouseLeave(index)}
					>
						<div class="relative flex items-center gap-4">
							<!-- Service Title -->
							<h3
								class="service-text text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-sans font-bold uppercase leading-none tracking-tight"
								style="font-family: 'Inter Tight', 'Inter', 'Helvetica Now', sans-serif; will-change: transform, color;"
							>
								{service.title}
							</h3>

							<!-- Arrow Icon (Desktop Only) -->
							{#if !isMobile}
								<svg
									class="service-arrow w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white opacity-0 -translate-x-2 transition-opacity"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									style="will-change: transform, opacity;"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							{/if}
						</div>
					</div>

					<!-- Mobile: Video Below Title -->
					{#if isMobile}
						<div class="mt-6 w-full aspect-video overflow-hidden rounded-sm">
							{#if service.mediaType === 'video'}
								<video
									class="w-full h-full object-cover"
									src={service.mediaSrc}
									autoplay
									loop
									muted
									playsinline
								></video>
							{:else}
								<img
									class="w-full h-full object-cover"
									src={service.mediaSrc}
									alt={service.title}
								/>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Right Column: Video Stage (Desktop Only) -->
		{#if !isMobile}
			<div
				bind:this={rightColumnRef}
				class="relative h-full overflow-hidden"
			>
				<div
					bind:this={videoStageRef}
					class="relative w-full h-full"
				>
					<!-- Default Ambient Video -->
					<video
						bind:this={defaultVideoRef}
						class="default-video w-full h-full object-cover"
						src="/videos/hero-main-loop.mp4"
						autoplay
						loop
						muted
						playsinline
						style="opacity: 1;"
					></video>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Service text styling - Non-active state: thin elegant stroke */
	.service-text {
		color: transparent;
		-webkit-text-stroke-width: 1px;
		-webkit-text-stroke-color: rgba(255, 255, 255, 0.4);
		transition: color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			-webkit-text-fill-color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			-webkit-text-stroke-color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			filter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Video reveal styling */
	.video-reveal {
		will-change: clip-path, opacity, transform;
		object-fit: cover;
	}

	.default-video {
		will-change: opacity;
		object-fit: cover;
	}

	/* Smooth transitions */
	.service-item {
		transition: all 0.3s ease;
	}

	/* Ensure videos cover properly */
	video {
		object-fit: cover;
	}
</style>
