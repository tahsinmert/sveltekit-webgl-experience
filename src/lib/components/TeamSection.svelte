<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { gsap } from "gsap";

	type TeamMember = {
		name: string;
		role: string;
		videoSrc: string;
	};

	// Sample team data - replace with your actual team members
	const teamMembers: TeamMember[] = [
		{
			name: "TAHSIN MERT MUTLU",
			role: "Creative Director",
			videoSrc: "/videos/about-future-interaction.mp4", // Replace with actual portrait videos
		},
		{
			name: "TAHSIN MERT MUTLU",
			role: "Lead Developer",
			videoSrc: "/videos/quantum-finance.mp4",
		},
		{
			name: "TAHSIN MERT MUTLU",
			role: "Design Strategist",
			videoSrc: "/videos/card-architecture-holo.mp4",
		},
		{
			name: "TAHSIN MERT MUTLU",
			role: "Technical Architect",
			videoSrc: "/videos/card-engineering-mech.mp4",
		},
		{
			name: "TAHSIN MERT MUTLU",
			role: "UX Researcher",
			videoSrc: "/videos/neural-synergy.mp4",
		},
	];

	let sectionRef: HTMLElement;
	let hoverVideoRef: HTMLVideoElement | null = null;
	let hoverVideoContainer: HTMLElement | null = null;
	let currentHoverIndex: number | null = null;
	let mouseX = 0;
	let mouseY = 0;
	let isHovering = false;

	// Track mouse position globally
	function handleMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;

		if (hoverVideoContainer && isHovering) {
			updateVideoPosition();
		}
	}

	function updateVideoPosition() {
		if (!hoverVideoContainer) return;

		// Position video near cursor with offset
		const offsetX = 80;
		const offsetY = -100;

		// Keep video within viewport bounds
		const videoWidth = 300;
		const videoHeight = 400;
		let x = mouseX + offsetX;
		let y = mouseY + offsetY;

		// Adjust if video would go off-screen
		if (x + videoWidth > window.innerWidth) {
			x = mouseX - videoWidth - offsetX;
		}
		if (y + videoHeight > window.innerHeight) {
			y = mouseY - videoHeight - offsetY;
		}
		if (x < 0) x = 20;
		if (y < 0) y = 20;

		gsap.to(hoverVideoContainer, {
			x: x,
			y: y,
			duration: 0.3,
			ease: "power2.out",
		});
	}

	function handleMemberEnter(index: number, event: MouseEvent) {
		if (currentHoverIndex === index) return;

		currentHoverIndex = index;
		isHovering = true;
		const member = teamMembers[index];

		// Shift name to the right
		const nameElement = event.currentTarget as HTMLElement;
		const nameText = nameElement.querySelector(".member-name");
		if (nameText) {
			gsap.to(nameText, {
				x: 20,
				duration: 0.4,
				ease: "power2.out",
			});
		}

		// Create video element
		if (!hoverVideoContainer) {
			hoverVideoContainer = document.createElement("div");
			hoverVideoContainer.className = "hover-video-container";
			hoverVideoContainer.style.cssText = `
				position: fixed;
				width: 300px;
				height: 400px;
				pointer-events: none;
				z-index: 9999;
				opacity: 0;
				scale: 0.8;
				transform-origin: top left;
			`;
			document.body.appendChild(hoverVideoContainer);
		}

		// Remove existing video if any
		if (hoverVideoRef) {
			hoverVideoRef.remove();
		}

		// Create new video
		hoverVideoRef = document.createElement("video");
		hoverVideoRef.className = "hover-video";
		hoverVideoRef.src = member.videoSrc;
		hoverVideoRef.muted = true;
		hoverVideoRef.loop = true;
		hoverVideoRef.playsInline = true;
		hoverVideoRef.style.cssText = `
			width: 100%;
			height: 100%;
			object-fit: cover;
			filter: grayscale(100%) contrast(150%) brightness(110%);
		`;

		hoverVideoContainer.appendChild(hoverVideoRef);

		// Set initial position
		mouseX = event.clientX;
		mouseY = event.clientY;
		updateVideoPosition();

		// Load and play video
		hoverVideoRef.load();
		hoverVideoRef.addEventListener(
			"canplay",
			() => {
				hoverVideoRef?.play().catch(() => {
					// Handle autoplay restrictions
				});
			},
			{ once: true },
		);

		// Handle video errors gracefully
		hoverVideoRef.addEventListener(
			"error",
			() => {
				console.warn(`Failed to load video: ${member.videoSrc}`);
			},
			{ once: true },
		);

		// Reveal animation with glitch effect
		gsap.to(hoverVideoContainer, {
			opacity: 1,
			scale: 1,
			duration: 0.6,
			ease: "power2.out",
			onStart: () => {
				// Trigger glitch effect
				if (hoverVideoRef) {
					applyGlitchEffect(hoverVideoRef);
				}
			},
		});
	}

	function handleMemberLeave(index: number, event: MouseEvent) {
		if (currentHoverIndex !== index) return;

		isHovering = false;
		currentHoverIndex = null;

		// Reset name position
		const nameElement = event.currentTarget as HTMLElement;
		const nameText = nameElement.querySelector(".member-name");
		if (nameText) {
			gsap.to(nameText, {
				x: 0,
				duration: 0.4,
				ease: "power2.out",
			});
		}

		// TV turn-off animation (collapse to line)
		if (hoverVideoContainer && hoverVideoRef) {
			// Stop glitch effect
			if (hoverVideoRef) {
				removeGlitchEffect(hoverVideoRef);
			}

			// TV turn-off: collapse to horizontal line
			gsap.to(hoverVideoContainer, {
				scaleY: 0.005,
				scaleX: 1,
				opacity: 0,
				duration: 0.5,
				ease: "power2.in",
				onComplete: () => {
					if (hoverVideoRef) {
						hoverVideoRef.pause();
						hoverVideoRef.currentTime = 0;
						hoverVideoRef.remove();
						hoverVideoRef = null;
					}
					if (hoverVideoContainer) {
						hoverVideoContainer.remove();
						hoverVideoContainer = null;
					}
				},
			});
		}
	}

	function applyGlitchEffect(video: HTMLVideoElement) {
		// Add glitch class for CSS animations
		video.classList.add("glitch-active");

		// Random RGB split animation
		const glitchInterval = setInterval(() => {
			if (!video.classList.contains("glitch-active")) {
				clearInterval(glitchInterval);
				return;
			}

			const intensity = Math.random() * 3;
			video.style.filter = `
				grayscale(100%) 
				contrast(150%) 
				brightness(110%)
				drop-shadow(${intensity}px 0 0 rgba(255, 0, 0, 0.5))
				drop-shadow(${-intensity}px 0 0 rgba(0, 255, 255, 0.5))
			`;

			setTimeout(() => {
				if (video.classList.contains("glitch-active")) {
					video.style.filter =
						"grayscale(100%) contrast(150%) brightness(110%)";
				}
			}, 50);
		}, 200);

		// Store interval for cleanup
		(video as any).__glitchInterval = glitchInterval;
	}

	function removeGlitchEffect(video: HTMLVideoElement) {
		video.classList.remove("glitch-active");
		if ((video as any).__glitchInterval) {
			clearInterval((video as any).__glitchInterval);
		}
		video.style.filter = "grayscale(100%) contrast(150%) brightness(110%)";
	}

	onMount(() => {
		window.addEventListener("mousemove", handleMouseMove);
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("mousemove", handleMouseMove);
		}
		if (hoverVideoRef) {
			removeGlitchEffect(hoverVideoRef);
			hoverVideoRef.pause();
			hoverVideoRef.remove();
		}
		if (hoverVideoContainer) {
			hoverVideoContainer.remove();
		}
	});
</script>

<section
	bind:this={sectionRef}
	id="team"
	class="team-section relative min-h-screen w-full bg-black py-32 px-8 md:px-16 lg:px-24"
>
	<!-- Section Header -->
	<div class="mb-16 md:mb-24">
		<h2
			class="text-3xl md:text-4xl font-sans font-light tracking-widest text-white/40 uppercase mb-4"
			style="font-family: 'Inter', 'Helvetica Now', sans-serif; letter-spacing: 0.2em;"
		>
			Team
		</h2>
		<div class="h-px w-24 bg-white/20"></div>
	</div>

	<!-- Team List -->
	<div class="max-w-4xl space-y-6 md:space-y-8 lg:space-y-10">
		{#each teamMembers as member, index}
			<div
				class="team-member-item relative cursor-pointer group"
				on:mouseenter={(e) => handleMemberEnter(index, e)}
				on:mouseleave={(e) => handleMemberLeave(index, e)}
			>
				<div class="flex items-baseline gap-4">
					<!-- Role (small gray text) -->
					<span
						class="member-role text-sm md:text-base text-white/40 uppercase tracking-wider"
						style="font-family: 'Inter', sans-serif; letter-spacing: 0.15em; min-width: 200px;"
					>
						{member.role}
					</span>

					<!-- Separator -->
					<span class="text-white/20">—</span>

					<!-- Name (Large, White, Uppercase) -->
					<h3
						class="member-name text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sans font-bold uppercase leading-none tracking-tight text-white"
						style="font-family: 'Inter Tight', 'Inter', 'Helvetica Now', sans-serif; will-change: transform;"
					>
						{member.name}
					</h3>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.team-section {
		background-color: #000000;
	}

	.team-member-item {
		transition: all 0.3s ease;
	}

	.member-name {
		will-change: transform;
	}

	/* Glitch effect styles */
	.hover-video-container {
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow:
			0 0 40px rgba(0, 217, 255, 0.4),
			inset 0 0 30px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(2px);
	}

	.hover-video {
		position: relative;
		will-change: filter, transform;
	}

	/* Digital noise overlay effect */
	.hover-video::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: repeating-linear-gradient(
				0deg,
				rgba(0, 0, 0, 0.2),
				rgba(0, 0, 0, 0.2) 1px,
				transparent 1px,
				transparent 2px
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.03),
				rgba(255, 255, 255, 0.03) 1px,
				transparent 1px,
				transparent 2px
			);
		pointer-events: none;
		opacity: 0.4;
		mix-blend-mode: overlay;
		animation: noise 0.25s infinite;
		z-index: 1;
	}

	@keyframes noise {
		0%,
		100% {
			transform: translate(0, 0);
		}
		10% {
			transform: translate(-1px, -1px);
		}
		20% {
			transform: translate(1px, 1px);
		}
		30% {
			transform: translate(-1px, 1px);
		}
		40% {
			transform: translate(1px, -1px);
		}
		50% {
			transform: translate(-1px, 0);
		}
		60% {
			transform: translate(1px, 0);
		}
		70% {
			transform: translate(0, -1px);
		}
		80% {
			transform: translate(0, 1px);
		}
		90% {
			transform: translate(-1px, -1px);
		}
	}

	/* RGB Split glitch effect */
	.glitch-active {
		animation: rgb-split 0.15s infinite;
		position: relative;
	}

	@keyframes rgb-split {
		0%,
		100% {
			filter: grayscale(100%) contrast(150%) brightness(110%);
			transform: translateX(0);
		}
		10% {
			filter: grayscale(100%) contrast(150%) brightness(110%)
				drop-shadow(3px 0 0 rgba(255, 0, 0, 0.6));
			transform: translateX(1px);
		}
		20% {
			filter: grayscale(100%) contrast(150%) brightness(110%)
				drop-shadow(-3px 0 0 rgba(0, 255, 255, 0.6));
			transform: translateX(-1px);
		}
		30% {
			filter: grayscale(100%) contrast(150%) brightness(110%)
				drop-shadow(2px 0 0 rgba(255, 0, 0, 0.4))
				drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.4));
			transform: translateX(0.5px);
		}
		40% {
			filter: grayscale(100%) contrast(150%) brightness(110%);
			transform: translateX(0);
		}
		50% {
			filter: grayscale(100%) contrast(150%) brightness(110%)
				drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.5));
			transform: translateX(-0.5px);
		}
		60% {
			filter: grayscale(100%) contrast(150%) brightness(110%);
			transform: translateX(0);
		}
		70% {
			filter: grayscale(100%) contrast(150%) brightness(110%)
				drop-shadow(1px 0 0 rgba(255, 0, 0, 0.3))
				drop-shadow(-1px 0 0 rgba(0, 255, 255, 0.3));
			transform: translateX(0);
		}
		80%,
		90% {
			filter: grayscale(100%) contrast(150%) brightness(110%);
			transform: translateX(0);
		}
	}

	/* TV turn-off effect (scanline collapse) */
	.hover-video-container::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0%,
			rgba(0, 0, 0, 0.05) 1px,
			transparent 2px,
			transparent 4px
		);
		pointer-events: none;
		opacity: 0.2;
		z-index: 2;
	}
</style>
