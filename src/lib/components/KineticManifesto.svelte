<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { overlayOpen, orbPosition } from '$lib/stores/overlayStore.js';
	import { gsap } from 'gsap';
	import { Canvas, T, useFrame } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import * as THREE from 'three';

	let overlayRef: HTMLDivElement;
	let rippleRef: HTMLDivElement;
	let closeButtonRef: HTMLButtonElement;
	let canvasContainerRef: HTMLDivElement;
	let sceneRef: THREE.Scene;
	let cameraRef: THREE.PerspectiveCamera;
	let rendererRef: THREE.WebGLRenderer;
	let textMeshRef: any;
	let materialRef: THREE.ShaderMaterial;
	let rafId: number | null = null;
	let checkTextMeshInterval: number | null = null;
	let mousePosition = { x: 0, y: 0 };
	let normalizedMouse = { x: 0.5, y: 0.5 };
	let time = 0;
	let isVisible = false;

	// Vertex shader for text distortion
	const vertexShader = `
		uniform float uTime;
		uniform vec2 uMouse;
		uniform vec2 uResolution;
		
		varying vec2 vUv;
		varying vec3 vPosition;
		varying vec3 vWorldPosition;
		
		void main() {
			vUv = uv;
			vPosition = position;
			
			// Transform to world space for distortion calculations
			vec4 worldPos = modelMatrix * vec4(position, 1.0);
			vWorldPosition = worldPos.xyz;
			
			// Base position
			vec3 pos = position;
			
			// Convert mouse to world space approximation (text is centered at origin, ~4 units wide)
			vec2 mouseWorld = (uMouse - vec2(0.5)) * 4.0; // Scale to approximate world space
			vec2 pos2D = vec2(pos.x, pos.y);
			vec2 toMouse = mouseWorld - pos2D;
			float dist = length(toMouse);
			
			// Liquid distortion effect - stronger near mouse
			float distortion = smoothstep(2.0, 0.0, dist) * 0.2;
			vec2 distortionDir = dist > 0.001 ? normalize(toMouse) : vec2(0.0);
			
			// Add wave-like distortion for liquid effect
			float waveX = sin(pos.x * 2.0 + uTime * 2.0) * 0.05;
			float waveY = sin(pos.y * 2.0 + uTime * 1.5) * 0.05;
			
			// Apply distortion in XY plane (text plane)
			pos.xy += distortionDir * distortion + vec2(waveX, waveY);
			
			// Add slight Z displacement for depth
			float depth = smoothstep(1.5, 0.0, dist) * 0.15;
			pos.z += depth;
			
			gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		}
	`;

	// Fragment shader for liquid text effect
	const fragmentShader = `
		uniform float uTime;
		uniform vec2 uMouse;
		uniform vec2 uResolution;
		
		varying vec2 vUv;
		varying vec3 vPosition;
		
		// Simplex noise for additional texture
		vec3 mod289(vec3 x) {
			return x - floor(x * (1.0 / 289.0)) * 289.0;
		}
		
		vec4 mod289(vec4 x) {
			return x - floor(x * (1.0 / 289.0)) * 289.0;
		}
		
		vec4 permute(vec4 x) {
			return mod289(((x*34.0)+1.0)*x);
		}
		
		vec4 taylorInvSqrt(vec4 r) {
			return 1.79284291400159 - 0.85373472095314 * r;
		}
		
		float snoise(vec3 v) {
			const vec2 C = vec2(1.0/6.0, 1.0/3.0);
			const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
			
			vec3 i = floor(v + dot(v, C.yyy));
			vec3 x0 = v - i + dot(i, C.xxx);
			
			vec3 g = step(x0.yzx, x0.xyz);
			vec3 l = 1.0 - g;
			vec3 i1 = min(g.xyz, l.zxy);
			vec3 i2 = max(g.xyz, l.zxy);
			
			vec3 x1 = x0 - i1 + C.xxx;
			vec3 x2 = x0 - i2 + C.yyy;
			vec3 x3 = x0 - D.yyy;
			
			i = mod289(i);
			vec4 p = permute(permute(permute(
				i.z + vec4(0.0, i1.z, i2.z, 1.0))
				+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
				+ i.x + vec4(0.0, i1.x, i2.x, 1.0));
			
			float n_ = 0.142857142857;
			vec3 ns = n_ * D.wyz - D.xzx;
			
			vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
			
			vec4 x_ = floor(j * ns.z);
			vec4 y_ = floor(j - 7.0 * x_);
			
			vec4 x = x_ *ns.x + ns.yyyy;
			vec4 y = y_ *ns.x + ns.yyyy;
			vec4 h = 1.0 - abs(x) - abs(y);
			
			vec4 b0 = vec4(x.xy, y.xy);
			vec4 b1 = vec4(x.zw, y.zw);
			
			vec4 s0 = floor(b0)*2.0 + 1.0;
			vec4 s1 = floor(b1)*2.0 + 1.0;
			vec4 sh = -step(h, vec4(0.0));
			
			vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
			vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
			
			vec3 p0 = vec3(a0.xy, h.x);
			vec3 p1 = vec3(a0.zw, h.y);
			vec3 p2 = vec3(a1.xy, h.z);
			vec3 p3 = vec3(a1.zw, h.w);
			
			vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
			p0 *= norm.x;
			p1 *= norm.y;
			p2 *= norm.z;
			p3 *= norm.w;
			
			vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
			m = m * m;
			return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
		}
		
		void main() {
			// Base white color
			vec3 color = vec3(1.0);
			
			// Add subtle noise for texture
			float noise = snoise(vec3(vUv * 10.0, uTime * 0.5)) * 0.05;
			color += noise;
			
			// Mouse-based highlight effect
			vec2 mouse = (uMouse - vec2(0.5)) * 2.0;
			vec2 toMouse = mouse - vec2(vUv.x - 0.5, vUv.y - 0.5);
			float dist = length(toMouse);
			float highlight = smoothstep(0.3, 0.0, dist) * 0.2;
			color += highlight;
			
			// Edge glow
			float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
			float edgeGlow = smoothstep(0.1, 0.0, edge) * 0.1;
			color += edgeGlow;
			
			gl_FragColor = vec4(color, 1.0);
		}
	`;

	onMount(() => {
		// Subscribe to overlay state
		const unsubscribe = overlayOpen.subscribe((open) => {
			if (open) {
				openOverlay();
			} else {
				closeOverlay();
			}
		});

		// Mouse tracking for text distortion
		const handleMouseMove = (e: MouseEvent) => {
			if (!overlayRef || !isVisible) return;
			
			mousePosition.x = e.clientX;
			mousePosition.y = e.clientY;
			
			const rect = overlayRef.getBoundingClientRect();
			normalizedMouse.x = (e.clientX - rect.left) / rect.width;
			normalizedMouse.y = 1 - (e.clientY - rect.top) / rect.height; // Flip Y for WebGL
			
			if (materialRef) {
				materialRef.uniforms.uMouse.value = [normalizedMouse.x, normalizedMouse.y];
			}
			
			// Parallax effect - move text in 3D space
			if (textMeshRef && textMeshRef.mesh && cameraRef) {
				const parallaxX = (normalizedMouse.x - 0.5) * 0.3;
				const parallaxY = (normalizedMouse.y - 0.5) * 0.3;
				
				gsap.to(textMeshRef.mesh.position, {
					x: parallaxX,
					y: parallaxY,
					duration: 1.5,
					ease: 'power2.out'
				});
			}
		};

		window.addEventListener('mousemove', handleMouseMove);

		// Apply shader material to text after it's created
		const applyShaderMaterial = () => {
			if (textMeshRef && textMeshRef.mesh && !materialRef) {
				materialRef = new THREE.ShaderMaterial({
					vertexShader: vertexShader,
					fragmentShader: fragmentShader,
					uniforms: {
						uTime: { value: 0 },
						uMouse: { value: [0.5, 0.5] },
						uResolution: { value: [window.innerWidth, window.innerHeight] }
					}
				});
				textMeshRef.mesh.material = materialRef;
			}
		};

		// Check periodically for text mesh
		checkTextMeshInterval = setInterval(() => {
			applyShaderMaterial();
			if (materialRef) {
				if (checkTextMeshInterval) clearInterval(checkTextMeshInterval);
			}
		}, 100) as unknown as number;

		// Animation loop
		const animate = () => {
			if (!isVisible) {
				rafId = requestAnimationFrame(animate);
				return;
			}
			
			// Try to apply shader material if not already applied
			applyShaderMaterial();
			
			time += 0.016;
			
			if (materialRef) {
				materialRef.uniforms.uTime.value = time;
				materialRef.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
			}
			
			rafId = requestAnimationFrame(animate);
		};
		
		animate();

		return () => {
			unsubscribe();
			window.removeEventListener('mousemove', handleMouseMove);
			if (rafId !== null) cancelAnimationFrame(rafId);
			if (checkTextMeshInterval !== null) clearInterval(checkTextMeshInterval);
		};
	});

	function openOverlay() {
		if (!overlayRef || !rippleRef) return;
		
		// Get orb position from store
		let orbPos = { x: 0, y: 0, width: 0, height: 0 };
		const unsubscribe = orbPosition.subscribe((pos) => {
			orbPos = pos;
		});
		unsubscribe();
		
		// Calculate center point of orb
		const centerX = orbPos.x + orbPos.width / 2;
		const centerY = orbPos.y + orbPos.height / 2;
		
		// Calculate distance to farthest corner for full coverage
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxDist = Math.max(
			Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)),
			Math.sqrt(Math.pow(viewportWidth - centerX, 2) + Math.pow(centerY, 2)),
			Math.sqrt(Math.pow(centerX, 2) + Math.pow(viewportHeight - centerY, 2)),
			Math.sqrt(Math.pow(viewportWidth - centerX, 2) + Math.pow(viewportHeight - centerY, 2))
		);
		
		// Set initial state
		gsap.set(overlayRef, { opacity: 0, display: 'block' });
		gsap.set(rippleRef, {
			x: centerX,
			y: centerY,
			width: 0,
			height: 0,
			xPercent: -50,
			yPercent: -50,
			opacity: 1
		});
		
		// Expand ripple
		gsap.to(rippleRef, {
			width: maxDist * 2,
			height: maxDist * 2,
			duration: 0.8,
			ease: 'power2.inOut',
			onComplete: () => {
				isVisible = true;
				// Fade in content
				gsap.to(overlayRef, {
					opacity: 1,
					duration: 0.3
				});
			}
		});
	}

	function closeOverlay() {
		if (!overlayRef || !rippleRef) return;
		
		isVisible = false;
		
		// Get orb position
		let orbPos = { x: 0, y: 0, width: 0, height: 0 };
		const unsubscribe = orbPosition.subscribe((pos) => {
			orbPos = pos;
		});
		unsubscribe();
		
		const centerX = orbPos.x + orbPos.width / 2;
		const centerY = orbPos.y + orbPos.height / 2;
		
		// Fade out content
		gsap.to(overlayRef, {
			opacity: 0,
			duration: 0.2,
			onComplete: () => {
				// Shrink ripple back to orb
				gsap.set(rippleRef, {
					x: centerX,
					y: centerY,
					xPercent: -50,
					yPercent: -50
				});
				
				gsap.to(rippleRef, {
					width: 0,
					height: 0,
					duration: 0.8,
					ease: 'power2.inOut',
					onComplete: () => {
						gsap.set(overlayRef, { display: 'none' });
					}
				});
			}
		});
	}

	function handleClose() {
		overlayOpen.set(false);
	}

	// Handle ESC key
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isVisible) {
			handleClose();
		}
	}

	// Handle Canvas creation
	function handleCanvasCreated(event: any) {
		const { scene, camera, renderer } = event.detail;
		sceneRef = scene;
		cameraRef = camera;
		rendererRef = renderer;
		
		// Set camera
		camera.position.set(0, 0, 5);
		camera.lookAt(0, 0, 0);
		
		// Set background to transparent
		renderer.setClearColor(0x000000, 0);
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if $overlayOpen}
	<div
		bind:this={overlayRef}
		class="kinetic-manifesto-overlay"
		style="display: none; opacity: 0;"
	>
		<!-- Ripple transition layer -->
		<div
			bind:this={rippleRef}
			class="ripple-transition"
		></div>

		<!-- Content -->
		<div class="overlay-content">
			<!-- Close Button -->
			<button
				bind:this={closeButtonRef}
				on:click={handleClose}
				class="close-button"
				aria-label="Close"
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<!-- Kinetic Text -->
			<div bind:this={canvasContainerRef} class="text-container">
				<div class="text-canvas">
					<Canvas
						on:created={handleCanvasCreated}
					>
						<T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
						
						<Text
							bind:ref={textMeshRef}
							text="WE CRAFT DIGITAL EMOTIONS."
							fontSize={1.2}
							color="#ffffff"
							anchorX="center"
							anchorY="middle"
							position={[0, 0, 0]}
						/>
						
						<T.AmbientLight intensity={1.0} />
					</Canvas>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.kinetic-manifesto-overlay {
		position: fixed;
		inset: 0;
		background: #000000;
		z-index: 9999;
		overflow: hidden;
	}

	.ripple-transition {
		position: absolute;
		border-radius: 50%;
		background: #000000;
		pointer-events: none;
		z-index: 10000;
	}

	.overlay-content {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10001;
	}

	.close-button {
		position: absolute;
		top: 2rem;
		right: 2rem;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10002;
	}

	.close-button:hover {
		border-color: rgba(255, 255, 255, 1);
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.1);
	}

	.text-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text-canvas {
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.close-button {
			top: 1.5rem;
			right: 1.5rem;
			width: 50px;
			height: 50px;
		}
	}
</style>
