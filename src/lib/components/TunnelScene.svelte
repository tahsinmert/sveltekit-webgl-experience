<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { T, useFrame } from '@threlte/core';
	import { gsap } from 'gsap';
	import * as THREE from 'three';
	const { MathUtils } = THREE;

	// Props
	export let projects: Array<{ id: string; title: string; video: string }>;
	export let openingSequenceVisible: boolean;
	export let portfolioVisible: boolean;
	export let openingProgress: { value: number };
	export let timeScale: number;
	export let isDragging: boolean;
	export let hoveredIndex: number | null;
	export let selectedIndex: number | null;
	export let cameraPosition: number;
	export let targetCameraPosition: number;
	export let targetZ: number = 0; // Target Z position from scroll
	export let mousePosition: { x: number; y: number } = { x: 0, y: 0 }; // For parallax

	// Refs
	let tunnelGroupRef: THREE.Group;
	let tunnelMaterialRef: THREE.ShaderMaterial;
	let portfolioGroupRef: THREE.Group;
	let cameraRef: THREE.PerspectiveCamera;

	// Monolith refs
	let monolithMeshes: THREE.Mesh[] = [];
	let monolithMaterials: THREE.ShaderMaterial[] = [];
	let monolithVideos: HTMLVideoElement[] = [];
	let monolithTextures: THREE.VideoTexture[] = [];
	let texturesReady = false;

	// Time tracking
	let time = 0;
	let openingTime = 0;

	// Smooth fly-through scroll state
	// Start currentZ at camera's initial position (5), will lerp to targetZ (0) on load
	let currentZ = 5;
	const lerpFactor = 0.05; // Heaviness of the movement (lower = heavier/slower)
	const parallaxStrength = 0.3; // How much mouse affects camera position

	// Opening sequence shaders
	const tunnelVertexShader = `
		uniform float uTime;
		uniform float uProgress;
		
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying float vDistance;
		
		void main() {
			vPosition = position;
			vNormal = normal;
			vDistance = length(position);
			
			vec3 pos = position;
			
			// Fracture effect - break geometry into shards
			float fracture = sin(pos.x * 10.0 + uTime * 2.0) * cos(pos.y * 10.0 + uTime * 1.5);
			fracture += sin(pos.z * 8.0 + uTime * 3.0) * 0.5;
			
			// Explosive expansion
			float expansion = uProgress * 50.0;
			pos *= (1.0 + expansion);
			
			// Add chaotic motion
			pos.x += fracture * 0.1 * uProgress;
			pos.y += fracture * 0.15 * uProgress;
			pos.z += (uTime * 20.0) * uProgress; // Forward movement
			
			// Wireframe distortion
			pos.xyz += normal * sin(uTime * 5.0 + vDistance * 2.0) * 0.05 * uProgress;
			
			gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		}
	`;

	const tunnelFragmentShader = `
		uniform float uTime;
		uniform float uProgress;
		
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying float vDistance;
		
		void main() {
			// Intense white glow
			vec3 color = vec3(1.0, 1.0, 1.0);
			
			// Distance-based intensity (brighter in center)
			float intensity = 1.0 / (1.0 + vDistance * 0.1);
			intensity = pow(intensity, 2.0);
			
			// Pulsing effect
			float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
			intensity *= pulse;
			
			// Edge glow for wireframe look
			float edgeFactor = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
			edgeFactor = pow(edgeFactor, 3.0);
			
			color *= (intensity + edgeFactor * 0.5);
			
			// Fade out as progress increases
			float alpha = (1.0 - uProgress) * 0.8 + 0.2;
			
			gl_FragColor = vec4(color, alpha);
		}
	`;

	// Video distortion shader
	const videoVertexShader = `
		uniform float uTime;
		uniform float uHover;
		uniform float uDistortion;
		
		varying vec2 vUv;
		
		void main() {
			vUv = uv;
			
			vec3 pos = position;
			
			// Subtle wave distortion on hover
			if (uHover > 0.0) {
				pos.z += sin(uv.x * 10.0 + uTime * 2.0) * uHover * 0.02;
				pos.y += cos(uv.y * 8.0 + uTime * 1.5) * uHover * 0.02;
			}
			
			gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		}
	`;

	const videoFragmentShader = `
		uniform sampler2D uVideoTexture;
		uniform float uTime;
		uniform float uHover;
		uniform float uDistortion;
		uniform float uOpacity;
		
		varying vec2 vUv;
		
		void main() {
			vec2 uv = vUv;
			
			// Glitch effect on hover
			if (uHover > 0.0) {
				// RGB shift
				vec2 offset = vec2(sin(uTime * 20.0) * uHover * 0.01, 0.0);
				float r = texture2D(uVideoTexture, uv + offset).r;
				float g = texture2D(uVideoTexture, uv).g;
				float b = texture2D(uVideoTexture, uv - offset).b;
				
				// Scanline effect
				float scanline = sin(uv.y * 800.0 + uTime * 10.0) * uHover * 0.1 + 1.0;
				
				// Digital noise
				float noise = fract(sin(dot(uv + uTime, vec2(12.9898, 78.233))) * 43758.5453);
				noise = mix(1.0, noise, uHover * 0.1);
				
				vec3 color = vec3(r, g, b) * scanline * noise;
				gl_FragColor = vec4(color, uOpacity);
			} else {
				vec3 color = texture2D(uVideoTexture, uv).rgb;
				gl_FragColor = vec4(color, uOpacity);
			}
		}
	`;

	// Create tunnel geometry
	function createTunnelGeometry(): THREE.BufferGeometry {
		const geometry = new THREE.BufferGeometry();
		const positions: number[] = [];
		const indices: number[] = [];
		
		const segments = 100;
		const rings = 50;
		const radius = 1.5;
		
		// Create wireframe tunnel geometry
		for (let i = 0; i <= segments; i++) {
			const t = i / segments;
			const z = t * 20 - 10;
			
			for (let j = 0; j <= rings; j++) {
				const angle = (j / rings) * Math.PI * 2;
				const x = Math.cos(angle) * radius * (1 + t * 0.5);
				const y = Math.sin(angle) * radius * (1 + t * 0.5);
				
				positions.push(x, y, z);
			}
		}
		
		// Create indices for wireframe
		for (let i = 0; i < segments; i++) {
			for (let j = 0; j < rings; j++) {
				const a = i * (rings + 1) + j;
				const b = a + rings + 1;
				
				indices.push(a, b, a + 1);
				indices.push(b, b + 1, a + 1);
			}
		}
		
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		geometry.computeVertexNormals();
		
		return geometry;
	}

	const tunnelGeometry = createTunnelGeometry();
	
	// Calculate monolith size to be 60% of viewport height
	// For a 60-degree FOV camera at z=5, viewport height ≈ 2 * tan(30°) * 5 ≈ 5.77
	// 60% of that ≈ 3.5 units, but making them much larger for massive monolith feel
	// Vertical rectangles: taller than wide for that towering monolith effect
	const monolithHeight = 10; // Large vertical height (tall monoliths)
	const monolithWidth = 6; // Narrower width for vertical rectangle feel
	const monolithGeometry = new THREE.PlaneGeometry(monolithWidth, monolithHeight);
	
	// Generate random rotations for each monolith (slight drift)
	const monolithRotations: Array<{ y: number; z: number }> = projects.map(() => ({
		y: (Math.random() - 0.5) * 0.3, // Random Y rotation up to ±0.15 radians (~±8.6°)
		z: (Math.random() - 0.5) * 0.2   // Random Z rotation up to ±0.1 radians (~±5.7°)
	}));

	// Initialize monolith videos with proper loading
	function initializeMonoliths() {
		projects.forEach((project, index) => {
			const video = document.createElement('video');
			video.src = project.video;
			video.loop = true;
			video.muted = true;
			video.playsInline = true;
			video.crossOrigin = 'anonymous';
			video.preload = 'auto';
			
			// Wait for video to be ready before creating texture
			const handleCanPlay = () => {
				if (video.readyState >= 2) { // HAVE_CURRENT_DATA
					// Only create texture if video is ready
					if (!monolithTextures[index]) {
						const texture = new THREE.VideoTexture(video);
						texture.minFilter = THREE.LinearFilter;
						texture.magFilter = THREE.LinearFilter;
						texture.format = THREE.RGBAFormat;
						
						monolithTextures[index] = texture;
						
						// Update material if it exists
						if (monolithMaterials[index]) {
							monolithMaterials[index].uniforms.uVideoTexture.value = texture;
							monolithMaterials[index].needsUpdate = true;
						}
						
						// Check if all textures are ready
						const allReady = monolithTextures.every((tex, idx) => 
							idx < projects.length && tex !== undefined
						);
						if (allReady) {
							texturesReady = true;
						}
					}
					video.removeEventListener('canplay', handleCanPlay);
					video.removeEventListener('loadeddata', handleCanPlay);
				}
			};
			
			// Listen for both events to ensure video is ready
			video.addEventListener('canplay', handleCanPlay);
			video.addEventListener('loadeddata', handleCanPlay);
			
			// Start loading
			video.load();
			
			monolithVideos[index] = video;
			
			// Try to play (may be blocked by autoplay policy)
			video.play().catch((err) => {
				console.log(`Video ${index} autoplay prevented:`, err);
			});
		});
	}

	// Handle monolith hover
	function handleMonolithEnter(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		if (monolithMaterials[index]) {
			gsap.to(monolithMaterials[index].uniforms.uHover, {
				value: 1.0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}

	function handleMonolithLeave(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		if (monolithMaterials[index]) {
			gsap.to(monolithMaterials[index].uniforms.uHover, {
				value: 0.0,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}

	function handleMonolithClick(index: number) {
		if (!portfolioVisible || selectedIndex !== null) return;
		
		if (cameraRef) {
			// Move camera forward to the clicked monolith's Z position
			const targetZ = index * -15;
			gsap.to(cameraRef.position, {
				z: targetZ + 5, // Position camera slightly in front of the monolith
				duration: 1.5,
				ease: 'power3.inOut'
			});
		}
	}

	// Update hover state reactively when hoveredIndex prop changes
	$: if (hoveredIndex !== null && portfolioVisible && monolithMaterials[hoveredIndex]) {
		gsap.to(monolithMaterials[hoveredIndex].uniforms.uHover, {
			value: 1.0,
			duration: 0.3,
			ease: 'power2.out'
		});
	}
	
	$: if (hoveredIndex === null && portfolioVisible) {
		// Reset all hover states when not hovering
		monolithMaterials.forEach((material) => {
			if (material?.uniforms) {
				gsap.to(material.uniforms.uHover, {
					value: 0.0,
					duration: 0.3,
					ease: 'power2.out'
				});
			}
		});
	}

	onMount(() => {
		initializeMonoliths();
	});

	onDestroy(() => {
		// Cleanup videos
		monolithVideos.forEach((video) => {
			if (video) {
				video.pause();
				video.src = '';
				video.removeEventListener('canplay', () => {});
				video.removeEventListener('loadeddata', () => {});
			}
		});
		
		monolithTextures.forEach((texture) => {
			if (texture) {
				texture.dispose();
			}
		});
	});

	// Opening sequence animation frame (INSIDE Canvas context)
	useFrame((_, delta) => {
		if (openingSequenceVisible) {
			openingTime += delta;
			if (tunnelMaterialRef?.uniforms) {
				tunnelMaterialRef.uniforms.uTime.value = openingTime;
				tunnelMaterialRef.uniforms.uProgress.value = openingProgress.value;
			}
			
			// Rotate tunnel
			if (tunnelGroupRef) {
				tunnelGroupRef.rotation.z += delta * 0.5;
			}
		}
	});

	// Portfolio animation frame (INSIDE Canvas context)
	useFrame((_, delta) => {
		if (portfolioVisible && !selectedIndex) {
			time += delta * timeScale;
			
			// Smooth fly-through scroll: Lerp currentZ towards targetZ
			currentZ = MathUtils.lerp(currentZ, targetZ, lerpFactor);
			
			if (cameraRef) {
				// Apply smooth Z movement
				cameraRef.position.z = currentZ;
				
				// Optional parallax: Slight camera movement based on mouse position
				// Normalize mouse position (-1 to 1) and apply parallax
				const parallaxX = mousePosition.x * parallaxStrength;
				const parallaxY = mousePosition.y * parallaxStrength;
				cameraRef.position.x = parallaxX;
				cameraRef.position.y = parallaxY;
			}
			
			// Update time uniforms
			monolithMaterials.forEach((material) => {
				if (material?.uniforms) {
					material.uniforms.uTime.value = time;
				}
			});
		}
	});
</script>

<T.PerspectiveCamera 
	bind:ref={cameraRef}
	makeDefault 
	position={[0, 0, 5]} 
	fov={60} 
/>

<!-- Fog for atmosphere - black fog that fades distant objects -->
<T.Fog color="#000000" near={2} far={100} />

<!-- Opening Sequence: Wireframe Tunnel -->
{#if openingSequenceVisible}
	<T.Group bind:ref={tunnelGroupRef}>
		<T.Mesh geometry={tunnelGeometry}>
			<T.ShaderMaterial
				bind:ref={tunnelMaterialRef}
				vertexShader={tunnelVertexShader}
				fragmentShader={tunnelFragmentShader}
				transparent={true}
				side={THREE.DoubleSide}
				wireframe={true}
				uniforms={{
					uTime: { value: 0 },
					uProgress: { value: 0 }
				}}
			/>
		</T.Mesh>
	</T.Group>
{/if}

<!-- Portfolio: 3D Monoliths -->
{#if portfolioVisible}
	<T.Group bind:ref={portfolioGroupRef}>
		{#each projects as project, index}
			{@const zPosition = index * -15}
			{@const rotation = monolithRotations[index]}
			<T.Mesh
				geometry={monolithGeometry}
				position={[0, 0, zPosition]}
				rotation={[0, rotation.y, rotation.z]}
				interactive
				on:pointerenter={() => {
					handleMonolithEnter(index);
				}}
				on:pointerleave={() => {
					handleMonolithLeave(index);
				}}
				on:click={() => {
					handleMonolithClick(index);
				}}
			>
				<!-- Only render material when video texture is ready -->
				{#if monolithTextures[index]}
					<T.ShaderMaterial
						bind:ref={monolithMaterials[index]}
						vertexShader={videoVertexShader}
						fragmentShader={videoFragmentShader}
						side={THREE.DoubleSide}
						uniforms={{
							uVideoTexture: { value: monolithTextures[index] },
							uTime: { value: 0 },
							uHover: { value: 0 },
							uDistortion: { value: 0 },
							uOpacity: { value: 1.0 }
						}}
					/>
				{:else}
					<!-- Fallback material while video loads -->
					<T.MeshBasicMaterial
						color="#1a1a1a"
						transparent={true}
						opacity={0.5}
					/>
				{/if}
			</T.Mesh>
		{/each}
	</T.Group>
	
	<!-- Lighting -->
	<T.AmbientLight intensity={0.3} />
	<T.DirectionalLight position={[5, 5, 5]} intensity={0.8} />
	<T.DirectionalLight position={[-5, -5, -5]} intensity={0.4} />
{/if}
