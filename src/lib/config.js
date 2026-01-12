/**
 * Premium SvelteKit Template - Configuration
 * 
 * This is the central configuration file. Customize these values
 * to match your brand and content.
 */

export const siteConfig = {
	// Site Identity
	siteName: 'NEXT_GEN_AGENCY',
	
	// Navigation Links
	navLinks: [
		{ name: 'Work', href: '/work' },
		{ name: 'Services', href: '#services' },
		{ name: 'About', href: '#work' },
		{ name: 'Contact', href: '#contact' }
	],
	
	// CTA Button Configuration
	ctaButton: {
		text: 'Get Started',
		href: '#contact'
	},
	
	// Hero Section
	hero: {
		headline: 'Crafting Digital Reality',
		subtitle: 'We transform ideas into exceptional digital experiences that drive growth and innovation.',
		videoSrc: '/videos/hero-main-loop.mp4',
		ctaText: 'Explore Our Work'
	},
	
	// Features Section (Horizontal Sticky Scroll)
	features: {
		title: 'What We Offer',
		subtitle: 'Comprehensive solutions tailored to your business needs',
		items: [
			{
				number: '01',
				title: 'Brand Identity',
				description: 'Crafting distinctive visual identities that communicate your brand\'s essence and resonate with your audience. We design systems that are timeless yet forward-thinking.',
				mediaSrc: '/videos/card-architecture-holo.mp4'
			},
			{
				number: '02',
				title: 'Web Development',
				description: 'Building modern, scalable web applications with cutting-edge technologies. From concept to deployment, we deliver high-performance digital experiences that exceed expectations.',
				mediaSrc: '/videos/card-software-flow.mp4'
			},
			{
				number: '03',
				title: 'Digital Strategy',
				description: 'Data-driven insights and strategic planning to elevate your digital presence. We transform complex challenges into clear, actionable roadmaps that maximize ROI.',
				mediaSrc: '/videos/card-engineering-mech.mp4'
			}
		]
	},
	
	// SEO Meta
	meta: {
		title: 'NEXT_GEN_AGENCY - Premium Digital Solutions',
		description: 'Transform your digital presence with cutting-edge solutions and exceptional design.',
		keywords: 'web development, design, digital agency, branding'
	}
};
