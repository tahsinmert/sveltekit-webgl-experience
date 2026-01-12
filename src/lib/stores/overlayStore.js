import { writable } from 'svelte/store';

export const overlayOpen = writable(false);
export const orbPosition = writable({ x: 0, y: 0, width: 0, height: 0 });
