<script lang="ts">
	import { onMount } from "svelte";
	import { gsap } from "gsap";

	let containerRef: HTMLElement;
	let textRef: HTMLElement;

	// Config
	const DEVELOPER_NAME = "TAHSIN MERT MUTLU";
	const ROLE_TEXT = "HANDCRAFTED BY";
	let isHovering = false;
	let time = 0;

	// Animation
	let animationFrame: number;

	function handleMouseEnter() {
		isHovering = true;
		animateText(DEVELOPER_NAME);

		// Expand pill
		gsap.to(containerRef, {
			width: "auto",
			paddingRight: "1.5rem",
			duration: 0.4,
			ease: "power3.out",
		});
	}

	function handleMouseLeave() {
		isHovering = false;
		animateText(ROLE_TEXT);

		// Contract pill
		gsap.to(containerRef, {
			paddingRight: "0.75rem",
			duration: 0.4,
			ease: "power3.out",
			onComplete: () => {
				// Reset width if needed or let auto handle it
			},
		});
	}

	function animateText(targetString: string) {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
		let iterations = 0;

		const interval = setInterval(() => {
			if (!textRef) {
				clearInterval(interval);
				return;
			}

			textRef.innerText = targetString
				.split("")
				.map((letter, index) => {
					if (index < iterations) {
						return targetString[index];
					}
					return chars[Math.floor(Math.random() * chars.length)];
				})
				.join("");

			if (iterations >= targetString.length) {
				clearInterval(interval);
			}

			iterations += 1 / 2; // Speed of scramble
		}, 30);
	}

	onMount(() => {
		// Initial set
		if (textRef) textRef.innerText = ROLE_TEXT;

		// Subtle floating animation
		gsap.to(containerRef, {
			y: -5,
			duration: 2,
			repeat: -1,
			yoyo: true,
			ease: "sine.inOut",
		});
	});
</script>

<a
	href="https://linkedin.com/in/tahsinmertmutlu"
	target="_blank"
	rel="noopener noreferrer"
	bind:this={containerRef}
	class="fixed bottom-6 right-6 z-[9000] flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 cursor-pointer group transition-colors hover:border-cyan-400/50 hover:bg-black/90 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
>
	<!-- Avatar / Icon -->
	<div
		class="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-cyan-400 transition-colors"
	>
		<div
			class="absolute inset-0 bg-gradient-to-tr from-cyan-900 to-purple-900 opacity-60"
		></div>
		<div
			class="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white font-bold group-hover:text-cyan-400"
		>
			TM
		</div>
	</div>

	<!-- Text -->
	<span
		bind:this={textRef}
		class="font-mono text-[10px] md:text-xs text-zinc-400 tracking-widest whitespace-nowrap group-hover:text-white transition-colors"
	>
		{ROLE_TEXT}
	</span>

	<!-- Status Dot -->
	<div
		class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"
	></div>
</a>
