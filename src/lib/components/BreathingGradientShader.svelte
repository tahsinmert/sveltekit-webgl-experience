<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	let canvasRef: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.OrthographicCamera;
	let renderer: THREE.WebGLRenderer;
	let material: THREE.ShaderMaterial;
	let mesh: THREE.Mesh;
	let geometry: THREE.PlaneGeometry;
	let animationId: number | null = null;
	let mousePosition = { x: 0.5, y: 0.5 };
	let time = 0;

	// Vertex shader
	const vertexShader = `
		varying vec2 vUv;
		
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	// Fragment shader - "The Breathing Gradient"
	const fragmentShader = `
		uniform float uTime;
		uniform vec2 uMouse;
		uniform vec2 uResolution;
		
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
			
			vec4 x = x_ * ns.x + ns.yyyy;
			vec4 y = y_ * ns.x + ns.yyyy;
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
			vec2 uv = vUv;
			
			// Slow time for breathing effect
			float slowTime = uTime * 0.15;
			
			// Create flowing noise pattern (liquid smoke effect)
			float noise1 = snoise(vec3(uv * 2.0 + slowTime * 0.3, slowTime * 0.2));
			float noise2 = snoise(vec3(uv * 3.0 - slowTime * 0.25, slowTime * 0.15));
			float noise3 = snoise(vec3(uv * 1.5 + slowTime * 0.4, slowTime * 0.3));
			
			// Combine noise layers for organic movement
			float combinedNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
			
			// Base colors: Charcoal (#1a1a1a), Midnight Blue (#0a1628), Deep Purple (#1a0a28)
			vec3 charcoal = vec3(0.1, 0.1, 0.1);
			vec3 midnightBlue = vec3(0.04, 0.09, 0.16);
			vec3 deepPurple = vec3(0.10, 0.04, 0.16);
			
			// Create gradient that shifts based on noise
			vec3 color1 = mix(charcoal, midnightBlue, combinedNoise * 0.5 + 0.5);
			vec3 color2 = mix(color1, deepPurple, sin(slowTime + uv.y * 2.0) * 0.3 + 0.5);
			
			// Add breathing effect (pulsing brightness)
			float breathing = sin(slowTime * 0.5) * 0.1 + 0.9;
			vec3 baseColor = color2 * breathing;
			
			// Mouse interaction - colors get brighter near cursor
			vec2 mouseDist = uv - uMouse;
			float distToMouse = length(mouseDist);
			float mouseInfluence = 1.0 - smoothstep(0.0, 0.4, distToMouse);
			
			// Brighten and add glow near cursor
			vec3 glowColor = vec3(0.2, 0.3, 0.4); // Slight blue glow
			baseColor = mix(baseColor, baseColor + glowColor * 0.3, mouseInfluence * 0.6);
			baseColor = mix(baseColor, baseColor * 1.4, mouseInfluence * 0.4);
			
			// Add subtle highlights from noise
			float highlight = max(0.0, combinedNoise - 0.3) * 0.15;
			baseColor += vec3(0.1, 0.15, 0.2) * highlight;
			
			gl_FragColor = vec4(baseColor, 1.0);
		}
	`;

	const handleMouseMove = (e: MouseEvent) => {
		if (!canvasRef) return;
		const rect = canvasRef.getBoundingClientRect();
		mousePosition.x = (e.clientX - rect.left) / rect.width;
		mousePosition.y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y
		
		if (material && material.uniforms) {
			material.uniforms.uMouse.value.x = mousePosition.x;
			material.uniforms.uMouse.value.y = mousePosition.y;
		}
	};

	const handleResize = () => {
		if (!canvasRef || !renderer || !camera) return;
		
		const width = window.innerWidth;
		const height = window.innerHeight;
		
		camera.left = -width / 2;
		camera.right = width / 2;
		camera.top = height / 2;
		camera.bottom = -height / 2;
		camera.updateProjectionMatrix();
		
		renderer.setSize(width, height);
		
		if (material && material.uniforms) {
			material.uniforms.uResolution.value.x = width;
			material.uniforms.uResolution.value.y = height;
		}
	};

	const animate = (currentTime: number) => {
		if (!material || !renderer || !scene || !camera) return;
		
		time = currentTime * 0.001; // Convert to seconds
		
		if (material.uniforms) {
			material.uniforms.uTime.value = time;
		}
		
		renderer.render(scene, camera);
		
		animationId = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (!canvasRef) return;

		const width = canvasRef.clientWidth || window.innerWidth;
		const height = canvasRef.clientHeight || window.innerHeight;

		// Scene setup
		scene = new THREE.Scene();

		// Camera setup (orthographic for 2D fullscreen effect)
		camera = new THREE.OrthographicCamera(
			-width / 2,
			width / 2,
			height / 2,
			-height / 2,
			0.1,
			1000
		);
		camera.position.z = 1;

		// Renderer setup
		renderer = new THREE.WebGLRenderer({
			canvas: canvasRef,
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 1);

		// Create shader material
		material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uMouse: { value: new THREE.Vector2(0.5, 0.5) },
				uResolution: { value: new THREE.Vector2(width, height) }
			}
		});

		// Create fullscreen quad
		geometry = new THREE.PlaneGeometry(width, height);
		mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// Event listeners
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('resize', handleResize);
		canvasRef.addEventListener('mousemove', handleMouseMove);

		// Start animation
		animationId = requestAnimationFrame(animate);

		return () => {
			if (animationId !== null) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			if (canvasRef) {
				canvasRef.removeEventListener('mousemove', handleMouseMove);
			}
			if (geometry) {
				geometry.dispose();
			}
			if (material) {
				material.dispose();
			}
			if (renderer) {
				renderer.dispose();
			}
		};
	});

	onDestroy(() => {
		if (animationId !== null) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
		if (geometry) {
			geometry.dispose();
		}
		if (material) {
			material.dispose();
		}
		if (renderer) {
			renderer.dispose();
		}
	});
</script>

<canvas
	bind:this={canvasRef}
	class="absolute inset-0 w-full h-full"
	style="display: block;"
></canvas>
