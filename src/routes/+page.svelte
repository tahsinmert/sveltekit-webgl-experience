<script>
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import Lenis from "lenis";

	// Accept SvelteKit props
	export let params = {};
	export let data = {};
	import Hero from "$lib/components/Hero.svelte";
	import HorizontalStickyScroll from "$lib/components/HorizontalStickyScroll.svelte";
	import ServicesSection from "$lib/components/ServicesSection.svelte";
	import MarqueeSection from "$lib/components/MarqueeSection.svelte";
	import SelectedWorks from "$lib/components/SelectedWorks.svelte";
	import TheManifesto from "$lib/components/TheManifesto.svelte";
	import TheBlueprint from "$lib/components/TheBlueprint.svelte";
	import TeamSection from "$lib/components/TeamSection.svelte";
	import PremiumContactFooter from "$lib/components/PremiumContactFooter.svelte";
	import Cursor from "$lib/components/Cursor.svelte";
	import LiquidPortalOrb from "$lib/components/LiquidPortalOrb.svelte";
	import AIConcierge from "$lib/components/AIConcierge.svelte";
	import MonolithScene from "$lib/components/MonolithScene.svelte";
	import ParticleGlobe from "$lib/components/ParticleGlobe.svelte";
	import DigitalArchiveTunnel from "$lib/components/DigitalArchiveTunnel.svelte";
	import CyberLock from "$lib/components/CyberLock.svelte";
	import { siteConfig } from "$lib/config.js";

	let lenis;

	const { hero, features, meta } = siteConfig;

	onMount(() => {
		if (!browser) return;

		// Initialize Lenis smooth scroll
		lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			direction: "vertical",
			gestureDirection: "vertical",
			smooth: true,
			mouseMultiplier: 1,
			smoothTouch: false,
			touchMultiplier: 2,
			infinite: false,
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			if (lenis) {
				lenis.destroy();
			}
		};
	});
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords} />
</svelte:head>

<Cursor />

<main class="bg-zinc-50">
	<Hero
		headline={hero.headline}
		subtitle={hero.subtitle}
		videoSrc={hero.videoSrc}
		ctaText={hero.ctaText}
		ctaHref="#work"
	/>

	<!-- Features Section (Horizontal Sticky Scroll) -->
	<HorizontalStickyScroll items={features.items} />

	<!-- Services Section (Bento Grid with Spotlight) -->
	<ServicesSection />

	<!-- Selected Works Section (Hover Reveal Gallery) -->
	<SelectedWorks
		projects={[
			{ name: "NEURAL_LINK" },
			{ name: "CYBER_DYN" },
			{ name: "QUANTUM_CORE" },
			{ name: "SYNTH_MATRIX" },
			{ name: "VOID_ENGINE" },
		]}
	/>

	<!-- Cyber Lock Game Section -->
	<CyberLock />

	<!-- The Manifesto Section (Kinetic Typography) -->
	<TheManifesto />

	<!-- The Blueprint Section (Interactive Process) -->
	<TheBlueprint />

	<!-- Team Section (Holographic Reveal) -->
	<TeamSection />

	<!-- Marquee Section (Velocity-based Infinite Scroll) -->
	<MarqueeSection
		text="CREATIVITY — INNOVATION — PERFORMANCE — EXCELLENCE — VISION"
	/>

	<!-- Premium Contact/Footer Section -->
	<PremiumContactFooter />
</main>

<!-- Liquid Portal Orb - Bottom Right Corner -->
<LiquidPortalOrb
	text="EXPLORE"
	onClick={() => {
		console.log("Portal orb clicked!");
		// Add your click handler logic here
	}}
/>

<!-- AI Concierge Overlay -->
<AIConcierge />

<style>
	:global(main) {
		position: relative;
		z-index: 1;
	}

	:global(body) {
		background-color: #fafafa;
	}
</style>
