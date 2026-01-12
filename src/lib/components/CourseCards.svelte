<script>
	import { onMount } from 'svelte';

	const courses = [
		{
			id: 1,
			title: 'Yazılım Mühendisliği',
			description: 'Modern yazılım geliştirme teknikleri ve mimarileri',
			category: 'Software',
			video: '/videos/software.webm',
			icon: '💻',
			span: 'col-span-2 row-span-2'
		},
		{
			id: 2,
			title: 'Mimarlık',
			description: 'Dijital ve fiziksel mimari tasarım prensipleri',
			category: 'Architecture',
			video: '/videos/architecture.webm',
			icon: '🏗️',
			span: 'col-span-1 row-span-2'
		},
		{
			id: 3,
			title: 'Mühendislik',
			description: 'İleri seviye mühendislik çözümleri ve inovasyon',
			category: 'Engineering',
			video: '/videos/engineering.webm',
			icon: '⚙️',
			span: 'col-span-1 row-span-1'
		},
		{
			id: 4,
			title: 'AI & Machine Learning',
			description: 'Yapay zeka ve makine öğrenmesi uygulamaları',
			category: 'AI',
			video: '/videos/ai.webm',
			icon: '🤖',
			span: 'col-span-2 row-span-1'
		},
		{
			id: 5,
			title: 'DevOps & Cloud',
			description: 'Bulut altyapısı ve sürekli entegrasyon',
			category: 'DevOps',
			video: '/videos/devops.webm',
			icon: '☁️',
			span: 'col-span-1 row-span-1'
		},
		{
			id: 6,
			title: 'UI/UX Design',
			description: 'Kullanıcı deneyimi ve arayüz tasarımı',
			category: 'Design',
			video: '/videos/design.webm',
			icon: '🎨',
			span: 'col-span-1 row-span-1'
		}
	];

	let hoveredCard = null;

	const handleCardHover = (courseId) => {
		hoveredCard = courseId;
	};

	const handleCardLeave = () => {
		hoveredCard = null;
	};
</script>

<section id="courses" class="py-32 px-4 md:px-8 lg:px-16">
	<div class="max-w-7xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-5xl md:text-6xl font-display font-bold mb-4 text-gradient">
				Programlarımız
			</h2>
			<p class="text-xl text-signal-dim max-w-2xl mx-auto">
				Geleceği şekillendiren teknolojilerde uzmanlaşın
			</p>
		</div>

		<!-- Bento Grid -->
		<div class="grid grid-cols-3 grid-rows-4 gap-4 md:gap-6 auto-rows-fr">
			{#each courses as course}
				<div
					data-hover
					on:mouseenter={() => handleCardHover(course.id)}
					on:mouseleave={handleCardLeave}
					class="group relative glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 {course.span} {hoveredCard === course.id
						? 'scale-105 z-10'
						: 'scale-100'}"
				>
					<!-- Video Background -->
					{#if hoveredCard === course.id}
						<video
							autoplay
							loop
							muted
							playsinline
							class="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-500"
						>
							<source src={course.video} type="video/webm" />
						</video>
					{/if}

					<!-- Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-br from-electric/10 via-transparent to-void transition-opacity duration-500 {hoveredCard === course.id
							? 'opacity-100'
							: 'opacity-50'}"
					></div>

					<!-- Content -->
					<div class="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
						<div>
							<div class="text-4xl md:text-5xl mb-4 transition-transform duration-300 group-hover:scale-125">
								{course.icon}
							</div>
							<h3
								class="text-2xl md:text-3xl font-display font-bold mb-2 text-signal transition-colors duration-300 group-hover:text-electric"
							>
								{course.title}
							</h3>
							<p class="text-signal-dim text-sm md:text-base leading-relaxed">
								{course.description}
							</p>
						</div>

						<div class="mt-6 flex items-center gap-2">
							<span
								class="text-xs font-semibold px-3 py-1 rounded-full bg-electric/20 text-electric border border-electric/30"
							>
								{course.category}
							</span>
							<span
								class="text-electric text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							>
								Keşfet →
							</span>
						</div>
					</div>

					<!-- Hover Glow Effect -->
					<div
						class="absolute inset-0 rounded-2xl border-2 border-electric/0 group-hover:border-electric/50 transition-all duration-500 pointer-events-none"
					></div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	@media (max-width: 768px) {
		:global(#courses .grid) {
			grid-template-columns: 1fr;
			grid-auto-rows: minmax(200px, auto);
		}
		:global(#courses .grid > div) {
			grid-column: span 1 !important;
			grid-row: span 1 !important;
		}
	}
</style>
