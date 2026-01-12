<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { goto } from '$app/navigation';

	export let params: Record<string, string> = {};
	export let error: Error & { status?: number; message?: string } | null = null;

	$: status = error?.status || 500;
	$: is404 = status === 404;

	let canvasRef: HTMLCanvasElement;
	let buttonRef: HTMLButtonElement;
	let animationFrame: number | null = null;
	let particles: Particle[] = [];
	let mouse = { x: 0, y: 0 };
	let targetMouse = { x: 0, y: 0 };
	let ctx: CanvasRenderingContext2D | null = null;

	// Particle class
	class Particle {
		originalX: number;
		originalY: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		opacity: number;

		constructor(x: number, y: number) {
			this.originalX = x;
			this.originalY = y;
			this.x = x;
			this.y = y;
			this.vx = 0;
			this.vy = 0;
			this.size = Math.random() * 2 + 1;
			this.opacity = 0.8 + Math.random() * 0.2;
		}

		update(canvasWidth: number, canvasHeight: number) {
			// Calculate distance from mouse
			const dx = targetMouse.x - this.x;
			const dy = targetMouse.y - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const maxDistance = 150;

			// Apply repulsion force from mouse
			if (distance < maxDistance && distance > 0) {
				const force = (maxDistance - distance) / maxDistance;
				const angle = Math.atan2(dy, dx);
				this.vx -= Math.cos(angle) * force * 0.8;
				this.vy -= Math.sin(angle) * force * 0.8;
			}

			// Spring back to original position
			const springX = (this.originalX - this.x) * 0.05;
			const springY = (this.originalY - this.y) * 0.05;
			this.vx += springX;
			this.vy += springY;

			// Apply damping
			this.vx *= 0.85;
			this.vy *= 0.85;

			// Update position
			this.x += this.vx;
			this.y += this.vy;

			// Boundary constraints (soft)
			if (this.x < 0 || this.x > canvasWidth) {
				this.vx *= -0.5;
			}
			if (this.y < 0 || this.y > canvasHeight) {
				this.vy *= -0.5;
			}
		}

		draw(ctx: CanvasRenderingContext2D) {
			ctx.save();
			ctx.globalAlpha = this.opacity;
			ctx.fillStyle = '#00D9FF';
			ctx.shadowBlur = 10;
			ctx.shadowColor = '#00D9FF';
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}

	function createParticleText(canvas: HTMLCanvasElement, text: string, fontSize: number) {
		ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		// Set up text rendering
		ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#00D9FF';

		// Create text on offscreen canvas to get pixel data
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');
		if (!tempCtx) return;
		
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		tempCtx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
		tempCtx.textAlign = 'center';
		tempCtx.textBaseline = 'middle';
		tempCtx.fillStyle = '#FFFFFF';
		tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);

		// Extract pixels and create particles
		const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		const spacing = 4; // Pixel spacing for particles

		particles = [];

		for (let y = 0; y < canvas.height; y += spacing) {
			for (let x = 0; x < canvas.width; x += spacing) {
				const index = (y * canvas.width + x) * 4;
				const alpha = data[index + 3];

				if (alpha > 128) {
					// Add some randomness for drift effect
					const jitterX = (Math.random() - 0.5) * 20;
					const jitterY = (Math.random() - 0.5) * 20;
					particles.push(new Particle(x + jitterX, y + jitterY));
				}
			}
		}
	}

	function animate() {
		if (!ctx || !canvasRef) return;
		
		const context = ctx; // Store in local variable for type narrowing

		// Smooth mouse interpolation
		mouse.x += (targetMouse.x - mouse.x) * 0.1;
		mouse.y += (targetMouse.y - mouse.y) * 0.1;

		// Clear canvas with black background
		context.fillStyle = '#000000';
		context.fillRect(0, 0, canvasRef.width, canvasRef.height);

		// Update and draw particles
		particles.forEach(particle => {
			particle.update(canvasRef.width, canvasRef.height);
			particle.draw(context);
		});

		animationFrame = requestAnimationFrame(animate);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvasRef) return;
		const rect = canvasRef.getBoundingClientRect();
		targetMouse.x = e.clientX - rect.left;
		targetMouse.y = e.clientY - rect.top;
	}

	function handleResize() {
		if (!canvasRef) return;
		canvasRef.width = window.innerWidth;
		canvasRef.height = window.innerHeight;
		const text = is404 ? '404' : status.toString();
		createParticleText(canvasRef, text, 180);
	}

	function handleButtonMouseMove(e: MouseEvent) {
		if (!buttonRef) return;
		
		const rect = buttonRef.getBoundingClientRect();
		const buttonCenterX = rect.left + rect.width / 2;
		const buttonCenterY = rect.top + rect.height / 2;
		
		const distance = Math.sqrt(
			Math.pow(e.clientX - buttonCenterX, 2) + Math.pow(e.clientY - buttonCenterY, 2)
		);
		const magneticRadius = 100;

		if (distance < magneticRadius) {
			const pullStrength = (magneticRadius - distance) / magneticRadius;
			const pullX = (e.clientX - buttonCenterX) * pullStrength * 0.25;
			const pullY = (e.clientY - buttonCenterY) * pullStrength * 0.25;

			gsap.to(buttonRef, {
				x: pullX,
				y: pullY,
				duration: 0.3,
				ease: 'power2.out'
			});
		} else {
			gsap.to(buttonRef, {
				x: 0,
				y: 0,
				duration: 0.5,
				ease: 'elastic.out(1, 0.5)'
			});
		}
	}

	function handleButtonMouseLeave() {
		if (buttonRef) {
			gsap.to(buttonRef, {
				x: 0,
				y: 0,
				duration: 0.5,
				ease: 'elastic.out(1, 0.5)'
			});
		}
	}

	function handleGoHome() {
		goto('/');
	}

	onMount(() => {
		if (!canvasRef) return;

		// Initialize canvas
		canvasRef.width = window.innerWidth;
		canvasRef.height = window.innerHeight;
		ctx = canvasRef.getContext('2d');
		if (!ctx) return;

		// Create particle text
		const text = is404 ? '404' : status.toString();
		createParticleText(canvasRef, text, 180);

		// Initialize mouse position
		targetMouse.x = window.innerWidth / 2;
		targetMouse.y = window.innerHeight / 2;
		mouse.x = targetMouse.x;
		mouse.y = targetMouse.y;

		// Start animation
		animate();

		// Add event listeners
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('resize', handleResize);
		window.addEventListener('mousemove', handleButtonMouseMove);

		// Pulse button animation
		if (buttonRef) {
			gsap.to(buttonRef, {
				scale: 1.05,
				duration: 1.5,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut'
			});
		}

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleButtonMouseMove);
		};
	});

	onDestroy(() => {
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}
	});
</script>

<svelte:head>
	<title>SIGNAL_LOST - {status}</title>
</svelte:head>

<div class="signal-lost-container">
	<canvas bind:this={canvasRef} class="particle-canvas"></canvas>
	
	<div class="content-overlay">
		{#if is404}
			<div class="title-container">
				<h1 class="signal-lost-title">SIGNAL_LOST</h1>
			</div>
			
			<p class="subtext">
				Coordinate not found. The page you are looking for has drifted into the void.
			</p>
		{:else}
			<div class="title-container">
				<h1 class="signal-lost-title">ERROR_{status}</h1>
			</div>
			
			<p class="subtext">
				{error?.message || 'An unexpected error occurred'}
			</p>
		{/if}
		
		<button
			bind:this={buttonRef}
			on:click={handleGoHome}
			on:mouseleave={handleButtonMouseLeave}
			class="emergency-button"
		>
			<span class="button-text">EMERGENCY RETURN</span>
			<span class="button-glow"></span>
		</button>
	</div>
</div>

<style>
	.signal-lost-container {
		position: relative;
		width: 100%;
		height: 100vh;
		background: #000000;
		overflow: hidden;
	}

	.particle-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		cursor: none;
	}

	.content-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 10;
		pointer-events: none;
	}

	.title-container {
		margin-bottom: 2rem;
		pointer-events: none;
	}

	.signal-lost-title {
		font-family: 'JetBrains Mono', monospace;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 700;
		color: #00D9FF;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
		margin: 0;
	}

	.subtext {
		font-family: 'Inter', sans-serif;
		font-size: clamp(0.875rem, 2vw, 1.125rem);
		color: #CCCCCC;
		text-align: center;
		max-width: 600px;
		margin: 0 0 4rem 0;
		padding: 0 2rem;
		line-height: 1.6;
		pointer-events: none;
	}

	.emergency-button {
		position: relative;
		padding: 1rem 2.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: clamp(0.875rem, 1.5vw, 1rem);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #00D9FF;
		background: transparent;
		border: 2px solid #00D9FF;
		cursor: pointer;
		pointer-events: all;
		overflow: hidden;
		transition: box-shadow 0.3s ease;
	}

	.emergency-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.emergency-button:hover::before {
		left: 100%;
	}

	.emergency-button:hover {
		box-shadow: 0 0 30px rgba(0, 217, 255, 0.6), inset 0 0 30px rgba(0, 217, 255, 0.1);
	}

	.button-text {
		position: relative;
		z-index: 2;
	}

	.button-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0;
		height: 0;
		background: radial-gradient(circle, rgba(0, 217, 255, 0.4), transparent);
		border-radius: 50%;
		opacity: 0;
		transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
		pointer-events: none;
	}

	.emergency-button:hover .button-glow {
		width: 200px;
		height: 200px;
		opacity: 1;
	}

	@media (max-width: 768px) {
		.subtext {
			margin-bottom: 3rem;
		}

		.emergency-button {
			padding: 0.875rem 2rem;
		}
	}
</style>
