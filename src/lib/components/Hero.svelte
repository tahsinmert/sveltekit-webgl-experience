<script>
	import { onMount, onDestroy } from "svelte";
	import { gsap } from "gsap";

	export let headline = "Crafting Digital Experiences";
	export let subtitle =
		"We transform ideas into exceptional digital experiences that drive growth and innovation.";
	export let videoSrc = "/videos/hero-main-loop.mp4";
	export let ctaText = "Get Started";
	export let ctaHref = "#work";

	let videoRef;
	let headlineRef;
	let subtitleRef;
	let buttonRef;
	let buttonContainerRef;
	let videoContainerRef;
	let heroSectionRef;

	let mouseX = 0;
	let mouseY = 0;
	let buttonX = 0;
	let buttonY = 0;
	let magneticRadius = 100; // Distance in pixels to activate magnetic effect
	let animationFrame;
	let preloaderComplete = false;

	onMount(() => {
		// Initially hide all text elements
		if (headlineRef) gsap.set(headlineRef, { opacity: 0, y: 30 });
		if (subtitleRef) gsap.set(subtitleRef, { opacity: 0, y: 20 });
		if (buttonContainerRef)
			gsap.set(buttonContainerRef, { opacity: 0, y: 20 });
		if (videoContainerRef)
			gsap.set(videoContainerRef, { opacity: 0, scale: 0.95 });

		// Listen for preloader completion
		const handlePreloaderComplete = () => {
			preloaderComplete = true;
			animateHeroEntrance();
		};

		window.addEventListener(
			"boot-sequence-complete",
			handlePreloaderComplete,
		);

		// Check if preloader already completed (for development/hot reload or if missed event)
		if (document.querySelector(".boot-sequence-preloader") === null) {
			preloaderComplete = true;
			animateHeroEntrance();
		}

		// Ensure video plays on mount (but keep it hidden until preloader completes)
		if (videoRef) {
			videoRef.play().catch((err) => {
				console.log("Video autoplay prevented:", err);
			});
		}

		// Track mouse movement for parallax and magnetic effects
		const handleMouseMove = (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;

			// Parallax text effect
			if (headlineRef) {
				const rect = heroSectionRef.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;

				const deltaX = (mouseX - centerX) * 0.02; // Parallax intensity
				const deltaY = (mouseY - centerY) * 0.02;

				gsap.to(headlineRef, {
					x: deltaX,
					y: deltaY,
					duration: 1.5,
					ease: "power2.out",
				});
			}

			// Magnetic button effect
			if (buttonRef) {
				const buttonRect = buttonRef.getBoundingClientRect();
				const buttonCenterX = buttonRect.left + buttonRect.width / 2;
				const buttonCenterY = buttonRect.top + buttonRect.height / 2;

				const distance = Math.sqrt(
					Math.pow(mouseX - buttonCenterX, 2) +
						Math.pow(mouseY - buttonCenterY, 2),
				);

				if (distance < magneticRadius) {
					// Calculate magnetic pull
					const pullStrength =
						(magneticRadius - distance) / magneticRadius;
					const pullX = (mouseX - buttonCenterX) * pullStrength * 0.3;
					const pullY = (mouseY - buttonCenterY) * pullStrength * 0.3;

					gsap.to(buttonRef, {
						x: pullX,
						y: pullY,
						duration: 0.3,
						ease: "power2.out",
					});
				} else {
					// Snap back to original position
					gsap.to(buttonRef, {
						x: 0,
						y: 0,
						duration: 0.5,
						ease: "elastic.out(1, 0.5)",
					});
				}
			}
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener(
				"preloader-complete",
				handlePreloaderComplete,
			);
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	const animateHeroEntrance = () => {
		const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

		// Animate headline
		if (headlineRef) {
			tl.to(headlineRef, {
				opacity: 1,
				y: 0,
				duration: 1,
				ease: "power3.out",
			});
		}

		// Animate subtitle
		if (subtitleRef) {
			tl.to(
				subtitleRef,
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: "power3.out",
				},
				"-=0.5",
			);
		}

		// Animate button
		if (buttonContainerRef) {
			tl.to(
				buttonContainerRef,
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: "power3.out",
				},
				"-=0.4",
			);
		}

		// Animate video container
		if (videoContainerRef) {
			tl.to(
				videoContainerRef,
				{
					opacity: 1,
					scale: 1,
					duration: 1.2,
					ease: "power3.out",
				},
				"-=0.6",
			);
		}
	};

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});

	const handleCTAClick = () => {
		if (typeof document === "undefined") return;
		const target = document.querySelector(ctaHref);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	import { goto } from "$app/navigation";

	const openArchive = () => {
		goto("/archive");
	};
</script>

<section
	bind:this={heroSectionRef}
	id="hero"
	class="relative min-h-screen w-full flex flex-col items-center justify-center bg-white pt-32 md:pt-40 pb-24 md:pb-32 px-4 overflow-hidden"
>
	<!-- Subtle animated background gradient -->
	<div
		class="absolute inset-0 opacity-30 pointer-events-none"
		style="background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
	>
		<div
			class="absolute inset-0"
			style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)"
		></div>
	</div>

	<!-- Main Content -->
	<div class="relative z-10 text-center max-w-5xl mx-auto">
		<!-- Parallax Headline -->
		<h1
			bind:this={headlineRef}
			class="text-7xl md:text-8xl lg:text-9xl font-display font-bold mb-8 text-zinc-900 leading-[1.1] tracking-tight"
			style="will-change: transform;"
		>
			{headline}
		</h1>

		<!-- Subtitle -->
		<p
			bind:this={subtitleRef}
			class="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto font-light tracking-wide mb-16 leading-relaxed"
		>
			{subtitle}
		</p>

		<!-- Magnetic CTA Button -->
		<div bind:this={buttonContainerRef} class="flex justify-center gap-6">
			<button
				bind:this={buttonRef}
				data-hover
				on:click={handleCTAClick}
				class="relative px-10 py-5 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800 transition-colors duration-300 shadow-lg hover:shadow-xl text-lg tracking-wide"
				style="will-change: transform;"
			>
				{ctaText}
			</button>

			<button
				on:click={openArchive}
				class="relative px-10 py-5 border-2 border-zinc-900 text-zinc-900 font-semibold rounded-full hover:bg-zinc-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl text-lg tracking-wide group"
			>
				ENTER ARCHIVE
				<div
					class="absolute inset-0 rounded-full bg-zinc-900 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10 origin-center"
				></div>
			</button>
		</div>
	</div>

	<!-- Video Container (Below Text) -->
	<div
		bind:this={videoContainerRef}
		class="relative z-10 w-full max-w-6xl mx-auto mt-20 md:mt-24"
	>
		<div
			class="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-zinc-100"
		>
			<video
				bind:this={videoRef}
				autoplay
				loop
				muted
				playsinline
				class="w-full h-full object-cover"
			>
				<source src={videoSrc} type="video/mp4" />
			</video>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-float"
	>
		<div
			class="w-6 h-10 border-2 border-zinc-300 rounded-full flex items-start justify-center p-2"
		>
			<div class="w-1 h-3 bg-zinc-400 rounded-full animate-pulse"></div>
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	/* Ensure smooth rendering */
	:global(#hero) {
		transform: translateZ(0);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
