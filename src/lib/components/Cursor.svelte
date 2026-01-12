<script lang="ts">
	import { onMount } from "svelte";
	import { spring } from "svelte/motion";
	import { browser } from "$app/environment";
	import { gsap } from "gsap";

	// Spring physics for smooth "liquid" lag
	let coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.15, // Lower = more lag/fluidity
			damping: 0.35, // Lower = more bounce
		},
	);

	let size = spring(10, { stiffness: 0.2, damping: 0.4 });
	let isHovering = false;
	let isClicking = false;

	let cursorRef: HTMLDivElement;
	let isVisible = false;

	onMount(() => {
		if (!browser) return;
		isVisible = true;

		const handleMouseMove = (e: MouseEvent) => {
			coords.set({ x: e.clientX, y: e.clientY });
		};

		const handleMouseDown = () => {
			isClicking = true;
			size.set(25); // Shrink or expand on click
		};

		const handleMouseUp = () => {
			isClicking = false;
			size.set(isHovering ? 50 : 10);
		};

		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Check for interactive elements
			if (
				target.tagName === "A" ||
				target.tagName === "BUTTON" ||
				target.closest("a") ||
				target.closest("button") ||
				target.closest("[data-hover]") ||
				target.style.cursor === "pointer"
			) {
				isHovering = true;
				size.set(50); // Expand significantly
			}
		};

		const handleMouseOut = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				!target.closest("a") &&
				!target.closest("button") &&
				!target.closest("[data-hover]")
			) {
				isHovering = false;
				size.set(10); // Reset size
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mouseover", handleMouseOver);
		document.addEventListener("mouseout", handleMouseOut);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("mouseover", handleMouseOver);
			document.removeEventListener("mouseout", handleMouseOut);
		};
	});
</script>

{#if isVisible}
	<!-- Fluid Cursor Container -->
	<div
		class="fixed pointer-events-none z-[99999] mix-blend-exclusion"
		style="left: 0; top: 0;"
	>
		<!-- Main Blob/Follower -->
		<div
			class="absolute rounded-full bg-white opacity-90 backdrop-blur-[1px] transition-colors duration-300"
			style="
				transform: translate3d({$coords.x}px, {$coords.y}px, 0) translate(-50%, -50%);
				width: {$size}px;
				height: {$size}px;
			"
		></div>

		<!-- Optional: Inner Core Dot (stays sharp) -->
		<div
			class="absolute w-1 h-1 bg-white rounded-full"
			style="
				transform: translate3d({$coords.x}px, {$coords.y}px, 0) translate(-50%, -50%);
			"
		></div>
	</div>
{/if}

<style>
	:global(body) {
		cursor: none !important;
	}

	:global(a),
	:global(button) {
		cursor: none !important;
	}
</style>
