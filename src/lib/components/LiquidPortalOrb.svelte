<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Canvas, T } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import * as THREE from 'three';
	import { overlayOpen, orbPosition } from '$lib/stores/overlayStore.js';

	let canvasRef: HTMLDivElement;
	let isHovered = false;
	let mousePosition = { x: 0, y: 0 };
	let normalizedMouse = { x: 0, y: 0 };
	let rafId: number | null = null;
	let meshRef: THREE.Mesh;
	let materialRef: THREE.ShaderMaterial;
	let textMeshRef: any;

	// Custom shader for liquid metal effect
	const vertexShader = `
		uniform float uTime;
		uniform vec2 uMouse;
		uniform float uHover;
		uniform float uMagneticStrength;
		
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying vec2 vUv;
		
		// Simplex noise function
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
			vUv = uv;
			vNormal = normalize(normalMatrix * normal);
			vPosition = position;
			
			// Noise-based distortion
			vec3 pos = position;
			float noise = snoise(pos * 2.0 + uTime * 0.5);
			float noise2 = snoise(pos * 3.0 + uTime * 0.3);
			float combinedNoise = (noise + noise2 * 0.5) * 0.15;
			
			// Extreme magnetic deformation towards mouse
			// uMouse is in approximate world space (scaled by camera distance)
			vec3 mouseWorld = vec3(uMouse.x, uMouse.y, 0.0);
			vec3 localPos = pos;
			vec3 toMouse = mouseWorld - localPos;
			float distToMouse = length(toMouse);
			
			// Normalize direction
			vec3 toMouseDir = distToMouse > 0.001 ? normalize(toMouse) : vec3(0.0);
			
			// Extreme magnetic pull with smooth falloff
			float magneticPull = smoothstep(2.0, 0.0, distToMouse) * uMagneticStrength;
			magneticPull = pow(magneticPull, 0.6); // More aggressive curve for extreme effect
			
			// Stretch and deform sphere towards mouse (like slime trying to connect)
			// Deform along the direction to mouse
			vec3 deformation = toMouseDir * magneticPull * 1.2; // Extreme deformation
			
			// Add radial stretch effect (sphere expands towards mouse)
			float radialStretch = magneticPull * 0.5;
			pos += normal * radialStretch;
			
			// Combine noise and magnetic deformation
			// Noise creates liquid agitation, magnetic creates slime-like stretching
			pos += normal * (combinedNoise * (1.0 + uHover * 0.3) + uHover * 0.2) + deformation;
			
			// Hover scale effect
			float scale = 1.0 + uHover * 0.15;
			pos *= scale;
			
			gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		}
	`;

	const fragmentShader = `
		uniform float uTime;
		uniform float uHover;
		uniform vec2 uMouse;
		
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying vec2 vUv;
		
		// Simplex noise (same as vertex shader)
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
			// Liquid metal base color (dark, metallic, ferrofluid-like)
			vec3 baseColor = vec3(0.03, 0.03, 0.06);
			
			// Multi-layered noise for complex surface distortion
			float noise = snoise(vPosition * 4.0 + uTime * 0.8);
			float noise2 = snoise(vPosition * 6.0 + uTime * 0.5);
			float noise3 = snoise(vPosition * 8.0 + uTime * 1.2);
			float combinedNoise = (noise * 0.5 + noise2 * 0.3 + noise3 * 0.2) * 0.5 + 0.5;
			
			// Enhanced noise on hover (increased agitation)
			combinedNoise *= (1.0 + uHover * 0.5);
			
			// Fresnel effect for edges (liquid metal rim lighting)
			vec3 viewDir = normalize(cameraPosition - vPosition);
			float fresnel = pow(1.0 - dot(viewDir, vNormal), 1.5);
			
			// Metallic reflection with animated highlights
			vec3 reflectDir = reflect(-viewDir, vNormal);
			float reflection = pow(max(dot(reflectDir, vec3(0.0, 1.0, 0.0)), 0.0), 8.0);
			
			// Animated highlight that moves across surface
			float highlight = snoise(vPosition * 2.0 + uTime * 0.3) * 0.3 + 0.7;
			
			// Combine effects for dark liquid metal
			vec3 color = baseColor;
			color += vec3(0.12, 0.18, 0.25) * combinedNoise * highlight;
			color += vec3(0.08, 0.12, 0.18) * fresnel;
			color += vec3(0.25, 0.3, 0.35) * reflection;
			
			// Hover intensity boost (liquid becomes more agitated and brighter)
			color += uHover * vec3(0.15, 0.2, 0.25);
			
			// Maintain dark liquid metal appearance but allow highlights
			color = mix(color, baseColor * 0.4, 0.25);
			
			// Slight color shift towards blue on hover (ferrofluid effect)
			if (uHover > 0.1) {
				color = mix(color, color + vec3(0.05, 0.1, 0.15) * uHover, 0.3);
			}
			
			gl_FragColor = vec4(color, 0.96);
		}
	`;

	export let text = 'EXPLORE';
	export let onClick = () => {};

	let time = 0;
	let hoverIntensity = 0;
	let magneticStrength = 0;

	onMount(() => {
		const animate = () => {
			time += 0.016; // ~60fps
			
			if (materialRef && materialRef.uniforms) {
				materialRef.uniforms.uTime.value = time;
				materialRef.uniforms.uHover.value = hoverIntensity;
				materialRef.uniforms.uMouse.value = [normalizedMouse.x, normalizedMouse.y];
				materialRef.uniforms.uMagneticStrength.value = magneticStrength;
			}

			rafId = requestAnimationFrame(animate);
		};

		animate();

		const handleMouseMove = (e: MouseEvent) => {
			if (!canvasRef) return;
			
			mousePosition.x = e.clientX;
			mousePosition.y = e.clientY;
			
			const rect = canvasRef.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			
			// Normalize mouse position for shader (-1 to 1, in world space approximation)
			// Since camera is at z=3 and sphere is at origin, we scale by camera distance
			const scale = 3.0; // Approximate world space scale
			normalizedMouse.x = ((e.clientX - centerX) / (rect.width / 2)) * scale;
			normalizedMouse.y = -((e.clientY - centerY) / (rect.height / 2)) * scale;
			
			// Calculate distance for magnetic effect (works globally)
			const dx = e.clientX - centerX;
			const dy = e.clientY - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			// Calculate magnetic strength based on distance (extreme effect)
			const maxDistance = 300; // Increased range for global effect
			let strength = Math.max(0, 1 - distance / maxDistance);
			strength = Math.pow(strength, 1.5); // More aggressive curve
			
			// Boost strength when hovering
			if (isHovered) {
				strength *= 1.5;
			}
			
			magneticStrength = Math.min(1, strength);
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	});

	const handleMouseEnter = () => {
		isHovered = true;
		// Smooth hover intensity increase using GSAP-like easing
		const animateHover = () => {
			if (hoverIntensity < 1) {
				hoverIntensity = Math.min(1, hoverIntensity + 0.15);
				requestAnimationFrame(animateHover);
			}
		};
		animateHover();
	};

	const handleMouseLeave = () => {
		isHovered = false;
		// Smooth hover intensity decrease
		const animateHover = () => {
			if (hoverIntensity > 0) {
				hoverIntensity = Math.max(0, hoverIntensity - 0.12);
				requestAnimationFrame(animateHover);
			}
		};
		animateHover();
	};

	const handleClick = () => {
		// Capture orb position for ripple transition
		if (canvasRef) {
			const rect = canvasRef.getBoundingClientRect();
			orbPosition.set({
				x: rect.left,
				y: rect.top,
				width: rect.width,
				height: rect.height
			});
		}
		
		// Open overlay
		overlayOpen.set(true);
		
		// Call original onClick if provided
		onClick();
	};
</script>

{#if browser}
	<div
		bind:this={canvasRef}
		class="liquid-portal-orb"
		role="button"
		tabindex="0"
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		on:click={handleClick}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClick();
			}
		}}
	>
		<Canvas>
			<T.PerspectiveCamera makeDefault position={[0, 0, 3]} />
			
			<T.Mesh
				bind:ref={meshRef}
				geometry={new THREE.SphereGeometry(0.8, 64, 64)}
			>
				<T.ShaderMaterial
					bind:ref={materialRef}
					vertexShader={vertexShader}
					fragmentShader={fragmentShader}
					transparent={true}
					side={THREE.DoubleSide}
					uniforms={{
						uTime: { value: 0 },
						uHover: { value: 0 },
						uMouse: { value: [0, 0] },
						uMagneticStrength: { value: 0 }
					}}
				/>
			</T.Mesh>
			
			<!-- Text inside the orb -->
			<Text
				bind:ref={textMeshRef}
				text={text}
				fontSize={0.12}
				color="#ffffff"
				anchorX="center"
				anchorY="middle"
				position={[0, 0, 0.1]}
				material={new THREE.MeshBasicMaterial({
					color: 0xffffff,
					transparent: true,
					opacity: 0.4,
					depthWrite: false
				})}
			/>
			
			<!-- Subtle ambient light -->
			<T.AmbientLight intensity={0.3} />
			<T.DirectionalLight position={[5, 5, 5]} intensity={0.5} />
		</Canvas>
	</div>
{/if}

<style>
	.liquid-portal-orb {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 120px;
		height: 120px;
		cursor: pointer;
		z-index: 1000;
		pointer-events: all;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.liquid-portal-orb:hover {
		transform: scale(1.1);
	}

	.liquid-portal-orb :global(canvas) {
		background: transparent !important;
	}

	@media (max-width: 768px) {
		.liquid-portal-orb {
			width: 100px;
			height: 100px;
			bottom: 1.5rem;
			right: 1.5rem;
		}
	}
</style>