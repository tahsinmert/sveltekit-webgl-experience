<script lang="ts">
	export let iconType: 'strategy' | 'design' | 'development' | 'marketing' = 'strategy';
	
	const icons = {
		strategy: `
			<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="3" opacity="0.3"/>
				<circle cx="100" cy="100" r="50" stroke="currentColor" stroke-width="3" opacity="0.5"/>
				<circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.8"/>
				<line x1="100" y1="20" x2="100" y2="50" stroke="currentColor" stroke-width="2" opacity="0.6"/>
				<line x1="100" y1="150" x2="100" y2="180" stroke="currentColor" stroke-width="2" opacity="0.6"/>
				<line x1="20" y1="100" x2="50" y2="100" stroke="currentColor" stroke-width="2" opacity="0.6"/>
				<line x1="150" y1="100" x2="180" y2="100" stroke="currentColor" stroke-width="2" opacity="0.6"/>
				<path d="M 70 70 L 100 100 L 130 130" stroke="currentColor" stroke-width="2.5" opacity="0.7" stroke-linecap="round"/>
				<path d="M 130 70 L 100 100 L 70 130" stroke="currentColor" stroke-width="2.5" opacity="0.7" stroke-linecap="round"/>
			</svg>
		`,
		design: `
			<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="40" y="60" width="120" height="80" rx="8" stroke="currentColor" stroke-width="3" opacity="0.4"/>
				<path d="M 60 100 L 140 100" stroke="currentColor" stroke-width="2.5" opacity="0.6"/>
				<path d="M 80 80 L 120 80" stroke="currentColor" stroke-width="2" opacity="0.5"/>
				<path d="M 80 120 L 120 120" stroke="currentColor" stroke-width="2" opacity="0.5"/>
				<circle cx="100" cy="40" r="15" fill="currentColor" opacity="0.8"/>
				<path d="M 50 160 Q 100 140 150 160" stroke="currentColor" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
				<path d="M 40 50 Q 100 30 160 50" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
			</svg>
		`,
		development: `
			<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="50" y="50" width="100" height="100" rx="4" stroke="currentColor" stroke-width="3" opacity="0.5"/>
				<path d="M 70 80 L 130 80 L 120 110 L 80 110 Z" fill="currentColor" opacity="0.3"/>
				<path d="M 70 120 L 100 100 L 130 120" stroke="currentColor" stroke-width="3" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="100" cy="140" r="8" fill="currentColor" opacity="0.8"/>
				<path d="M 60 40 L 100 20 L 140 40" stroke="currentColor" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>
				<path d="M 40 160 L 100 180 L 160 160" stroke="currentColor" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>
			</svg>
		`,
		marketing: `
			<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M 100 40 L 130 80 L 100 120 L 70 80 Z" fill="currentColor" opacity="0.3"/>
				<path d="M 100 40 L 130 80 L 100 120 L 70 80" stroke="currentColor" stroke-width="3" opacity="0.7"/>
				<circle cx="100" cy="100" r="30" stroke="currentColor" stroke-width="2.5" opacity="0.5"/>
				<circle cx="100" cy="100" r="15" fill="currentColor" opacity="0.8"/>
				<path d="M 60 150 Q 100 130 140 150" stroke="currentColor" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
				<path d="M 50 170 Q 100 150 150 170" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.4" stroke-linecap="round"/>
				<path d="M 100 120 L 100 160" stroke="currentColor" stroke-width="2" opacity="0.5"/>
			</svg>
		`
	};
	
	$: iconSvg = icons[iconType] || icons.strategy;
</script>

<div class="service-icon {iconType}">
	{@html iconSvg}
</div>

<style>
	.service-icon {
		width: 100%;
		height: 100%;
		color: currentColor;
		transform-origin: center;
		transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.service-icon:hover {
		transform: scale(1.1) rotate(5deg);
	}
	
	.service-icon :global(svg) {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.3));
	}
</style>
