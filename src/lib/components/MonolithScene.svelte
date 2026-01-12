<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import * as THREE from 'three';
	import MonolithFrameUpdater from './MonolithFrameUpdater.svelte';

	let canvasRef: HTMLDivElement;
	let videoContainerRef: HTMLDivElement;
	let groupRef: THREE.Group;
	let time = { value: 0 };

	// Video paths - matching files in static/videos/
	const videos = [
		'/videos/neural-synergy.mp4',
		'/videos/aero-dynamics.mp4',
		'/videos/quantum-finance.mp4'
	];

	// Monolith configuration
	const monolithPositions: [number, number, number][] = [
		[-4, 0, 0],   // Left
		[0, 0, -0.5], // Center (slightly back)
		[4, 0, 0]     // Right
	];

	const monolithRotations: [number, number, number][] = [
		[0, 0, 0],
		[0, 0.08, 0], // Slight rotation
		[0, 0, 0]
	];

	// Refs for videos, textures, materials, and meshes
	let videoElements: HTMLVideoElement[] = [];
	let videoTextures: (THREE.VideoTexture | null)[] = [null, null, null];
	let materialRefs: THREE.ShaderMaterial[] = [];
	let meshRefs: THREE.Mesh[] = [];

	// Shader with scanline and RGB shift effect
	const vertexShader = `
		uniform float uTime;
		varying vec2 vUv;
		varying vec3 vPosition;
		
		void main() {
			vUv = uv;
			vPosition = position;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const fragmentShader = `
		uniform sampler2D uVideoTexture;
		uniform float uTime;
		uniform float uScanlineIntensity;
		uniform float uRGBShift;
		uniform float uEmissive;
		
		varying vec2 vUv;
		varying vec3 vPosition;
		
		void main() {
			vec2 uv = vUv;
			
			// RGB Shift effect (subtle chromatic aberration)
			float shift = uRGBShift * 0.003;
			float r = texture2D(uVideoTexture, uv + vec2(shift, 0.0)).r;
			float g = texture2D(uVideoTexture, uv).g;
			float b = texture2D(uVideoTexture, uv - vec2(shift, 0.0)).b;
			
			vec3 color = vec3(r, g, b);
			
			// Scanline effect (subtle horizontal lines)
			float scanline = sin(uv.y * 600.0 + uTime * 2.0) * 0.5 + 0.5;
			scanline = pow(scanline, 10.0) * uScanlineIntensity;
			color = mix(color, color * (1.0 - scanline * 0.2), 0.08);
			
			// Subtle vignette
			float vignette = 1.0 - distance(uv, vec2(0.5)) * 1.4;
			vignette = smoothstep(0.0, 1.0, vignette);
			color *= vignette;
			
			// Emissive glow (for dark scenes)
			color += color * uEmissive * 0.3;
			
			gl_FragColor = vec4(color, 1.0);
		}
	`;

	// Initialize videos and textures
	function initializeVideos() {
		if (!browser || !videoContainerRef) return;
		
		videos.forEach((videoSrc, index) => {
			const video = document.createElement('video');
			video.src = videoSrc;
			video.crossOrigin = 'anonymous';
			video.loop = true;
			video.muted = true;
			video.playsInline = true;
			video.autoplay = true;
			video.style.display = 'none';
			
			// Add to hidden container (required for some browsers)
			videoContainerRef.appendChild(video);
			
			const texture = new THREE.VideoTexture(video);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.format = THREE.RGBAFormat;
			
			videoElements[index] = video;
			videoTextures[index] = texture;
			
			// Update texture when video is loaded
			video.addEventListener('loadeddata', () => {
				texture.needsUpdate = true;
				// Update material uniform if it exists
				if (materialRefs[index]) {
					materialRefs[index].uniforms.uVideoTexture.value = texture;
					materialRefs[index].needsUpdate = true;
				}
			});
			
			// Play video
			video.play().catch((err) => {
				console.warn(`Video ${index} autoplay prevented:`, err);
			});
		});
	}

	onMount(() => {
		initializeVideos();
		
		return () => {
			// Cleanup will be handled in onDestroy
		};
	});

	onDestroy(() => {
		// Dispose video textures
		videoTextures.forEach((texture) => {
			if (texture) {
				texture.dispose();
			}
		});
		
		// Clean up video elements
		videoElements.forEach((video) => {
			if (video) {
				video.pause();
				video.src = '';
				if (video.parentNode === videoContainerRef) {
					videoContainerRef.removeChild(video);
				}
			}
		});
		
		// Dispose materials
		materialRefs.forEach((material) => {
			if (material) {
				material.dispose();
			}
		});
	});
</script>

{#if browser}
	<!-- Hidden container for video elements -->
	<div bind:this={videoContainerRef} style="display: none;"></div>

	<div bind:this={canvasRef} class="monolith-scene-container">
		<Canvas>
			<T.PerspectiveCamera
				makeDefault
				position={[0, 0, 8]}
				fov={50}
			/>
			
			<T.Group bind:ref={groupRef}>
				{#each videos as videoSrc, index}
					<T.Mesh
						bind:ref={meshRefs[index]}
						position={monolithPositions[index]}
						rotation={monolithRotations[index]}
						scale={1}
					>
						<T.BoxGeometry args={[2, 3, 0.1]} />
						{#if videoTextures[index]}
							<T.ShaderMaterial
								bind:ref={materialRefs[index]}
								vertexShader={vertexShader}
								fragmentShader={fragmentShader}
								uniforms={{
									uVideoTexture: { value: videoTextures[index] },
									uTime: { value: 0 },
									uScanlineIntensity: { value: 0.12 },
									uRGBShift: { value: 1.2 },
									uEmissive: { value: 0.4 }
								}}
							/>
						{:else}
							<!-- Fallback wireframe material while loading -->
							<T.MeshBasicMaterial
								color="#333333"
								wireframe={true}
								transparent={true}
								opacity={0.4}
							/>
						{/if}
					</T.Mesh>
				{/each}
			</T.Group>
			
			<!-- Ambient light for subtle glow -->
			<T.AmbientLight intensity={0.15} />
			
			<!-- Directional light for depth -->
			<T.DirectionalLight position={[5, 5, 5]} intensity={0.25} />
			
			<!-- Frame updater component (must be inside Canvas for useFrame) -->
			<MonolithFrameUpdater
				{time}
				{videoTextures}
				{materialRefs}
				{groupRef}
			/>
		</Canvas>
	</div>
{/if}

<style>
	.monolith-scene-container {
		width: 100%;
		height: 100vh;
		position: relative;
		background: #000000;
	}
	
	.monolith-scene-container :global(canvas) {
		display: block;
	}
</style>
