<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { overlayOpen, orbPosition } from '$lib/stores/overlayStore.js';
	import { writable } from 'svelte/store';
	import { gsap } from 'gsap';

	let overlayRef: HTMLDivElement;
	let modalRef: HTMLDivElement;
	let backdropRef: HTMLDivElement;
	let mainContentRef: HTMLElement;
	let rippleRef: HTMLDivElement;
	let inputRef: HTMLInputElement;
	let waveformCanvas: HTMLCanvasElement;
	let waveformCtx: CanvasRenderingContext2D | null = null;

	const messages = writable<Array<{ type: 'ai' | 'user'; content: string; timestamp: number }>>([]);
	const isThinking = writable(false);
	const inputValue = writable('');
	let isVisible = false;
	let animationFrameId: number | null = null;

	// Pre-programmed questions and responses
	const quickQuestions = [
		{ id: 'start', label: 'Start Project', response: 'To begin a project, we recommend starting with a discovery call. During this session, we\'ll explore your vision, technical requirements, and creative direction. Our team specializes in cutting-edge digital experiences, and we\'re excited to discuss how we can bring your ideas to life.' },
		{ id: 'pricing', label: 'Pricing', response: 'Our pricing is tailored to each project\'s unique scope and complexity. We offer flexible engagement models—from fixed-price projects to retainer-based partnerships. Most projects range from $50K to $500K+, depending on scale and requirements. Let\'s schedule a call to discuss your specific needs and provide a detailed quote.' },
		{ id: 'support', label: 'Support', response: 'We provide comprehensive support throughout the entire project lifecycle and beyond. Our support includes maintenance packages, performance optimization, feature enhancements, and technical consulting. We\'re committed to your long-term success and ensure your digital experience continues to evolve with your needs.' }
	];

	let isThinkingValue = false;
	let messagesValue: Array<{ type: 'ai' | 'user'; content: string; timestamp: number }> = [];

	// Subscribe to stores for use in functions
	let unsubscribeMessages: () => void;
	let unsubscribeThinking: () => void;

	// Typewriter placeholder effect
	const placeholderPhrases = [
		'Type your message...',
		'Ask about our rates...',
		'Start a new project...',
		'Talk to support...'
	];
	let currentPlaceholder = placeholderPhrases[0];
	let placeholderIndex = 0;
	let charIndex = 0;
	let isDeleting = false;
	let placeholderInterval: ReturnType<typeof setInterval> | null = null;

	function updatePlaceholder() {
		if (!browser || !inputRef || document.activeElement === inputRef) return;

		const phrase = placeholderPhrases[placeholderIndex];

		if (isDeleting) {
			charIndex--;
			currentPlaceholder = phrase.substring(0, charIndex);
		} else {
			charIndex++;
			currentPlaceholder = phrase.substring(0, charIndex);
		}

		if (!isDeleting && charIndex === phrase.length) {
			setTimeout(() => {
				isDeleting = true;
			}, 2000);
		} else if (isDeleting && charIndex === 0) {
			isDeleting = false;
			placeholderIndex = (placeholderIndex + 1) % placeholderPhrases.length;
		}
	}

	function startPlaceholderAnimation() {
		if (placeholderInterval) clearInterval(placeholderInterval);
		currentPlaceholder = '';
		charIndex = 0;
		placeholderIndex = 0;
		isDeleting = false;
		placeholderInterval = setInterval(updatePlaceholder, 100);
	}

	function stopPlaceholderAnimation() {
		if (placeholderInterval) {
			clearInterval(placeholderInterval);
			placeholderInterval = null;
		}
		currentPlaceholder = placeholderPhrases[0];
		charIndex = 0;
		placeholderIndex = 0;
		isDeleting = false;
	}

	// Waveform animation
	function animateWaveform() {
		if (!waveformCtx || !waveformCanvas) return;

		const width = waveformCanvas.width;
		const height = waveformCanvas.height;

		function draw() {
			if (!waveformCtx) return;
			
			waveformCtx.clearRect(0, 0, width, height);
			
			if (isThinkingValue) {
				waveformCtx.fillStyle = '#22c55e';
				const bars = 20;
				const barWidth = width / bars;
				const centerY = height / 2;

				for (let i = 0; i < bars; i++) {
					const barHeight = (Math.sin(Date.now() * 0.005 + i * 0.5) * 0.5 + 0.5) * height * 0.6;
					const x = i * barWidth;
					
					waveformCtx.fillRect(x + barWidth * 0.3, centerY - barHeight / 2, barWidth * 0.4, barHeight);
				}
			}

			animationFrameId = requestAnimationFrame(draw);
		}

		draw();
	}

	// Simulate AI response
	async function sendMessage(content: string) {
		if (!content.trim()) return;

		// Add user message
		messages.update(msgs => [...msgs, { type: 'user', content, timestamp: Date.now() }]);
		inputValue.set('');

		// Simulate AI thinking
		isThinking.set(true);

		// Simulate delay
		await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

		isThinking.set(false);

		// Add AI response
		messages.update(msgs => [...msgs, { type: 'ai', content: getAIResponse(content), timestamp: Date.now() }]);
	}

	function getAIResponse(userMessage: string): string {
		const lowerMsg = userMessage.toLowerCase();
		
		// Check quick questions first
		for (const q of quickQuestions) {
			if (lowerMsg.includes(q.id) || lowerMsg.includes(q.label.toLowerCase())) {
				return q.response;
			}
		}
		
		if (lowerMsg.includes('start') || lowerMsg.includes('project') || lowerMsg.includes('begin')) {
			return quickQuestions[0].response;
		} else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('pricing')) {
			return quickQuestions[1].response;
		} else if (lowerMsg.includes('support') || lowerMsg.includes('help')) {
			return quickQuestions[2].response;
		}

		return 'Thank you for your message. Our team will review your inquiry and respond shortly. In the meantime, feel free to explore our work or schedule a consultation call to discuss your project in detail.';
	}

	function handleQuickQuestion(question: typeof quickQuestions[0]) {
		sendMessage(question.label);
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			inputValue.update(val => {
				const message = val.trim();
				if (message) {
					sendMessage(message);
				}
				return '';
			});
		}
	}

	function openOverlay() {
		if (!overlayRef || !modalRef || !backdropRef || !rippleRef) return;

		// Get orb position
		let orbPos = { x: 0, y: 0, width: 0, height: 0 };
		const unsubscribe = orbPosition.subscribe((pos) => {
			orbPos = pos;
		});
		unsubscribe();

		const centerX = orbPos.x + orbPos.width / 2;
		const centerY = orbPos.y + orbPos.height / 2;

		if (!browser) return;
		
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxDist = Math.max(
			Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)),
			Math.sqrt(Math.pow(viewportWidth - centerX, 2) + Math.pow(centerY, 2)),
			Math.sqrt(Math.pow(centerX, 2) + Math.pow(viewportHeight - centerY, 2)),
			Math.sqrt(Math.pow(viewportWidth - centerX, 2) + Math.pow(viewportHeight - centerY, 2))
		);

		// Scale down and blur main content
		if (mainContentRef) {
			gsap.to(mainContentRef, {
				scale: 0.95,
				filter: 'blur(20px)',
				duration: 0.6,
				ease: 'power2.out'
			});
		}

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
		gsap.set(modalRef, { y: 100, opacity: 0, scale: 0.9 });

		// Expand ripple
		gsap.to(rippleRef, {
			width: maxDist * 2,
			height: maxDist * 2,
			duration: 0.8,
			ease: 'power2.inOut',
			onComplete: () => {
				isVisible = true;
				gsap.to(overlayRef, {
					opacity: 1,
					duration: 0.3
				});

				// Spring entrance animation for modal
				gsap.to(modalRef, {
					y: 0,
					opacity: 1,
					scale: 1,
					duration: 0.8,
					ease: 'back.out(1.2)',
					delay: 0.1,
					onComplete: () => {
						startFloatingAnimation();
					}
				});
			}
		});
	}

	function closeOverlay() {
		if (!overlayRef || !modalRef || !rippleRef) return;

		isVisible = false;

		// Stop floating animation
		if (modalRef) {
			modalRef.classList.remove('floating');
		}

		// Scale up and unblur main content
		if (mainContentRef) {
			gsap.to(mainContentRef, {
				scale: 1,
				filter: 'blur(0px)',
				duration: 0.4,
				ease: 'power2.in'
			});
		}

		// Get orb position
		let orbPos = { x: 0, y: 0, width: 0, height: 0 };
		const unsubscribe = orbPosition.subscribe((pos) => {
			orbPos = pos;
		});
		unsubscribe();

		const centerX = orbPos.x + orbPos.width / 2;
		const centerY = orbPos.y + orbPos.height / 2;

		// Fade out modal
		gsap.to(modalRef, {
			y: 50,
			opacity: 0,
			scale: 0.95,
			duration: 0.3,
			ease: 'power2.in',
			onComplete: () => {
				gsap.to(overlayRef, {
					opacity: 0,
					duration: 0.2,
					onComplete: () => {
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
		});
	}

	function handleClose() {
		overlayOpen.set(false);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isVisible) {
			handleClose();
		}
	}

	// Floating animation using CSS class
	function startFloatingAnimation() {
		if (!modalRef) return;
		modalRef.classList.add('floating');
	}

	let unsubscribe: () => void;
	onMount(() => {
		unsubscribeMessages = messages.subscribe(val => { messagesValue = val; });
		unsubscribeThinking = isThinking.subscribe(val => { isThinkingValue = val; });

		unsubscribe = overlayOpen.subscribe((open) => {
			if (open) {
				// Small delay to ensure DOM is ready
				setTimeout(() => {
					if (!browser) return;
					mainContentRef = document.querySelector('main') as HTMLElement;
					if (mainContentRef) {
						openOverlay();
						// Start placeholder animation after modal is visible
						setTimeout(() => {
							if (inputRef && document.activeElement !== inputRef) {
								startPlaceholderAnimation();
							}
						}, 900);
					}
				}, 50);
			} else {
				closeOverlay();
				stopPlaceholderAnimation();
			}
		});
	});

	// Reactive statement to initialize waveform when canvas is available
	$: if (waveformCanvas && !waveformCtx) {
		waveformCtx = waveformCanvas.getContext('2d');
		if (waveformCtx) {
			waveformCanvas.width = 200;
			waveformCanvas.height = 40;
			animateWaveform();
		}
	}

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
		if (unsubscribeMessages) unsubscribeMessages();
		if (unsubscribeThinking) unsubscribeThinking();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		stopPlaceholderAnimation();
		if (mainContentRef) {
			gsap.to(mainContentRef, {
				scale: 1,
				filter: 'blur(0px)',
				duration: 0.4
			});
		}
	});
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if $overlayOpen}
	<div
		bind:this={overlayRef}
		class="ai-concierge-overlay"
		style="display: none; opacity: 0;"
	>
		<!-- Ripple transition layer -->
		<div
			bind:this={rippleRef}
			class="ripple-transition"
		></div>

		<!-- Backdrop -->
		<div bind:this={backdropRef} class="backdrop"></div>

		<!-- Ambient Glow -->
		<div class="ambient-glow"></div>

		<!-- Modal Container -->
		<div bind:this={modalRef} class="modal-container">
			<!-- Noise Texture Overlay -->
			<div class="noise-overlay"></div>
			<!-- Header -->
			<div class="header">
				<div class="status-indicator">
					<div class="pulse-dot"></div>
					<span class="status-text">CONCIERGE_AI</span>
				</div>
			</div>

			<!-- Messages Container -->
			<div class="messages-container">
				{#if $messages.length === 0}
					<div class="welcome-message">
						<div class="welcome-content">
							<div class="ai-icon">◊</div>
							<p class="welcome-text">How can I assist you today?</p>
						</div>
					</div>
				{/if}

				{#each $messages as message (message.timestamp)}
					<div class="message message-{message.type}">
						{#if message.type === 'ai'}
							<div class="ai-message-content">
								<div class="ai-icon">◊</div>
								<div class="message-text">{message.content}</div>
							</div>
						{:else}
							<div class="user-message-content">
								<div class="message-text">{message.content}</div>
							</div>
						{/if}
					</div>
				{/each}

				{#if $isThinking}
					<div class="message message-ai">
						<div class="ai-message-content">
							<div class="ai-icon">◊</div>
							<div class="thinking-container">
								<canvas bind:this={waveformCanvas} class="waveform"></canvas>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Quick Questions -->
			{#if $messages.length === 0}
				<div class="quick-questions">
					{#each quickQuestions as question}
						<button
							class="question-chip"
							on:click={() => handleQuickQuestion(question)}
						>
							{question.label}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Input Area -->
			<div class="input-container">
				<div class="input-wrapper">
					<input
						bind:this={inputRef}
						bind:value={$inputValue}
						on:keydown={handleInputKeydown}
						on:focus={stopPlaceholderAnimation}
						on:blur={() => { if (!$inputValue && $overlayOpen) startPlaceholderAnimation(); }}
						type="text"
						placeholder={currentPlaceholder}
						class="input-field"
					/>
					<div class="input-line"></div>
				</div>
			</div>

			<!-- Close Button -->
			<button
				on:click={handleClose}
				class="close-button"
				aria-label="Close"
			>
				<svg
					width="20"
					height="20"
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
		</div>
	</div>
{/if}

<style>
	.ai-concierge-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		overflow: hidden;
	}

	.ripple-transition {
		position: absolute;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.8);
		pointer-events: none;
		z-index: 10000;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		z-index: 10001;
	}

	.ambient-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 120%;
		max-width: 900px;
		height: 120%;
		max-height: 1000px;
		background: radial-gradient(ellipse at center, rgba(67, 56, 202, 0.15) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
		z-index: 10001;
		filter: blur(60px);
	}

	.modal-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 700px;
		height: 80vh;
		max-height: 800px;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border-radius: 24px;
		box-shadow: 0 0 100px rgba(0, 0, 0, 0.8), 
		            0 0 200px rgba(255, 255, 255, 0.05),
		            inset 0 0 100px rgba(255, 255, 255, 0.02);
		display: flex;
		flex-direction: column;
		z-index: 10002;
		will-change: transform;
		overflow: hidden;
		position: relative;
	}

	.modal-container::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 24px;
		padding: 1px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.05) 40%, transparent 60%);
		-webkit-mask: 
			linear-gradient(#fff 0 0) content-box, 
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: exclude;
		mask: 
			linear-gradient(#fff 0 0) content-box, 
			linear-gradient(#fff 0 0);
		mask-composite: exclude;
		pointer-events: none;
		z-index: 0;
	}

	.noise-overlay {
		position: absolute;
		inset: 0;
		opacity: 0.04;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
		pointer-events: none;
		z-index: 1;
	}

	.modal-container.floating {
		animation: float-modal 3s ease-in-out infinite;
	}

	@keyframes float-modal {
		0%, 100% {
			transform: translate(-50%, calc(-50% + 0px));
		}
		50% {
			transform: translate(-50%, calc(-50% + -10px));
		}
	}

	.header {
		padding: 2rem 2.5rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		position: relative;
		z-index: 2;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.pulse-dot {
		width: 10px;
		height: 10px;
		background: #22c55e;
		border-radius: 50%;
		position: relative;
		animation: breathing 2.5s ease-in-out infinite;
	}

	.pulse-dot::before {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		border: 1px solid rgba(34, 197, 94, 0.4);
		animation: glow-ring 2.5s ease-in-out infinite;
	}

	@keyframes breathing {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
			box-shadow: 0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.3);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.15);
			box-shadow: 0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(34, 197, 94, 0.5);
		}
	}

	@keyframes glow-ring {
		0%, 100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.4);
		}
	}

	.status-text {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		letter-spacing: 0.15em;
		font-weight: 500;
		text-transform: uppercase;
		font-family: 'JetBrains Mono', monospace;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		position: relative;
		z-index: 2;
	}

	.messages-container::-webkit-scrollbar {
		width: 4px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.welcome-message {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.welcome-content {
		text-align: center;
	}

	.welcome-text {
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.125rem;
		margin-top: 1rem;
	}

	.message {
		display: flex;
		width: 100%;
	}

	.message-ai {
		justify-content: flex-start;
	}

	.message-user {
		justify-content: flex-end;
	}

	.ai-message-content {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		max-width: 80%;
	}

	.ai-icon {
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.5rem;
		line-height: 1;
		flex-shrink: 0;
		animation: float-icon 3s ease-in-out infinite;
	}

	@keyframes float-icon {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.user-message-content {
		display: flex;
		justify-content: flex-end;
		max-width: 80%;
	}

	.message-text {
		color: rgba(255, 255, 255, 0.95);
		font-size: 1rem;
		line-height: 1.6;
	}

	.message-user .message-text {
		color: rgba(255, 255, 255, 0.6);
		text-align: right;
	}

	.thinking-container {
		display: flex;
		align-items: center;
		padding: 1rem 0;
	}

	.waveform {
		display: block;
	}

	.quick-questions {
		display: flex;
		gap: 0.75rem;
		padding: 0 2.5rem 1.5rem;
		flex-wrap: wrap;
		position: relative;
		z-index: 2;
	}

	.question-chip {
		padding: 0.625rem 1.25rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}

	.question-chip::before {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0);
		transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: -1;
	}

	.question-chip:hover {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(255, 255, 255, 0.3);
		color: rgba(0, 0, 0, 0.9);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
	}

	.input-container {
		padding: 1.5rem 2.5rem 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		position: relative;
		z-index: 2;
	}

	.input-wrapper {
		position: relative;
	}

	.input-field {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		color: rgba(255, 255, 255, 0.9);
		font-size: 1rem;
		padding: 0.75rem 0;
		caret-color: rgba(255, 255, 255, 0.8);
		font-family: 'JetBrains Mono', monospace;
	}

	.input-field::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.input-line {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
	}

	.input-field:focus ~ .input-line {
		background: rgba(255, 255, 255, 0.6);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
		height: 1.5px;
	}

	.close-button {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10003;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
		transform: rotate(90deg);
	}

	@media (max-width: 768px) {
		.modal-container {
			width: 95%;
			height: 85vh;
			border-radius: 20px;
		}

		.header {
			padding: 1.5rem 1.5rem 1rem;
		}

		.messages-container {
			padding: 1.5rem 1.5rem;
		}

		.input-container {
			padding: 1rem 1.5rem 1.5rem;
		}

		.quick-questions {
			padding: 0 1.5rem 1rem;
		}

		.close-button {
			top: 1rem;
			right: 1rem;
			width: 32px;
			height: 32px;
		}

		.ai-message-content,
		.user-message-content {
			max-width: 90%;
		}
	}
</style>