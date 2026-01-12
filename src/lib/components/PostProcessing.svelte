<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { useThrelte } from '@threlte/core';
	import { useFrame } from '@threlte/core';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import * as THREE from 'three';

	const { renderer, scene, camera, invalidate } = useThrelte();
	let composer: EffectComposer | null = null;
	let renderPass: RenderPass | null = null;
	let bloomPass: UnrealBloomPass | null = null;

	onMount(() => {
		if (!renderer || !scene || !camera) return;

		// Disable auto-rendering so we can use the composer
		renderer.autoClear = true;

		// Create effect composer
		composer = new EffectComposer(renderer);

		// Create render pass
		renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		// Create bloom pass with tuned parameters for "Awwwards" look
		// Parameters: resolution, strength, radius, threshold
		bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			1.5, // intensity (strong glow)
			0.3, // radius (smooth falloff) 
			0.6  // threshold (only bright parts glow - luminanceThreshold)
		);
		composer.addPass(bloomPass);

		// Handle window resize
		function handleResize() {
			if (composer && bloomPass && renderer) {
				composer.setSize(window.innerWidth, window.innerHeight);
				bloomPass.setSize(window.innerWidth, window.innerHeight);
			}
		}

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (composer) {
				composer.dispose();
			}
		};
	});

	// Use frame to render with composer instead of default renderer
	useFrame(() => {
		if (composer) {
			composer.render();
		}
	}, { order: 1000, invalidate: false }); // High order, don't invalidate (we're handling rendering)
</script>
