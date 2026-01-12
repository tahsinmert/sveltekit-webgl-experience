import { writable } from 'svelte/store';

export const userName = writable<string>('');
export const isIdentityVerified = writable<boolean>(false);

export function setUserName(name: string) {
    userName.set(name);
}

export function verifyIdentity() {
    isIdentityVerified.set(true);
}
