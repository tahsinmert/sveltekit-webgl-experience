<script lang="ts">
	import { useFrame } from '@threlte/core';
	import * as THREE from 'three';
	
	export let time: { value: number };
	export let videoTextures: (THREE.VideoTexture | null)[];
	export let materialRefs: THREE.ShaderMaterial[];
	export let groupRef: THREE.Group | undefined;
	
	useFrame((_, delta) => {
		time.value += delta;
		
		// Update video textures
		videoTextures.forEach((texture) => {
			if (texture) {
				texture.needsUpdate = true;
			}
		});
		
		// Update shader uniforms
		materialRefs.forEach((material) => {
			if (material && material.uniforms) {
				material.uniforms.uTime.value = time.value;
			}
		});
		
		// Subtle floating animation
		if (groupRef) {
			groupRef.position.y = Math.sin(time.value * 0.5) * 0.15;
		}
	});
</script>
