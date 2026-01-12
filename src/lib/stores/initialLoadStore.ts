import { writable } from 'svelte/store';

/**
 * Store for managing initial boot sequence state
 * - isInitialLoad: boolean - Whether the initial boot sequence should run
 */
export const isInitialLoad = writable<boolean>(true);

/**
 * Mark initial load as complete (called after boot sequence finishes)
 */
export function completeInitialLoad() {
	isInitialLoad.set(false);
}
