<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Canvas, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import * as THREE from 'three';
	import { gsap } from 'gsap';
	import TunnelScene from './TunnelScene.svelte';
	import PostProcessing from './PostProcessing.svelte';

	// Project data
	const projects = [
		{
			id: 'neural-link',
			title: 'NEURAL_LINK',
			video: '/videos/hero-main-loop.mp4'
		},
		{
			id: 'cyber-dyn',
			title: 'CYBER_DYN',
			video: '/videos/card-engineering-mech.mp4'
		},
		{
			id: 'quantum-core',
			title: 'QUANTUM_CORE',
			video: '/videos/card-architecture-holo.mp4'
		},
		{
			id: 'synth-matrix',
			title: 'SYNTH_MATRIX',
			video: '/videos/about-future-interaction.mp4'
		},
		{
			id: 'void-engine',
			title: 'VOID_ENGINE',
			video: '/videos/card-software-flow.mp4'
		},
		{
			id: 'neural-link-2',
			title: 'NEURAL_LINK',
			video: '/videos/hero-main-loop.mp4'
		},
		{
			id: 'cyber-dyn-2',
			title: 'CYBER_DYN',
			video: '/videos/card-engineering-mech.mp4'
		}
	];

	let canvasContainer: HTMLDivElement;
	let openingSequenceVisible = true;
	let portfolioVisible = false;

	// Opening sequence state
	let openingProgress = { value: 0 };

	// Interaction state
	let isDragging = false;
	let dragStartY = 0; // Changed to Y for vertical scroll (forward/backward in tunnel)
	let cameraPosition = 5; // Legacy - kept for compatibility
	let targetCameraPosition = 5; // Legacy - kept for compatibility
	let hoveredIndex: number | null = null;
	let selectedIndex: number | null = null;
	let timeScale = 1.0;
	
	// Smooth fly-through scroll state
	let targetZ = 0; // Target Z position (starts at 0, scroll moves it negative)
	let mousePosition = { x: 0, y: 0 }; // Normalized mouse position for parallax (-1 to 1)

	// Opening sequence animation
	function startOpeningSequence() {
		const tl = gsap.timeline({
			onComplete: () => {
				openingSequenceVisible = false;
				portfolioVisible = true;
			}
		});

		// Initial burst
		tl.to(openingProgress, {
			value: 0.3,
			duration: 0.5,
			ease: 'power2.out'
		})
		// Fracture phase
		.to(openingProgress, {
			value: 0.7,
			duration: 0.8,
			ease: 'power1.inOut'
		})
		// Fade out
		.to(openingProgress, {
			value: 1.0,
			duration: 0.7,
			ease: 'power2.in'
		});
	}

	// Mouse interaction - vertical drag moves forward/backward through tunnel
	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		dragStartY = e.clientY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging && !selectedIndex && portfolioVisible) {
			const deltaY = e.clientY - dragStartY;
			const sensitivity = 0.01;
			// Moving mouse down (positive deltaY) moves camera forward (negative Z)
			// Moving mouse up (negative deltaY) moves camera backward (positive Z)
			targetCameraPosition -= deltaY * sensitivity;
			dragStartY = e.clientY;
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	// Touch support - vertical swipe moves forward/backward through tunnel
	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			isDragging = true;
			dragStartY = e.touches[0].clientY;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDragging && e.touches.length === 1 && !selectedIndex && portfolioVisible) {
			const deltaY = e.touches[0].clientY - dragStartY;
			const sensitivity = 0.01;
			// Swiping down (positive deltaY) moves camera forward (negative Z)
			// Swiping up (negative deltaY) moves camera backward (positive Z)
			targetCameraPosition -= deltaY * sensitivity;
			dragStartY = e.touches[0].clientY;
		}
	}

	function handleTouchEnd() {
		isDragging = false;
	}

	// Smooth fly-through scroll: Virtual scroll using wheel event
	function handleWheel(e: WheelEvent) {
		if (!selectedIndex && portfolioVisible) {
			e.preventDefault();
			
			// Calculate Z bounds based on project positions
			// Projects are at: index * -15, camera should move from 0 to past last project
			const minZ = 0;
			const maxZ = (projects.length - 1) * -15 - 10; // 10 units past last project
			const sensitivity = 0.05;
			
			// Update targetZ based on scroll
			// Scrolling down (positive deltaY) moves camera forward (negative Z)
			// Scrolling up (negative deltaY) moves camera backward (positive Z)
			targetZ -= e.deltaY * sensitivity;
			
			// Clamp targetZ to prevent scrolling past bounds
			targetZ = Math.max(maxZ, Math.min(minZ, targetZ));
		}
	}
	
	// Track mouse position for parallax effect (normalized -1 to 1)
	function handleMouseMoveParallax(e: MouseEvent) {
		if (!portfolioVisible || selectedIndex) return;
		
		// Normalize mouse position to -1 to 1 range
		mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
		mousePosition.y = -((e.clientY / window.innerHeight) * 2 - 1); // Invert Y for natural feel
	}

	// Handle pointer enter on monolith
	function handleMonolithEnter(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		hoveredIndex = index;
		timeScale = 0.3; // Slow down time
	}

	// Handle pointer leave on monolith
	function handleMonolithLeave(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		hoveredIndex = null;
		timeScale = 1.0;
	}

	// Handle click on monolith
	function handleMonolithClick(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		selectedIndex = index;
	}

	onMount(() => {
		if (!browser || !canvasContainer) return;

		canvasContainer.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousemove', handleMouseMoveParallax);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('wheel', handleWheel, { passive: false });
		canvasContainer.addEventListener('touchstart', handleTouchStart);
		canvasContainer.addEventListener('touchmove', handleTouchMove);
		canvasContainer.addEventListener('touchend', handleTouchEnd);
		
		// Start opening sequence
		setTimeout(() => {
			startOpeningSequence();
		}, 100);
		
		return () => {
			if (canvasContainer) {
				canvasContainer.removeEventListener('mousedown', handleMouseDown);
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mousemove', handleMouseMoveParallax);
				window.removeEventListener('mouseup', handleMouseUp);
				window.removeEventListener('wheel', handleWheel);
				canvasContainer.removeEventListener('touchstart', handleTouchStart);
				canvasContainer.removeEventListener('touchmove', handleTouchMove);
				canvasContainer.removeEventListener('touchend', handleTouchEnd);
			}
		};
	});
</script>

{#if browser}
	<div bind:this={canvasContainer} class="digital-archive-container">
		<Canvas>
			{@const _ = interactivity()}
			
			<!-- Post-processing: Bloom effect for glowing digital displays -->
			<PostProcessing />
			
			<!-- All 3D logic is now in TunnelScene component (inside Canvas context) -->
			<TunnelScene
				{projects}
				{openingSequenceVisible}
				{portfolioVisible}
				{openingProgress}
				{timeScale}
				{isDragging}
				{hoveredIndex}
				{selectedIndex}
				{cameraPosition}
				{targetCameraPosition}
				{targetZ}
				{mousePosition}
			/>
		</Canvas>
		
		<!-- Project Title Overlay (Brutalist Typography) -->
		{#if hoveredIndex !== null && !selectedIndex && portfolioVisible}
			<div class="project-title-overlay">
				<div class="project-title">
					{projects[hoveredIndex]?.title}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.digital-archive-container {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		background: #000000;
		cursor: grab;
		overflow: hidden;
	}
	
	.digital-archive-container:active {
		cursor: grabbing;
	}
	
	.digital-archive-container :global(canvas) {
		display: block;
	}
	
	.project-title-overlay {
		position: fixed;
		inset: 0;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.project-title {
		font-family: 'Courier New', monospace;
		font-size: 12vw;
		font-weight: 900;
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-shadow: 
			0 0 20px rgba(255, 255, 255, 0.5),
			0 0 40px rgba(255, 255, 255, 0.3);
		mix-blend-mode: screen;
		opacity: 0.9;
		transform: scale(1.1);
	}
	
	@media (max-width: 768px) {
		.project-title {
			font-size: 8vw;
		}
	}
</style>
