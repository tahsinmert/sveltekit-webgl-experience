<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	const manifestoText = 'WE ENGINEER DIGITAL REALITIES. NO FLUFF. JUST CODE & CHAOS.';
	const words = manifestoText.split(' ');
	const keywords = ['ENGINEER', 'DIGITAL', 'REALITIES', 'CODE', 'CHAOS'];

	let sectionRef: HTMLElement;
	let textContainerRef: HTMLElement;
	let lineRefs: HTMLElement[] = [];
	let wordRefs: HTMLElement[] = [];
	let scrollTriggerInstances: ScrollTrigger[] = [];

	// Split text into lines for justified layout
	const wordsPerLine = Math.ceil(words.length / 3);
	const lines: string[][] = [];
	for (let i = 0; i < words.length; i += wordsPerLine) {
		lines.push(words.slice(i, i + wordsPerLine));
	}

	onMount(() => {
		if (!sectionRef || !textContainerRef) return;

		setTimeout(() => {
			// Set initial state
			gsap.set(lineRefs, {
				x: (i) => (i % 2 === 0 ? -100 : 100),
				opacity: 0
			});

			// Parallax scroll animation
			lineRefs.forEach((line, index) => {
				if (!line) return;
				const direction = index % 2 === 0 ? 1 : -1;
				const speed = 0.5 + (index % 3) * 0.2;

				const instance = ScrollTrigger.create({
					trigger: sectionRef,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 1,
					onUpdate: (self) => {
						const progress = self.progress;
						const offset = (progress - 0.5) * 300 * direction * speed;
						
						gsap.set(line, {
							x: offset,
							opacity: Math.min(1, progress * 2)
						});
					}
				});
				scrollTriggerInstances.push(instance);
			});

			// Keyword highlight on scroll
			wordRefs.forEach((wordRef, index) => {
				if (!wordRef) return;
				const word = words[index];
				if (keywords.includes(word)) {
					const instance = ScrollTrigger.create({
						trigger: wordRef,
						start: 'top center',
						end: 'bottom center',
						scrub: 1,
						onEnter: () => {
							gsap.to(wordRef, {
								color: '#00ff88',
								textShadow: '0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.5)',
								duration: 0.5,
								ease: 'power2.out'
							});
						},
						onLeave: () => {
							gsap.to(wordRef, {
								color: '#ffffff',
								textShadow: 'none',
								duration: 0.5,
								ease: 'power2.out'
							});
						},
						onEnterBack: () => {
							gsap.to(wordRef, {
								color: '#00ff88',
								textShadow: '0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.5)',
								duration: 0.5,
								ease: 'power2.out'
							});
						},
						onLeaveBack: () => {
							gsap.to(wordRef, {
								color: '#ffffff',
								textShadow: 'none',
								duration: 0.5,
								ease: 'power2.out'
							});
						}
					});
					scrollTriggerInstances.push(instance);
				}
			});
		}, 100);

		return () => {
			scrollTriggerInstances.forEach((instance) => {
				instance.kill();
			});
			scrollTriggerInstances = [];
			ScrollTrigger.getAll().forEach((trigger) => {
				if (trigger.vars && trigger.vars.trigger === sectionRef) {
					trigger.kill();
				}
			});
		};
	});

</script>

<section
	bind:this={sectionRef}
	class="the-manifesto-section relative min-h-screen w-full bg-void flex items-center justify-center py-32 px-4 md:px-8 overflow-hidden"
>
	<div
		bind:this={textContainerRef}
		class="relative z-10 w-full max-w-7xl mx-auto"
	>
		{#each lines as line, lineIndex}
			<div
				bind:this={lineRefs[lineIndex]}
				class="manifesto-line flex flex-wrap justify-between items-center mb-8 md:mb-12 last:mb-0"
				style="text-align: justify;"
			>
				{#each line as word, wordIndex}
					{@const globalWordIndex = lineIndex * Math.ceil(words.length / 3) + wordIndex}
					<span
						bind:this={wordRefs[globalWordIndex]}
						class="manifesto-word inline-block text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-signal leading-tight tracking-tight mr-4 md:mr-6 transition-colors duration-500"
					>
						{word}
					</span>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Background gradient -->
	<div class="absolute inset-0 bg-gradient-to-b from-void via-void-200 to-void opacity-50 pointer-events-none"></div>

	<!-- Decorative elements -->
	<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-electric/30 to-transparent"></div>
	<div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-electric/30 to-transparent"></div>
</section>

<style>
	.manifesto-line {
		position: relative;
		will-change: transform, opacity;
	}

	.manifesto-word {
		position: relative;
		display: inline-block;
	}
</style>
