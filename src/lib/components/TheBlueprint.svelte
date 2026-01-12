<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	const steps = [
		{ id: 'discovery', title: 'DISCOVERY', subtitle: 'THE GEAR', number: '01' },
		{ id: 'prototype', title: 'PROTOTYPE', subtitle: 'THE ENGINE', number: '02' },
		{ id: 'deploy', title: 'DEPLOY', subtitle: 'THE IGNITION', number: '03' }
	];

	let sectionRef: HTMLElement;
	let trackRef: HTMLElement;
	let svgRefs: SVGElement[] = [];
	let measurementRefs: HTMLElement[] = [];
	let scrollTriggerInstance: ScrollTrigger | null = null;

	let totalWidth = 0;
	let currentStep = 0;
	let measurementValues = [0, 0, 0];

	onMount(() => {
		if (!sectionRef || !trackRef) return;

		setTimeout(() => {
			totalWidth = trackRef.scrollWidth - window.innerWidth;
			
			// Initialize SVG paths (invisible initially)
			svgRefs.forEach((svg) => {
				if (svg) {
					const drawPathGroup = svg.querySelector('.draw-path') as SVGGElement;
					if (drawPathGroup) {
						const paths = Array.from(drawPathGroup.children) as SVGElement[];
						paths.forEach((pathElement) => {
							let length = 0;
							if (pathElement instanceof SVGPathElement) {
								length = pathElement.getTotalLength();
							} else if (pathElement instanceof SVGCircleElement) {
								const r = pathElement.r.baseVal.value;
								length = 2 * Math.PI * r;
							} else if (pathElement instanceof SVGRectElement) {
								const w = pathElement.width.baseVal.value;
								const h = pathElement.height.baseVal.value;
								length = (w + h) * 2;
							} else if (pathElement instanceof SVGPolygonElement) {
								const points = pathElement.points;
								let total = 0;
								for (let i = 0; i < points.numberOfItems; i++) {
									const p1 = points.getItem(i);
									const p2 = points.getItem((i + 1) % points.numberOfItems);
									total += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
								}
								length = total;
							}
							if (length > 0) {
								pathElement.style.strokeDasharray = `${length}`;
								pathElement.style.strokeDashoffset = `${length}`;
							}
						});
					}
				}
			});

			// Create horizontal scroll animation
			const horizontalScroll = gsap.to(trackRef, {
				x: -totalWidth,
				ease: 'none',
				scrollTrigger: {
					trigger: sectionRef,
					start: 'top top',
					end: () => `+=${totalWidth}`,
					pin: true,
					scrub: 1,
					anticipatePin: 1,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						const progress = self.progress;
						const stepProgress = progress * steps.length;
						currentStep = Math.floor(stepProgress);
						
						// Animate SVG drawing for each step
						steps.forEach((step, index) => {
							const stepStart = index / steps.length;
							const stepEnd = (index + 1) / steps.length;
							
							if (progress >= stepStart && progress <= stepEnd) {
								const localProgress = (progress - stepStart) / (stepEnd - stepStart);
								animateSVGStep(index, localProgress);
							} else if (progress > stepEnd) {
								animateSVGStep(index, 1);
							}
						});

						// Animate measurement counters
						steps.forEach((step, index) => {
							const stepStart = index / steps.length;
							const stepEnd = (index + 1) / steps.length;
							
							if (progress >= stepStart && progress <= stepEnd) {
								const localProgress = (progress - stepStart) / (stepEnd - stepStart);
								const targetValue = Math.floor(localProgress * 100);
								measurementValues[index] = targetValue;
								
								if (measurementRefs[index]) {
									measurementRefs[index].textContent = targetValue.toString().padStart(3, '0');
								}
							} else if (progress > stepEnd) {
								measurementValues[index] = 100;
								if (measurementRefs[index]) {
									measurementRefs[index].textContent = '100';
								}
							}
						});
					}
				}
			});

			scrollTriggerInstance = horizontalScroll.scrollTrigger || null;
		}, 100);

		return () => {
			if (scrollTriggerInstance) {
				scrollTriggerInstance.kill();
			}
			ScrollTrigger.getAll().forEach((trigger) => {
				if (trigger.vars.trigger === sectionRef) {
					trigger.kill();
				}
			});
		};
	});

	function animateSVGStep(stepIndex: number, progress: number) {
		if (!svgRefs[stepIndex]) return;

		const drawPathGroup = svgRefs[stepIndex].querySelector('.draw-path') as SVGGElement;
		if (!drawPathGroup) return;

		// Get all path elements within the group (circles, paths, polygons, rects)
		const paths = Array.from(drawPathGroup.children) as SVGElement[];
		
		paths.forEach((path, pathIndex) => {
			const pathElement = path as SVGPathElement | SVGCircleElement | SVGRectElement | SVGPolygonElement;
			let length = 0;
			
			// Calculate path length based on element type
			if (pathElement instanceof SVGPathElement) {
				length = pathElement.getTotalLength();
			} else if (pathElement instanceof SVGCircleElement) {
				const r = pathElement.r.baseVal.value;
				length = 2 * Math.PI * r;
			} else if (pathElement instanceof SVGRectElement) {
				const w = pathElement.width.baseVal.value;
				const h = pathElement.height.baseVal.value;
				length = (w + h) * 2;
			} else if (pathElement instanceof SVGPolygonElement) {
				// Approximate length for polygons
				const points = pathElement.points;
				let total = 0;
				for (let i = 0; i < points.numberOfItems; i++) {
					const p1 = points.getItem(i);
					const p2 = points.getItem((i + 1) % points.numberOfItems);
					total += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
				}
				length = total;
			}

			if (length > 0) {
				// Apply stroke-dasharray and stroke-dashoffset for drawing animation
				pathElement.style.strokeDasharray = `${length}`;
				
				const totalPaths = paths.length;
				const pathProgress = Math.max(0, Math.min(1, (progress * totalPaths - pathIndex) * totalPaths));
				const drawLength = length * pathProgress;
				pathElement.style.strokeDashoffset = `${length - drawLength}`;
			}
		});
	}

	// SVG patterns for each step
	const svgPatterns = [
		// Discovery - Gear pattern
		`<g class="draw-path" stroke="currentColor" stroke-width="2" fill="none">
			<circle cx="400" cy="300" r="80"/>
			<circle cx="400" cy="300" r="120"/>
			<circle cx="400" cy="300" r="20"/>
			<path d="M 320 300 L 480 300 M 400 220 L 400 380 M 346 246 L 454 354 M 454 246 L 346 354"/>
			<path d="M 360 200 A 40 40 0 0 1 440 200 M 440 400 A 40 40 0 0 1 360 400"/>
		</g>`,
		// Prototype - Engine pattern
		`<g class="draw-path" stroke="currentColor" stroke-width="2" fill="none">
			<rect x="300" y="200" width="200" height="200" rx="20"/>
			<circle cx="350" cy="250" r="30"/>
			<circle cx="450" cy="250" r="30"/>
			<circle cx="400" cy="350" r="30"/>
			<path d="M 350 250 L 450 250 M 400 250 L 400 350 M 350 280 L 450 280"/>
			<path d="M 300 220 L 280 220 M 500 220 L 520 220 M 300 380 L 280 380 M 500 380 L 520 380"/>
		</g>`,
		// Deploy - Ignition pattern
		`<g class="draw-path" stroke="currentColor" stroke-width="2" fill="none">
			<polygon points="400,150 450,250 500,200 450,300 350,300 300,200 350,250"/>
			<circle cx="400" cy="250" r="40"/>
			<path d="M 360 250 L 380 250 M 420 250 L 440 250 M 400 230 L 400 210 M 400 270 L 400 290"/>
			<path d="M 400 150 L 400 120 M 400 300 L 400 380 M 350 250 L 280 250 M 450 250 L 520 250"/>
		</g>`
	];
</script>

<section
	bind:this={sectionRef}
	class="the-blueprint-section relative min-h-screen w-full bg-void overflow-hidden"
>
	<!-- Progress Indicator -->
	<div class="fixed top-0 left-0 w-full h-1 bg-void-300 z-50">
		<div
			class="h-full bg-electric transition-all duration-300"
			style="width: {(currentStep / steps.length) * 100}%"
		></div>
	</div>

	<!-- Horizontal Scroll Track -->
	<div
		bind:this={trackRef}
		class="relative flex items-center h-screen"
		style="width: ${steps.length * 100}vw;"
	>
		{#each steps as step, index}
			<div
				class="blueprint-step relative flex items-center justify-center h-full"
				style="width: 100vw; min-width: 100vw;"
			>
				<div class="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<!-- Left: SVG Wireframe -->
						<div class="relative">
							<svg
								bind:this={svgRefs[index]}
								class="w-full h-auto max-h-[600px] text-electric"
								viewBox="0 0 800 600"
								xmlns="http://www.w3.org/2000/svg"
							>
								<!-- Grid background -->
								<defs>
									<pattern id="grid-{index}" width="40" height="40" patternUnits="userSpaceOnUse">
										<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
									</pattern>
								</defs>
								<rect width="100%" height="100%" fill="url(#grid-{index})" class="text-void-300"/>

								<!-- Measurement lines -->
								<g stroke="currentColor" stroke-width="1" opacity="0.4" class="text-electric/50">
									<line x1="100" y1="50" x2="100" y2="550"/>
									<line x1="50" y1="100" x2="750" y2="100"/>
									<line x1="700" y1="50" x2="700" y2="550"/>
									<line x1="50" y1="500" x2="750" y2="500"/>
								</g>

								<!-- Measurement numbers -->
								<g fill="currentColor" font-family="monospace" font-size="16" opacity="0.6" class="text-electric">
									<text x="105" y="70">0</text>
									<text x="105" y="300">300</text>
									<text x="105" y="520">600</text>
									<text x="70" y="105">0</text>
									<text x="400" y="105">400</text>
									<text x="720" y="105">800</text>
								</g>

								<!-- Main wireframe (dynamically generated) -->
								{@html svgPatterns[index] || ''}
							</svg>
						</div>

						<!-- Right: Text Content -->
						<div class="relative z-10">
							<div class="mb-8">
								<span
									bind:this={measurementRefs[index]}
									class="text-6xl md:text-8xl font-mono font-bold text-electric tabular-nums"
								>
									000
								</span>
							</div>

							<h3 class="text-5xl md:text-7xl font-mono font-black text-signal mb-4 tracking-tighter">
								{step.title}
							</h3>

							<p class="text-2xl md:text-3xl font-mono text-electric/80 mb-8 tracking-wide">
								{step.subtitle}
							</p>

							<div class="text-signal/60 font-mono text-lg tracking-wider">
								STEP_{step.number}
							</div>
						</div>
					</div>
				</div>

				<!-- Step Number Indicator -->
				<div class="absolute top-8 right-8 md:top-16 md:right-16">
					<div class="text-signal/20 font-mono text-9xl font-black leading-none">
						{step.number}
					</div>
				</div>

				<!-- Background grid -->
				<div class="absolute inset-0 opacity-5 pointer-events-none">
					<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern id="bg-grid-{index}" width="100" height="100" patternUnits="userSpaceOnUse">
								<path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-width="1" class="text-signal"/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#bg-grid-{index})" />
					</svg>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.blueprint-step {
		position: relative;
	}

	.draw-path {
		transition: stroke-dashoffset 0.1s linear;
	}
</style>
