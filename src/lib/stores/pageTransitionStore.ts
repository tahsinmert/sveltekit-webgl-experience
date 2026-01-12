import { writable } from 'svelte/store';

interface PageTransitionState {
	isTransitioning: boolean;
	targetRoute: string | null;
}

/**
 * Store for managing page transitions
 * - isTransitioning: boolean - Whether a transition is currently active
 * - targetRoute: string | null - The route to navigate to after transition
 */
export const pageTransition = writable<PageTransitionState>({
	isTransitioning: false,
	targetRoute: null
});

/**
 * Trigger a page transition to the specified route
 * @param route - The route to navigate to
 */
export function triggerPageTransition(route: string) {
	pageTransition.set({
		isTransitioning: true,
		targetRoute: route
	});
}

/**
 * Complete the page transition (called after animation completes)
 */
export function completePageTransition() {
	pageTransition.set({
		isTransitioning: false,
		targetRoute: null
	});
}