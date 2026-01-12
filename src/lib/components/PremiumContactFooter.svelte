<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	let sectionRef: HTMLElement;
	let headerTextRef: HTMLElement;
	let magneticButtonRef: HTMLElement;
	let formRef: HTMLElement;
	let socialMarqueeRef: HTMLElement;
	let footerInfoRef: HTMLElement;

	let mouseX = 0;
	let mouseY = 0;
	let buttonX = 0;
	let buttonY = 0;
	let isHoveringButton = false;

	let formData = {
		name: '',
		email: '',
		message: ''
	};

	let errors: Record<string, string> = {};
	let isSubmitting = false;
	let isSubmitted = false;

	const socialLinks = [
		{ name: 'LinkedIn', url: 'https://linkedin.com', icon: '↗' },
		{ name: 'Twitter', url: 'https://twitter.com', icon: '↗' },
		{ name: 'GitHub', url: 'https://github.com', icon: '↗' },
		{ name: 'Dribbble', url: 'https://dribbble.com', icon: '↗' },
		{ name: 'Behance', url: 'https://behance.net', icon: '↗' }
	];

	const currentYear = new Date().getFullYear();

	// Magnetic button effect
	function handleMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;

		if (magneticButtonRef) {
			const rect = magneticButtonRef.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const deltaX = mouseX - centerX;
			const deltaY = mouseY - centerY;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const maxDistance = 150; // Magnetic radius

			if (distance < maxDistance && !isHoveringButton) {
				const force = (maxDistance - distance) / maxDistance;
				buttonX = deltaX * force * 0.3;
				buttonY = deltaY * force * 0.3;

				gsap.to(magneticButtonRef, {
					x: buttonX,
					y: buttonY,
					duration: 0.3,
					ease: 'power2.out'
				});
			} else if (distance >= maxDistance) {
				gsap.to(magneticButtonRef, {
					x: 0,
					y: 0,
					duration: 0.5,
					ease: 'power2.out'
				});
			}
		}

		// Header text skew effect
		if (headerTextRef) {
			const rect = headerTextRef.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const deltaX = (mouseX - centerX) / (rect.width / 2);
			const deltaY = (mouseY - centerY) / (rect.height / 2);

			gsap.to(headerTextRef, {
				skewX: deltaX * 2,
				skewY: deltaY * 0.5,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	}

	function handleMouseLeave() {
		if (magneticButtonRef) {
			gsap.to(magneticButtonRef, {
				x: 0,
				y: 0,
				duration: 0.5,
				ease: 'power2.out'
			});
		}
		if (headerTextRef) {
			gsap.to(headerTextRef, {
				skewX: 0,
				skewY: 0,
				duration: 0.5,
				ease: 'power2.out'
			});
		}
	}

	function validateEmail(email: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	function validate(): boolean {
		errors = {};

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
		}

		if (!formData.email.trim()) {
			errors.email = 'Email is required';
		} else if (!validateEmail(formData.email)) {
			errors.email = 'Please enter a valid email';
		}

		if (!formData.message.trim()) {
			errors.message = 'Message is required';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		isSubmitting = true;

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			isSubmitted = true;
			formData = { name: '', email: '', message: '' };

			setTimeout(() => {
				isSubmitted = false;
			}, 5000);
		} catch (error) {
			console.error('Form submission error:', error);
		} finally {
			isSubmitting = false;
		}
	}

	let scrollTriggerInstance: ScrollTrigger | null = null;
	let marqueeAnimation: gsap.core.Tween | null = null;

	onMount(() => {
		if (sectionRef) {
			// Stagger fade-in animation on scroll
			const elements = sectionRef.querySelectorAll('[data-animate]');
			
			scrollTriggerInstance = ScrollTrigger.create({
				trigger: sectionRef,
				start: 'top 80%',
				onEnter: () => {
					gsap.fromTo(
						elements,
						{
							opacity: 0,
							y: 60
						},
						{
							opacity: 1,
							y: 0,
							duration: 1.2,
							stagger: 0.15,
							ease: 'power3.out'
						}
					);
				}
			});

			// Social marquee animation
			if (socialMarqueeRef) {
				const marqueeContent = socialMarqueeRef.querySelector('.marquee-content');
				if (marqueeContent) {
					marqueeAnimation = gsap.to(marqueeContent, {
						x: '-50%',
						duration: 20,
						repeat: -1,
						ease: 'none'
					});
				}
			}
		}

		window.addEventListener('mousemove', handleMouseMove);
		sectionRef?.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			sectionRef?.removeEventListener('mouseleave', handleMouseLeave);
			
			// Cleanup ScrollTrigger
			if (scrollTriggerInstance) {
				scrollTriggerInstance.kill();
			}
			
			// Cleanup marquee animation
			if (marqueeAnimation) {
				marqueeAnimation.kill();
			}
		};
	});
</script>

<section
	bind:this={sectionRef}
	id="contact"
	class="premium-contact-footer relative w-full min-h-screen bg-[#050505] overflow-hidden"
>
	<!-- Subtle noise texture overlay -->
	<div class="noise-overlay"></div>

	<!-- Faint glowing gradient orb -->
	<div class="gradient-orb"></div>

	<div class="container relative z-10 px-4 md:px-8 lg:px-16 py-32">
		<!-- Massive Header Text -->
		<div class="header-section mb-32 md:mb-40" data-animate>
			<h1
				bind:this={headerTextRef}
				class="header-text text-7xl md:text-9xl lg:text-[12rem] xl:text-[16rem] font-display font-black text-signal leading-[0.85] tracking-tight cursor-none select-none"
			>
				LET'S<br />TALK
			</h1>
		</div>

		<!-- Main Content Grid -->
		<div class="content-grid grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
			<!-- Left: Magnetic Button & Contact Info -->
			<div class="left-column flex flex-col gap-12" data-animate>
				<!-- Magnetic Circular Button -->
				<a
					bind:this={magneticButtonRef}
					href="mailto:hello@example.com"
					class="magnetic-button group relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-signal text-void flex items-center justify-center font-display font-bold text-lg md:text-xl transition-all duration-300 hover:scale-110"
					on:mouseenter={() => (isHoveringButton = true)}
					on:mouseleave={() => (isHoveringButton = false)}
				>
					<span class="relative z-10">Email Us</span>
					<div class="absolute inset-0 rounded-full border-2 border-signal/20 group-hover:border-signal/40 transition-colors"></div>
				</a>

				<!-- Contact Info -->
				<div class="contact-info space-y-6">
					<div>
						<p class="text-signal-muted text-sm uppercase tracking-wider mb-2">Email</p>
						<a href="mailto:hello@example.com" class="text-signal text-xl md:text-2xl font-medium hover:text-electric transition-colors">
							hello@example.com
						</a>
					</div>
					<div>
						<p class="text-signal-muted text-sm uppercase tracking-wider mb-2">Location</p>
						<p class="text-signal text-xl md:text-2xl font-medium">Istanbul, Turkey</p>
					</div>
				</div>
			</div>

			<!-- Right: Minimal Form -->
			<div class="right-column" data-animate>
				{#if isSubmitted}
					<div class="success-state flex flex-col items-center justify-center py-20">
						<div class="success-icon w-20 h-20 rounded-full bg-electric/20 border-2 border-electric flex items-center justify-center mb-6">
							<svg class="w-10 h-10 text-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
							</svg>
						</div>
						<p class="text-signal text-xl font-medium">Message sent successfully!</p>
						<p class="text-signal-muted mt-2">We'll get back to you soon.</p>
					</div>
				{:else}
					<form bind:this={formRef} on:submit={handleSubmit} class="minimal-form space-y-8">
						<!-- Name Input -->
						<div class="form-field">
							<input
								type="text"
								bind:value={formData.name}
								placeholder="What's your name?"
								class="form-input text-2xl md:text-3xl font-bold text-signal placeholder-signal-muted bg-transparent border-0 border-b-2 border-signal/20 focus:border-signal outline-none w-full pb-4 transition-colors"
								disabled={isSubmitting}
							/>
							{#if errors.name}
								<p class="error-text text-sm text-red-400 mt-2">{errors.name}</p>
							{/if}
						</div>

						<!-- Email Input -->
						<div class="form-field">
							<input
								type="email"
								bind:value={formData.email}
								placeholder="What's your email?"
								class="form-input text-2xl md:text-3xl font-bold text-signal placeholder-signal-muted bg-transparent border-0 border-b-2 border-signal/20 focus:border-signal outline-none w-full pb-4 transition-colors"
								disabled={isSubmitting}
							/>
							{#if errors.email}
								<p class="error-text text-sm text-red-400 mt-2">{errors.email}</p>
							{/if}
						</div>

						<!-- Message Input -->
						<div class="form-field">
							<textarea
								bind:value={formData.message}
								placeholder="Tell us about your idea..."
								rows="4"
								class="form-input text-2xl md:text-3xl font-bold text-signal placeholder-signal-muted bg-transparent border-0 border-b-2 border-signal/20 focus:border-signal outline-none w-full pb-4 resize-none transition-colors"
								disabled={isSubmitting}
							></textarea>
							{#if errors.message}
								<p class="error-text text-sm text-red-400 mt-2">{errors.message}</p>
							{/if}
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isSubmitting}
							class="submit-button group relative inline-flex items-center gap-3 text-signal text-xl md:text-2xl font-bold uppercase tracking-wider hover:text-electric transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
						>
							<span>{isSubmitting ? 'Sending...' : 'Send'}</span>
							<svg
								class="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
							</svg>
						</button>
					</form>
				{/if}
			</div>
		</div>

		<!-- Social Links Marquee -->
		<div bind:this={socialMarqueeRef} class="social-marquee-wrapper overflow-hidden mb-16" data-animate>
			<div class="marquee-content flex items-center gap-12 md:gap-16">
				{#each Array(2) as _}
					{#each socialLinks as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="social-link group flex items-center gap-3 text-signal text-2xl md:text-3xl font-bold uppercase tracking-wider hover:text-electric transition-colors whitespace-nowrap"
						>
							<span>{link.name}</span>
							<span class="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
								{link.icon}
							</span>
						</a>
					{/each}
				{/each}
			</div>
		</div>

		<!-- Footer Info Grid -->
		<div bind:this={footerInfoRef} class="footer-info grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-signal/10" data-animate>
			<div>
				<p class="text-signal-muted text-xs uppercase tracking-wider mb-2">Copyright</p>
				<p class="text-signal text-sm">© {currentYear} Anonymous</p>
			</div>
			<div>
				<p class="text-signal-muted text-xs uppercase tracking-wider mb-2">Address</p>
				<p class="text-signal text-sm">Istanbul, Turkey</p>
			</div>
			<div>
				<p class="text-signal-muted text-xs uppercase tracking-wider mb-2">Status</p>
				<p class="text-signal text-sm">Available for projects</p>
			</div>
		</div>
	</div>
</section>

<style>
	.premium-contact-footer {
		position: relative;
		background: #050505;
	}

	/* Noise texture overlay */
	.noise-overlay {
		position: absolute;
		inset: 0;
		opacity: 0.03;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
		pointer-events: none;
		z-index: 1;
	}

	/* Glowing gradient orb */
	.gradient-orb {
		position: absolute;
		top: -20%;
		right: -10%;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%);
		border-radius: 50%;
		filter: blur(80px);
		pointer-events: none;
		z-index: 1;
		animation: float 20s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(-30px, 30px) scale(1.1);
		}
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
	}

	.header-text {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
		transform-origin: center;
		transition: transform 0.3s ease;
	}

	.magnetic-button {
		will-change: transform;
		cursor: pointer;
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
		transition: box-shadow 0.3s ease;
	}

	.magnetic-button:hover {
		box-shadow: 0 0 40px 10px rgba(255, 255, 255, 0.2);
	}

	.form-input::placeholder {
		opacity: 0.4;
		transition: opacity 0.3s ease;
	}

	.form-input:focus::placeholder {
		opacity: 0.2;
	}

	.form-input:focus {
		border-bottom-width: 3px;
	}

	.social-marquee-wrapper {
		position: relative;
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			black 10%,
			black 90%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			black 10%,
			black 90%,
			transparent 100%
		);
	}

	.marquee-content {
		display: inline-flex;
		width: max-content;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.header-text {
			font-size: 4rem;
		}

		.magnetic-button {
			width: 100px;
			height: 100px;
			font-size: 1rem;
		}

		.form-input {
			font-size: 1.5rem;
		}
	}
</style>