<script lang="ts">
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { siteConfig } from "$lib/config.js";
	import { gsap } from "gsap";
	import { fly } from "svelte/transition";

	let navbarRef: HTMLElement;
	let navContainerRef: HTMLElement;
	let activeIndicatorRef: HTMLElement;
	let linkRefs: (HTMLElement | null)[] = [];
	let mobileMenuOpen = false;
	let lastScrollY = 0;
	let isVisible = true;
	let activeLinkIndex = 0;
	let scrollDirection = "up";

	const { siteName, navLinks, ctaButton } = siteConfig;

	// Smart scroll behavior
	onMount(() => {
		let ticking = false;

		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					const currentScrollY = window.scrollY;

					// Determine scroll direction
					if (currentScrollY > lastScrollY && currentScrollY > 100) {
						// Scrolling down - hide navbar
						if (isVisible) {
							isVisible = false;
							gsap.to(navbarRef, {
								y: -100,
								opacity: 0,
								duration: 0.3,
								ease: "power2.out",
							});
						}
					} else if (currentScrollY < lastScrollY) {
						// Scrolling up - show navbar
						if (!isVisible) {
							isVisible = true;
							gsap.to(navbarRef, {
								y: 0,
								opacity: 1,
								duration: 0.4,
								ease: "power2.out",
							});
						}
					}

					lastScrollY = currentScrollY;
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		// Initialize magnetic effects for nav links after DOM is ready
		tick().then(() => {
			initMagneticEffects();
			// Initialize active indicator
			updateActiveIndicator(0);
		});

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});

	// Magnetic effect for navigation links
	function initMagneticEffects() {
		linkRefs.forEach((linkRef, index) => {
			if (!linkRef) return;

			const link = linkRef;
			const linkText = link.querySelector("span");

			link.addEventListener("mouseenter", () => {
				gsap.to(linkText, {
					scale: 1.05,
					duration: 0.3,
					ease: "power2.out",
				});
			});

			link.addEventListener("mouseleave", () => {
				gsap.to(linkText, {
					scale: 1,
					duration: 0.3,
					ease: "power2.out",
				});
			});

			link.addEventListener("mousemove", (e: MouseEvent) => {
				const rect = link.getBoundingClientRect();
				const x = e.clientX - rect.left - rect.width / 2;
				const y = e.clientY - rect.top - rect.height / 2;

				// Magnetic pull effect
				gsap.to(linkText, {
					x: x * 0.15,
					y: y * 0.15,
					duration: 0.3,
					ease: "power2.out",
				});
			});

			link.addEventListener("mouseleave", () => {
				gsap.to(linkText, {
					x: 0,
					y: 0,
					scale: 1,
					duration: 0.4,
					ease: "elastic.out(1, 0.5)",
				});
			});
		});
	}

	// Update active indicator position
	function updateActiveIndicator(index: number) {
		if (!activeIndicatorRef || !linkRefs[index]) return;

		const activeLink = linkRefs[index];
		const container = navContainerRef;

		if (activeLink && container) {
			const linkRect = activeLink.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();

			const left = linkRect.left - containerRect.left;
			const width = linkRect.width;

			gsap.to(activeIndicatorRef, {
				left: left,
				width: width,
				duration: 0.5,
				ease: "power2.out",
			});
		}
	}

	/**
	 * @param {string} href
	 * @param {number} index
	 */
	const handleLinkClick = (href: string, index: number) => {
		mobileMenuOpen = false;
		if (index >= 0) {
			activeLinkIndex = index;
			updateActiveIndicator(index);
		}

		// Handle anchor links with smooth scroll
		if (href.startsWith("#")) {
			const targetId = href.slice(1);
			const targetElement = document.getElementById(targetId);
			if (targetElement) {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		} else {
			// Navigate to route using SvelteKit's goto
			goto(href);
		}
	};

	const toggleMobileMenu = () => {
		mobileMenuOpen = !mobileMenuOpen;

		if (mobileMenuOpen) {
			// Animate menu items in with stagger
			gsap.from(".mobile-menu-item", {
				opacity: 0,
				y: 20,
				duration: 0.4,
				stagger: 0.1,
				ease: "power2.out",
				delay: 0.1,
			});
		}
	};

	const closeMobileMenu = () => {
		mobileMenuOpen = false;
	};

	// Prevent body scroll when mobile menu is open
	$: {
		if (typeof document !== "undefined") {
			if (mobileMenuOpen) {
				document.body.classList.add("menu-open");
			} else {
				document.body.classList.remove("menu-open");
			}
		}
	}

	// Update active indicator on hover
	function handleLinkHover(index: number) {
		updateActiveIndicator(index);
	}

	function handleLinkLeave() {
		updateActiveIndicator(activeLinkIndex);
	}
</script>

<!-- Floating Capsule Navbar -->
<nav
	bind:this={navbarRef}
	class="fixed top-6 left-1/2 -translate-x-1/2 z-[9000] transition-all duration-300"
	aria-label="Main navigation"
>
	<!-- Glassmorphism Capsule Container -->
	<div
		bind:this={navContainerRef}
		class="relative flex items-center gap-6 px-6 py-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
		style="backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
	>
		<!-- Logo (Left) -->
		<button
			on:click={() => handleLinkClick("/", -1)}
			class="text-white font-bold text-sm md:text-base tracking-widest hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
			aria-label="Home"
		>
			{siteName}
		</button>

		<!-- Desktop Navigation Links (Center) -->
		<div class="hidden md:flex items-center gap-1 relative">
			<!-- Active Indicator (Glowing Dot) -->
			<div
				bind:this={activeIndicatorRef}
				class="absolute bottom-0 h-0.5 bg-gradient-to-r from-electric via-electric-400 to-electric rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,217,255,0.5)]"
				style="will-change: left, width;"
			></div>

			{#each navLinks as link, index}
				<a
					bind:this={linkRefs[index]}
					href={link.href}
					on:click|preventDefault={() =>
						handleLinkClick(link.href, index)}
					on:mouseenter={() => handleLinkHover(index)}
					on:mouseleave={handleLinkLeave}
					class="relative px-4 py-2 text-white/90 text-sm font-medium transition-colors duration-300 cursor-pointer group"
					role="button"
					tabindex="0"
				>
					<span class="relative z-10 inline-block">{link.name}</span>
					<!-- Hover glow effect -->
					<div
						class="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					></div>
				</a>
			{/each}
		</div>

		<!-- Desktop CTA Button (Right) -->
		<div class="hidden md:flex items-center">
			<button
				on:click={() => handleLinkClick(ctaButton.href, -1)}
				class="relative w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] group"
				aria-label={ctaButton.text}
			>
				<!-- Arrow Icon -->
				<svg
					class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					></path>
				</svg>
			</button>
		</div>

		<!-- Mobile Menu Button -->
		<div class="md:hidden flex items-center">
			<button
				on:click={toggleMobileMenu}
				class="text-white p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
				aria-label="Menu"
				aria-expanded={mobileMenuOpen}
			>
				<div class="relative w-6 h-6">
					<span
						class="absolute top-0 left-0 w-full h-0.5 bg-white transition-all duration-300 {mobileMenuOpen
							? 'rotate-45 top-2.5'
							: ''}"
					></span>
					<span
						class="absolute top-2.5 left-0 w-full h-0.5 bg-white transition-all duration-300 {mobileMenuOpen
							? 'opacity-0'
							: ''}"
					></span>
					<span
						class="absolute top-5 left-0 w-full h-0.5 bg-white transition-all duration-300 {mobileMenuOpen
							? '-rotate-45 top-2.5'
							: ''}"
					></span>
				</div>
			</button>
		</div>
	</div>
</nav>

<!-- Mobile Full-Screen Menu Overlay -->
{#if mobileMenuOpen}
	<div
		class="fixed inset-0 bg-black/95 backdrop-blur-2xl z-40 md:hidden"
		role="dialog"
		aria-modal="true"
		aria-label="Mobile menu"
		on:click={closeMobileMenu}
		on:keydown={(e) => {
			if (e.key === "Escape") closeMobileMenu();
		}}
		transition:fly={{ y: -100, duration: 300 }}
		tabindex="-1"
	>
		<div
			class="flex flex-col items-center justify-center h-full space-y-12 px-4"
			role="menu"
			on:click|stopPropagation
			tabindex="0"
		>
			{#each navLinks as link, index}
				<a
					href={link.href}
					on:click|preventDefault={() =>
						handleLinkClick(link.href, index)}
					class="mobile-menu-item text-white text-4xl font-light hover:text-electric transition-colors duration-300 relative group"
				>
					<span class="relative z-10">{link.name}</span>
					<!-- Underline effect -->
					<span
						class="absolute bottom-0 left-0 w-0 h-0.5 bg-electric transition-all duration-500 group-hover:w-full"
					></span>
				</a>
			{/each}

			<button
				on:click={() => handleLinkClick(ctaButton.href, -1)}
				class="mobile-menu-item mt-8 px-12 py-4 bg-white text-black font-semibold rounded-full hover:bg-electric hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(0,217,255,0.5)]"
			>
				{ctaButton.text}
			</button>
		</div>
	</div>
{/if}

<style>
	/* Prevent body scroll when mobile menu is open */
	:global(body.menu-open) {
		overflow: hidden;
	}

	/* Smooth transitions for navbar visibility */
	nav {
		will-change: transform, opacity;
	}

	/* Ensure backdrop blur works on all browsers */
	.backdrop-blur-xl {
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.backdrop-blur-2xl {
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
	}
</style>
