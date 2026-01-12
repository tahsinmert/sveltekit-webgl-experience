<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas, T, useFrame } from '@threlte/core';
	import * as THREE from 'three';

	let canvasRef: HTMLDivElement;
	let pointsRef: THREE.Points;
	let materialRef: THREE.ShaderMaterial;
	let groupRef: THREE.Group;
	
	let mousePosition = { x: 0, y: 0 };
	let normalizedMouse = { x: 0.5, y: 0.5 };
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let rotationX = 0;
	let rotationY = 0;
	let targetRotationX = 0;
	let targetRotationY = 0;
	let hoverPosition = new THREE.Vector3(0, 0, 2.5);
	let hoverIntensity = 0;
	let time = 0;
	
	const PARTICLE_COUNT = 8000;
	const RADIUS = 2.5;
	
	// Generate particles on sphere surface
	function generateSpherePoints(count: number, radius: number): Float32Array {
		const positions = new Float32Array(count * 3);
		
		for (let i = 0; i < count; i++) {
			// Uniform distribution on sphere using spherical coordinates
			const theta = Math.random() * Math.PI * 2; // Azimuth
			const phi = Math.acos((Math.random() * 2) - 1); // Polar angle
			
			const x = radius * Math.sin(phi) * Math.cos(theta);
			const y = radius * Math.sin(phi) * Math.sin(theta);
			const z = radius * Math.cos(phi);
			
			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
		}
		
		return positions;
	}
	
	const positions = generateSpherePoints(PARTICLE_COUNT, RADIUS);
	
	// Create geometry
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	
	// Shader for particle explosion effect
	const vertexShader = `
		uniform float uTime;
		uniform vec3 uHoverPosition;
		uniform float uHoverIntensity;
		
		attribute vec3 position;
		
		varying float vDistance;
		varying float vIntensity;
		
		void main() {
			vec3 pos = position;
			
			// Calculate distance from hover position
			float dist = distance(pos, uHoverPosition);
			float maxDist = 0.8;
			
			// Explode particles near hover position
			if (dist < maxDist && uHoverIntensity > 0.0) {
				vec3 dir = normalize(pos - uHoverPosition);
				float explodeAmount = (1.0 - dist / maxDist) * uHoverIntensity * 0.3;
				pos += dir * explodeAmount;
			}
			
			vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
			gl_Position = projectionMatrix * mvPosition;
			gl_PointSize = 2.0;
			
			vDistance = dist;
			vIntensity = uHoverIntensity;
		}
	`;
	
	const fragmentShader = `
		varying float vDistance;
		varying float vIntensity;
		
		void main() {
			float dist = length(gl_PointCoord - vec2(0.5));
			float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
			
			// Glow effect near hover
			float glow = 0.0;
			if (vDistance < 0.8 && vIntensity > 0.0) {
				glow = (1.0 - vDistance / 0.8) * vIntensity * 0.5;
			}
			
			vec3 color = vec3(1.0) + vec3(glow);
			gl_FragColor = vec4(color, alpha * 0.9);
		}
	`;
	
	function handleMouseMove(e: MouseEvent) {
		if (!canvasRef) return;
		
		const rect = canvasRef.getBoundingClientRect();
		normalizedMouse.x = (e.clientX - rect.left) / rect.width;
		normalizedMouse.y = (e.clientY - rect.top) / rect.height;
		
		mousePosition.x = e.clientX;
		mousePosition.y = e.clientY;
		
		// Convert 2D mouse position to 3D sphere coordinates (simplified)
		const x = (normalizedMouse.x - 0.5) * 2;
		const y = (0.5 - normalizedMouse.y) * 2;
		const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
		hoverPosition.set(x * RADIUS, y * RADIUS, z * RADIUS);
		
		// Update hover intensity based on distance from center
		const distanceFromCenter = Math.sqrt(x * x + y * y);
		hoverIntensity = Math.max(0, 1 - distanceFromCenter * 1.2);
		
		if (isDragging) {
			const deltaX = e.clientX - previousMousePosition.x;
			const deltaY = e.clientY - previousMousePosition.y;
			
			targetRotationY += deltaX * 0.005;
			targetRotationX += deltaY * 0.005;
			
			// Limit vertical rotation
			targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
		}
		
		previousMousePosition.x = e.clientX;
		previousMousePosition.y = e.clientY;
		
		// Update shader uniforms
		if (materialRef && materialRef.uniforms) {
			materialRef.uniforms.uHoverPosition.value.copy(hoverPosition);
			materialRef.uniforms.uHoverIntensity.value = hoverIntensity;
		}
	}
	
	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		previousMousePosition.x = e.clientX;
		previousMousePosition.y = e.clientY;
	}
	
	function handleMouseUp() {
		isDragging = false;
	}
	
	function handleMouseLeave() {
		isDragging = false;
		hoverIntensity = 0;
		if (materialRef && materialRef.uniforms) {
			materialRef.uniforms.uHoverIntensity.value = 0;
		}
	}
	
	onMount(() => {
		if (canvasRef) {
			canvasRef.addEventListener('mousemove', handleMouseMove);
			canvasRef.addEventListener('mousedown', handleMouseDown);
			canvasRef.addEventListener('mouseup', handleMouseUp);
			canvasRef.addEventListener('mouseleave', handleMouseLeave);
		}
		
		return () => {
			if (canvasRef) {
				canvasRef.removeEventListener('mousemove', handleMouseMove);
				canvasRef.removeEventListener('mousedown', handleMouseDown);
				canvasRef.removeEventListener('mouseup', handleMouseUp);
				canvasRef.removeEventListener('mouseleave', handleMouseLeave);
			}
		};
	});
	
	// Auto-rotation when not dragging
	function updateRotation() {
		if (!isDragging) {
			targetRotationY += 0.001; // Slow auto-rotation
		}
		
		// Smooth interpolation
		rotationY += (targetRotationY - rotationY) * 0.05;
		rotationX += (targetRotationX - rotationX) * 0.05;
	}
	
	useFrame((_, delta) => {
		time += delta;
		updateRotation();
		
		if (groupRef) {
			groupRef.rotation.y = rotationY;
			groupRef.rotation.x = rotationX;
		}
		
		if (materialRef && materialRef.uniforms) {
			materialRef.uniforms.uTime.value = time;
		}
	});
</script>

<div bind:this={canvasRef} class="particle-globe-container">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 0, 6]} fov={60} />
		
		<T.Group bind:ref={groupRef}>
			<T.Points geometry={geometry} bind:ref={pointsRef}>
				<T.ShaderMaterial
					bind:ref={materialRef}
					vertexShader={vertexShader}
					fragmentShader={fragmentShader}
					transparent={true}
					blending={THREE.AdditiveBlending}
					depthWrite={false}
					uniforms={{
						uTime: { value: 0 },
						uHoverPosition: { value: new THREE.Vector3(0, 0, 2.5) },
						uHoverIntensity: { value: 0 }
					}}
				/>
			</T.Points>
		</T.Group>
	</Canvas>
</div>

<style>
	.particle-globe-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		cursor: grab;
	}
	
	.particle-globe-container:active {
		cursor: grabbing;
	}
	
	:global(.particle-globe-container canvas) {
		background: transparent !important;
	}
</style>