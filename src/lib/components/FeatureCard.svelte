<script>
	export let title;
	export let category;
	export let description;
	export let videoSrc;
	export let colSpan = 'col-span-1';

	let videoRef;
	let cardRef;
	let isHovered = false;

	const handleMouseEnter = () => {
		isHovered = true;
		if (videoRef) {
			videoRef.play().catch((err) => {
				console.log('Video play prevented:', err);
			});
		}
	};

	const handleMouseLeave = () => {
		isHovered = false;
		if (videoRef) {
			videoRef.pause();
		}
	};
</script>

<div
	bind:this={cardRef}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	data-hover
	class="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border border-gray-200 shadow-sm hover:shadow-xl {colSpan}"
>
	<!-- Video Background -->
	<div class="relative aspect-video overflow-hidden bg-zinc-100">
		<video
			bind:this={videoRef}
			muted
			playsinline
			loop
			class="absolute inset-0 w-full h-full object-cover transition-all duration-500 {isHovered
				? 'opacity-100 grayscale-0'
				: 'opacity-100 grayscale'}"
		>
			<source src={videoSrc} type="video/mp4" />
		</video>
		<!-- Light overlay when paused (for better visibility) -->
		<div
			class="absolute inset-0 bg-white/20 transition-opacity duration-500 {isHovered
				? 'opacity-0'
				: 'opacity-100'}"
		></div>
	</div>

	<!-- Content -->
	<div class="p-6 md:p-8">
		{#if category}
			<span
				class="inline-block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2"
			>
				{category}
			</span>
		{/if}
		<h3 class="text-2xl md:text-3xl font-display font-bold mb-3 text-zinc-900">
			{title}
		</h3>
		<p class="text-zinc-600 text-sm md:text-base leading-relaxed">
			{description}
		</p>
	</div>

	<!-- Hover Border Effect -->
	<div
		class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-600/20 transition-all duration-500 pointer-events-none"
	></div>
</div>
