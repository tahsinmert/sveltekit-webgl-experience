<script lang="ts">
    import { onMount } from "svelte";
    import { gsap } from "gsap";
    import { setUserName } from "$lib/stores/userStore";

    export let onComplete: () => void;

    let inputRef: HTMLInputElement;
    let containerRef: HTMLElement;
    let welcomeRef: HTMLElement;
    let nameValue = "";
    let isSubmitting = false;

    function handleSubmit() {
        if (!nameValue.trim() || isSubmitting) return;
        isSubmitting = true;

        // Save name
        setUserName(nameValue.trim());

        // Animate Out Input
        const tl = gsap.timeline({
            onComplete: () => {
                showWelcome();
            },
        });

        tl.to(".identity-input-group", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in",
        });
    }

    function showWelcome() {
        gsap.set(welcomeRef, { display: "flex" });

        const tl = gsap.timeline({
            onComplete: () => {
                // Final Exit
                gsap.to(containerRef, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        onComplete();
                    },
                });
            },
        });

        const splitName = nameValue.trim().toUpperCase().split("");

        tl.fromTo(
            ".welcome-text",
            { opacity: 0, letterSpacing: "1em", filter: "blur(10px)" },
            {
                opacity: 1,
                letterSpacing: "0.2em",
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power3.out",
            },
        )
            .fromTo(
                ".welcome-name",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
                "-=1",
            )
            .top({}, { duration: 1 }); // Hold
    }

    onMount(() => {
        if (inputRef) inputRef.focus();

        // Intro Animation
        gsap.fromTo(
            ".identity-content",
            { opacity: 0, scale: 0.95 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: 0.2,
            },
        );
    });
</script>

<div
    bind:this={containerRef}
    class="fixed inset-0 z-[10001] bg-black flex items-center justify-center overflow-hidden"
>
    <!-- Grid Background -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div
            class="absolute inset-0"
            style="background-image: radial-gradient(circle, #333 1px, transparent 1px); background-size: 30px 30px;"
        ></div>
    </div>

    <!-- Input Section -->
    <div
        class="identity-input-group identity-content flex flex-col items-center gap-6 w-full max-w-md px-6"
    >
        <div class="font-mono text-xs text-zinc-500 tracking-[0.3em] uppercase">
            Security Clearance Required
        </div>

        <div class="relative w-full">
            <input
                bind:this={inputRef}
                type="text"
                bind:value={nameValue}
                on:keydown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="ENTER AGENT NAME"
                class="w-full bg-transparent border-b border-white/20 py-4 text-center font-display text-3xl md:text-5xl text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500 transition-colors uppercase tracking-wider"
                autocomplete="off"
            />
            <div
                class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 transition-transform duration-500"
                class:scale-x-100={nameValue.length > 0}
            ></div>
        </div>

        <button
            class="group flex items-center gap-2 font-mono text-xs text-white/40 hover:text-cyan-400 transition-colors uppercase tracking-widest mt-4"
            on:click={handleSubmit}
        >
            <span>Initialize Uplink</span>
            <span class="group-hover:translate-x-1 transition-transform"
                >-></span
            >
        </button>
    </div>

    <!-- Welcome Section (Hidden initially) -->
    <div
        bind:this={welcomeRef}
        class="absolute inset-0 hidden flex-col items-center justify-center"
    >
        <div
            class="welcome-text font-mono text-sm md:text-base text-zinc-500 tracking-[0.2em] mb-4"
        >
            ACCESS GRANTED
        </div>
        <div
            class="welcome-name font-display text-6xl md:text-9xl text-white font-bold tracking-tighter uppercase text-center px-4"
        >
            WELCOME, {nameValue}
        </div>
    </div>
</div>
