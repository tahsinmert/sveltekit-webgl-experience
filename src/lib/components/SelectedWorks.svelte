<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import MonolithScene from './MonolithScene.svelte';

	export let projects: Array<{
		name: string;
		imageUrl?: string;
	}> = [
		{ name: 'NEURAL_LINK' },
		{ name: 'CYBER_DYN' },
		{ name: 'QUANTUM_CORE' },
		{ name: 'SYNTH_MATRIX' },
		{ name: 'VOID_ENGINE' }
	];

	let sectionRef: HTMLElement;
	let containerRef: HTMLElement;
	let hoverImageRef: HTMLElement;
	let projectRefs: HTMLElement[] = [];
	
	let currentHoverIndex = -1;
	let mouseX = 0;
	let mouseY = 0;
	let imageX = 0;
	let imageY = 0;
	let animationFrame: number | null = null;

	onMount(() => {
		// Track mouse movement for image following
		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		window.addEventListener('mousemove', handleMouseMove);

		// Animation loop for smooth image following
		const animate = () => {
			if (hoverImageRef && currentHoverIndex >= 0) {
				// Smooth interpolation for cursor following
				imageX += (mouseX - imageX) * 0.15;
				imageY += (mouseY - imageY) * 0.15;
				
				gsap.set(hoverImageRef, {
					x: imageX - window.innerWidth / 2,
					y: imageY - window.innerHeight / 2,
					force3D: true
				});
			}
			animationFrame = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	function handleProjectEnter(index: number, event: MouseEvent) {
		currentHoverIndex = index;
		imageX = event.clientX;
		imageY = event.clientY;

		if (hoverImageRef) {
			gsap.set(hoverImageRef, {
				opacity: 1,
				scale: 1,
				rotation: 0,
				x: imageX - window.innerWidth / 2,
				y: imageY - window.innerHeight / 2,
				display: 'block'
			});
		}

		// Animate text
		if (projectRefs[index]) {
			gsap.to(projectRefs[index], {
				opacity: 0.3,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}

	function handleProjectLeave(index: number) {
		currentHoverIndex = -1;

		if (hoverImageRef) {
			gsap.to(hoverImageRef, {
				opacity: 0,
				scale: 0.8,
				rotation: 5,
				duration: 0.4,
				ease: 'power2.out',
				onComplete: () => {
					if (hoverImageRef) {
						gsap.set(hoverImageRef, { display: 'none' });
					}
				}
			});
		}

		// Restore text
		if (projectRefs[index]) {
			gsap.to(projectRefs[index], {
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}
</script>

<section
	bind:this={sectionRef}
	class="selected-works-section relative min-h-screen w-full bg-void overflow-hidden"
>
	<!-- 3D Monolith Scene with Video Textures -->
	<MonolithScene />
</section>

<style>
	.project-item {
		transition: all 0.3s ease;
	}

	@keyframes scan {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100%);
		}
	}

	.animate-scan {
		animation: scan 3s linear infinite;
	}

	.hover-image {
		filter: drop-shadow(0 20px 60px rgba(0, 217, 255, 0.4));
	}
</style>
